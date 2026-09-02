import { Book } from "@/types/book";
import {
  Align,
  Block,
  FormattedWord,
  parseChapterBlocks,
  wordsToHtml,
} from "./markdown";

type PaginationState = {
  chapterIndex: number;
  pageIndex: number;
  remainingBlocks: Block[];
  isFirstPage: boolean;
};

export function createPaginationState(): PaginationState {
  return {
    chapterIndex: 0,
    pageIndex: 0,
    remainingBlocks: [],
    isFirstPage: true,
  };
}

function styleAttr(align: Align, extra = ""): string {
  return ` style="text-align:${align};${extra}"`;
}

function renderHeading(block: Extract<Block, { type: "heading" }>): string {
  return `<h3${styleAttr(block.align, "font-size:1.25em;font-weight:600;margin:0.75em 0 0.5em")}>${block.html}</h3>`;
}

function renderParagraph(align: Align, words: FormattedWord[]): string {
  return `<p${styleAttr(align, "margin:0 0 0.75em")}>${wordsToHtml(words)}</p>`;
}

function renderList(block: Extract<Block, { type: "list" }>, items: string[]): string {
  const tag = block.ordered ? "ol" : "ul";
  const listStyle = block.ordered ? "decimal" : "disc";
  const inner = items
    .map((item) => `<li style="margin-bottom:0.25em">${item}</li>`)
    .join("");
  return `<${tag}${styleAttr(
    block.align,
    `list-style:${listStyle};padding-left:1.5em;margin:0.5em 0`
  )}>${inner}</${tag}>`;
}

function renderBlockquote(align: Align, lines: string[]): string {
  const inner = lines
    .map((line) => `<p style="margin:0 0 0.25em">${line}</p>`)
    .join("");
  return `<blockquote${styleAttr(
    align,
    "border-left:3px solid currentColor;padding-left:1em;margin:0.5em 0;font-style:italic;opacity:0.85"
  )}>${inner}</blockquote>`;
}

function renderLineBlock(
  align: Align,
  lines: { indent: number; html: string }[]
): string {
  const inner = lines
    .map(
      (line) =>
        `<div style="padding-left:${line.indent}ch">${line.html || "&nbsp;"}</div>`
    )
    .join("");
  return `<div${styleAttr(align, "margin:0.5em 0")}>${inner}</div>`;
}

/** Measures a whole HTML candidate (already-fitted content + this addition) against the page container. */
function fits(
  candidateHtml: string,
  paragraphHeight: HTMLDivElement,
  containerHeight: HTMLDivElement
): boolean {
  paragraphHeight.innerHTML = candidateHtml;
  return paragraphHeight.scrollHeight <= containerHeight.clientHeight;
}

/** Binary-searches the largest prefix of `items` whose rendered candidate still fits the page. */
function findMaxItemsThatFit<T>(
  items: T[],
  fittedHtml: string,
  render: (subset: T[]) => string,
  paragraphHeight: HTMLDivElement,
  containerHeight: HTMLDivElement
): number {
  let low = 0;
  let high = items.length;
  let bestFit = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = fittedHtml + render(items.slice(0, mid));

    if (fits(candidate, paragraphHeight, containerHeight)) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestFit;
}

/** Word-level case of `findMaxItemsThatFit`: how many words of a paragraph fit. */
function findMaxWordsThatFit(
  words: FormattedWord[],
  align: Align,
  fittedHtml: string,
  paragraphHeight: HTMLDivElement,
  containerHeight: HTMLDivElement
): number {
  return findMaxItemsThatFit(
    words,
    fittedHtml,
    (subset) => renderParagraph(align, subset),
    paragraphHeight,
    containerHeight
  );
}

/**
 * Shared fitting logic for blocks made of atomic items (list items, blockquote
 * lines, poem lines): try the whole block first, then binary-search how many
 * items fit, splitting only at item boundaries. `remainingBlocks: null` means
 * the whole block fit and the caller should keep going through `blocks`.
 */
function fitAtomicItemsBlock<T>(
  items: T[],
  fittedHtml: string,
  restBlocks: Block[],
  render: (subset: T[]) => string,
  rebuildBlock: (remainingItems: T[]) => Block,
  paragraphHeight: HTMLDivElement,
  containerHeight: HTMLDivElement
): { fittedHtml: string; remainingBlocks: Block[] | null } {
  // An item-less block (e.g. a blockquote whose every line was blank) has nothing
  // to render - skip it entirely rather than emitting an empty styled container.
  if (items.length === 0) {
    return { fittedHtml, remainingBlocks: null };
  }

  const whole = fittedHtml + render(items);
  if (fits(whole, paragraphHeight, containerHeight)) {
    return { fittedHtml: whole, remainingBlocks: null };
  }

  const maxItems = findMaxItemsThatFit(items, fittedHtml, render, paragraphHeight, containerHeight);
  const itemsToPlace = fittedHtml.length === 0 && maxItems === 0 ? 1 : maxItems;

  const nextHtml = itemsToPlace > 0 ? fittedHtml + render(items.slice(0, itemsToPlace)) : fittedHtml;
  const remainingItems = items.slice(itemsToPlace);
  const remainingBlocks =
    remainingItems.length > 0 ? [rebuildBlock(remainingItems), ...restBlocks] : restBlocks;

  return { fittedHtml: nextHtml, remainingBlocks };
}

function fitContentIntoPage(
  blocks: Block[],
  title: string,
  showTitle: boolean,
  titleHeight: HTMLHeadingElement,
  containerHeight: HTMLDivElement,
  paragraphHeight: HTMLDivElement
): { fittedHtml: string; remainingBlocks: Block[] } {
  paragraphHeight.innerHTML = "";
  titleHeight.innerText = showTitle ? title : "";

  let fittedHtml = "";
  const pageIsEmpty = () => fittedHtml.length === 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.type === "heading") {
      const html = renderHeading(block);
      const candidate = fittedHtml + html;
      if (fits(candidate, paragraphHeight, containerHeight) || pageIsEmpty()) {
        fittedHtml = candidate;
        continue;
      }
      return { fittedHtml, remainingBlocks: blocks.slice(i) };
    }

    if (block.type === "paragraph") {
      const whole = fittedHtml + renderParagraph(block.align, block.words);
      if (fits(whole, paragraphHeight, containerHeight)) {
        fittedHtml = whole;
        continue;
      }

      const maxWords = findMaxWordsThatFit(
        block.words,
        block.align,
        fittedHtml,
        paragraphHeight,
        containerHeight
      );
      const wordsToPlace = pageIsEmpty() && maxWords === 0 ? 1 : maxWords;

      if (wordsToPlace > 0) {
        fittedHtml += renderParagraph(block.align, block.words.slice(0, wordsToPlace));
      }

      const remainingWords = block.words.slice(wordsToPlace);
      const remainder: Block[] =
        remainingWords.length > 0
          ? [{ type: "paragraph", align: block.align, words: remainingWords }, ...blocks.slice(i + 1)]
          : blocks.slice(i + 1);

      return { fittedHtml, remainingBlocks: remainder };
    }

    if (block.type === "list") {
      const result = fitAtomicItemsBlock(
        block.items,
        fittedHtml,
        blocks.slice(i + 1),
        (subset) => renderList(block, subset),
        (remainingItems) => ({ ...block, items: remainingItems }),
        paragraphHeight,
        containerHeight
      );
      if (result.remainingBlocks === null) {
        fittedHtml = result.fittedHtml;
        continue;
      }
      return { fittedHtml: result.fittedHtml, remainingBlocks: result.remainingBlocks };
    }

    if (block.type === "blockquote") {
      const result = fitAtomicItemsBlock(
        block.lines,
        fittedHtml,
        blocks.slice(i + 1),
        (subset) => renderBlockquote(block.align, subset),
        (remainingLines) => ({ ...block, lines: remainingLines }),
        paragraphHeight,
        containerHeight
      );
      if (result.remainingBlocks === null) {
        fittedHtml = result.fittedHtml;
        continue;
      }
      return { fittedHtml: result.fittedHtml, remainingBlocks: result.remainingBlocks };
    }

    if (block.type === "lineblock") {
      const result = fitAtomicItemsBlock(
        block.lines,
        fittedHtml,
        blocks.slice(i + 1),
        (subset) => renderLineBlock(block.align, subset),
        (remainingLines) => ({ ...block, lines: remainingLines }),
        paragraphHeight,
        containerHeight
      );
      if (result.remainingBlocks === null) {
        fittedHtml = result.fittedHtml;
        continue;
      }
      return { fittedHtml: result.fittedHtml, remainingBlocks: result.remainingBlocks };
    }
  }

  return { fittedHtml, remainingBlocks: [] };
}

export function generateNextPage(
  chapters: Book["chapters"],
  state: PaginationState,
  titleHeight: HTMLHeadingElement,
  containerHeight: HTMLDivElement,
  paragraphHeight: HTMLDivElement
) {
  if (state.chapterIndex >= chapters.length) {
    return null;
  }

  const chapter = chapters[state.chapterIndex];

  if (state.remainingBlocks.length === 0) {
    state.remainingBlocks = parseChapterBlocks(chapter.fullText, chapter.id);
  }

  const { fittedHtml, remainingBlocks } = fitContentIntoPage(
    state.remainingBlocks,
    chapter.title,
    state.isFirstPage,
    titleHeight,
    containerHeight,
    paragraphHeight
  );

  const page = {
    id: `${chapter.id}--page--${state.pageIndex}`,
    title: state.isFirstPage ? chapter.title : "",
    html: fittedHtml,
  };

  state.remainingBlocks = remainingBlocks;
  state.pageIndex += 1;
  state.isFirstPage = false;

  if (remainingBlocks.length === 0) {
    state.chapterIndex += 1;
    state.pageIndex = 0;
    state.isFirstPage = true;
  }

  return page;
}
