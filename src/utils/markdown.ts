import { marked } from "marked";
import DOMPurify from "dompurify";

export type Align = "left" | "center" | "right" | "justify";

export type FormattedWord = {
  text: string;
  tags: ("strong" | "em")[];
};

export type Block =
  | { type: "heading"; align: Align; html: string }
  | { type: "paragraph"; align: Align; words: FormattedWord[] }
  | { type: "list"; align: Align; ordered: boolean; items: string[] }
  | { type: "blockquote"; align: Align; lines: string[] }
  | { type: "lineblock"; align: Align; lines: { indent: number; html: string }[] };

const ALIGN_FENCE = /^:::\s*(center|right|left|justify)\s*$/i;
const ALIGN_FENCE_END = /^:::\s*$/;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function flattenInlineTokens(
  tokens: ReturnType<typeof marked.Lexer.lexInline>,
  tags: ("strong" | "em")[] = []
): FormattedWord[] {
  const words: FormattedWord[] = [];
  for (const token of tokens) {
    if (token.type === "strong" || token.type === "em") {
      const nextTags: ("strong" | "em")[] = [...tags, token.type];
      const childTokens =
        "tokens" in token && token.tokens ? token.tokens : [];
      words.push(...flattenInlineTokens(childTokens, nextTags));
    } else if ("tokens" in token && token.tokens && token.tokens.length > 0) {
      words.push(...flattenInlineTokens(token.tokens, tags));
    } else {
      const raw = "text" in token ? token.text : token.raw;
      const parts = raw.split(/\s+/).filter(Boolean);
      for (const part of parts) {
        words.push({ text: part, tags });
      }
    }
  }
  return words;
}

/** Tokenizes an inline markdown string (bold/italic only, per this milestone's scope) into words tagged with their open formatting spans. */
export function parseInlineToWords(markdownText: string): FormattedWord[] {
  if (!markdownText.trim()) return [];
  const tokens = marked.Lexer.lexInline(markdownText);
  return flattenInlineTokens(tokens);
}

const TAG_HTML: Record<"strong" | "em", [string, string]> = {
  strong: ["<strong>", "</strong>"],
  em: ["<em>", "</em>"],
};

/** Rebuilds HTML for a run of words, closing and reopening bold/italic spans cleanly at word boundaries. */
export function wordsToHtml(words: FormattedWord[]): string {
  let html = "";
  let openTags: ("strong" | "em")[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let common = 0;
    while (
      common < openTags.length &&
      common < word.tags.length &&
      openTags[common] === word.tags[common]
    ) {
      common++;
    }
    for (let j = openTags.length - 1; j >= common; j--) {
      html += TAG_HTML[openTags[j]][1];
    }
    for (let j = common; j < word.tags.length; j++) {
      html += TAG_HTML[word.tags[j]][0];
    }
    openTags = word.tags;
    html += (i > 0 ? " " : "") + escapeHtml(word.text);
  }
  for (let j = openTags.length - 1; j >= 0; j--) {
    html += TAG_HTML[openTags[j]][1];
  }
  return html;
}

/**
 * Renders inline markdown to HTML and sanitizes it immediately, once — this is
 * the only place raw, un-word-tokenized HTML enters a Block. Sanitizing here
 * (rather than later, separately, at each consumer) covers both the pagination
 * measurement clone's `.innerHTML` write and the final `dangerouslySetInnerHTML`
 * display, since both consume the exact same Block-derived HTML string.
 *
 * DOMPurify needs a real DOM, which isn't available server-side (this function
 * is currently only ever called client-side, from Book.tsx). Rather than pull
 * in jsdom just to run DOMPurify against a path that shouldn't be reachable
 * today, the server-side fallback strips all markup outright and re-escapes
 * the remaining text — no code path here can return unsanitized HTML, even if
 * this ever does get called during SSR later.
 */
function renderInline(text: string): string {
  const html = marked.parseInline(text, { async: false }) as string;
  if (typeof window === "undefined") {
    return escapeHtml(html.replace(/<[^>]*>/g, ""));
  }
  return DOMPurify.sanitize(html);
}

function stripLeading(line: string): string {
  return line.replace(/^[ \t]+/, "");
}

/**
 * Parses one chapter's markdown source into flat, page-fitting-ready blocks.
 * Handles: dedenting, `::: align` fences, `|` poem line-blocks, `##` sub-headings,
 * lists (`-`/`*`/`1.`), blockquotes (`>`), and plain paragraphs.
 */
export function parseChapterBlocks(fullText: string, chapterId: string): Block[] {
  const rawLines = fullText.split("\n");
  const blocks: Block[] = [];

  let i = 0;
  let currentAlign: Align = "justify";
  const alignStack: Align[] = [];

  function pushParagraphLines(lines: string[]) {
    const text = lines.join(" ").trim();
    if (!text) return;
    blocks.push({ type: "paragraph", align: currentAlign, words: parseInlineToWords(text) });
  }

  while (i < rawLines.length) {
    const raw = stripLeading(rawLines[i]);

    if (ALIGN_FENCE.test(raw)) {
      const match = raw.match(ALIGN_FENCE)!;
      alignStack.push(currentAlign);
      currentAlign = match[1].toLowerCase() as Align;
      i++;
      continue;
    }

    if (ALIGN_FENCE_END.test(raw)) {
      if (alignStack.length === 0) {
        // Stray closing fence with no opener - ignore, not an unclosed-fence case.
        i++;
        continue;
      }
      currentAlign = alignStack.pop()!;
      i++;
      continue;
    }

    if (!raw.trim()) {
      i++;
      continue;
    }

    // Heading (one level: ##)
    if (/^##\s+/.test(raw)) {
      const headingText = raw.replace(/^##\s+/, "").trim();
      blocks.push({ type: "heading", align: currentAlign, html: renderInline(headingText) });
      i++;
      continue;
    }

    // Poem line-block: consecutive lines starting with |
    if (raw.startsWith("|")) {
      const lines: { indent: number; html: string }[] = [];
      while (i < rawLines.length) {
        const lineRaw = stripLeading(rawLines[i]);
        if (!lineRaw.startsWith("|")) break;
        const afterPipe = lineRaw.slice(1);
        const indentMatch = afterPipe.match(/^ */);
        const indent = indentMatch ? indentMatch[0].length : 0;
        const content = afterPipe.trim();
        lines.push({ indent, html: renderInline(content) });
        i++;
      }
      blocks.push({ type: "lineblock", align: currentAlign, lines });
      continue;
    }

    // Blockquote: consecutive lines starting with >
    if (raw.startsWith(">")) {
      const lines: string[] = [];
      while (i < rawLines.length) {
        const lineRaw = stripLeading(rawLines[i]);
        if (!lineRaw.startsWith(">")) break;
        const content = lineRaw.replace(/^>\s?/, "").trim();
        if (content) lines.push(renderInline(content));
        i++;
      }
      blocks.push({ type: "blockquote", align: currentAlign, lines });
      continue;
    }

    // List: consecutive lines starting with -, *, or "N. "
    if (/^([-*]\s+|\d+\.\s+)/.test(raw)) {
      const ordered = /^\d+\.\s+/.test(raw);
      const items: string[] = [];
      while (i < rawLines.length) {
        const lineRaw = stripLeading(rawLines[i]);
        const isItem = ordered
          ? /^\d+\.\s+/.test(lineRaw)
          : /^[-*]\s+/.test(lineRaw);
        // Known limitation: a line that doesn't start a new item ends the list here,
        // so a list item can't be manually word-wrapped across multiple source lines
        // (it becomes a separate paragraph instead). Single-line items only.
        if (!isItem) break;
        const content = lineRaw.replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, "").trim();
        items.push(renderInline(content));
        i++;
      }
      blocks.push({ type: "list", align: currentAlign, ordered, items });
      continue;
    }

    // Plain paragraph: consecutive non-blank, non-special lines
    const paraLines: string[] = [];
    while (i < rawLines.length) {
      const lineRaw = stripLeading(rawLines[i]);
      if (
        !lineRaw.trim() ||
        lineRaw.startsWith("|") ||
        lineRaw.startsWith(">") ||
        /^##\s+/.test(lineRaw) ||
        /^([-*]\s+|\d+\.\s+)/.test(lineRaw) ||
        ALIGN_FENCE.test(lineRaw) ||
        ALIGN_FENCE_END.test(lineRaw)
      ) {
        break;
      }
      paraLines.push(lineRaw.trim());
      i++;
    }
    pushParagraphLines(paraLines);
  }

  if (alignStack.length > 0 && typeof console !== "undefined") {
    console.warn(
      `[book-display] Chapter "${chapterId}" has an unclosed ":::" alignment fence — content after it may be mis-aligned.`
    );
  }

  return blocks;
}
