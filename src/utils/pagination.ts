import { Book } from "@/types/book";

type PaginationState = {
  chapterIndex: number
  pageIndex: number
  remainingParagraphs: string[]
  isFirstPage: boolean
}

function extractIntoParagraphs(text: string):string[]{
  return text
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean);
}

function findMaxWordsThatFit(
  words: string[],
  fittedParagraphs: string[],
  paragraphHeight: HTMLParagraphElement,
  containerHeight: HTMLDivElement
): number {

  let low = 0;
  let high = words.length;
  let bestFit = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    const candidate = [
      ...fittedParagraphs,
      words.slice(0, mid).join(" ")
    ].join("\n\n");

    paragraphHeight.textContent = candidate;

    if (paragraphHeight.scrollHeight <= containerHeight.clientHeight) {
      bestFit = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestFit;
}

function fitContentIntoPage(
  paragraphs: string[],
  title: string,
  showTitle: boolean,
  titleHeight: HTMLHeadingElement,
  containerHeight: HTMLDivElement,
  paragraphHeight: HTMLParagraphElement,
){
  paragraphHeight.innerText = "";
  titleHeight.innerText = showTitle ? title : "";

  const fittedParagraphs:string[] = [];
  let remainingParagraphs:string[] = [];

  for (let i=0; i<paragraphs.length; i++){
    const paragraph = paragraphs[i];

    const candidateParagraph = [...fittedParagraphs, paragraph].join("\n\n");
    paragraphHeight.innerText = candidateParagraph;

    if (paragraphHeight.scrollHeight > containerHeight.clientHeight ){
      const words = paragraph.split(/\s+/);
      const maxWords = findMaxWordsThatFit(
        words, 
        fittedParagraphs, 
        paragraphHeight, 
        containerHeight
      );

      const fittedWords = words.slice(0, maxWords).join(" ");
      const remainingWords = words.slice(maxWords).join(" ");

      if (fittedWords){
        fittedParagraphs.push(fittedWords);
      }

      if (fittedWords.length === 0){
        return{
          fittedParagraphs,
          remainingParagraphs: paragraphs.slice(i),
        };
      }
      remainingParagraphs = [remainingWords, ...paragraphs.slice(i+1)]

      return{
        fittedParagraphs,
        remainingParagraphs
      };
    }
    fittedParagraphs.push(paragraph);
  }
  return{
    fittedParagraphs,
    remainingParagraphs: []
  }
}

// export function paginateByHeight(
//   chapters: Book["chapters"],
//   titleHeight: HTMLHeadingElement,
//   containerHeight: HTMLDivElement,
//   paragraphHeight: HTMLParagraphElement
// ){
//   const pages = [{ id: "blank", title: "", fullText: "" }];

//   chapters.forEach((chapter) => {
//     let remainingParagraphs:string[] = extractIntoParagraphs(chapter.fullText);
//     let isFirstPage = true;
//     let pageIndex = 0;

//     while (remainingParagraphs.length > 0){
//       const { fittedParagraphs, remainingParagraphs:nextParagraphs } = fitContentIntoPage(
//         remainingParagraphs,
//         chapter.title,
//         isFirstPage,
//         titleHeight,
//         containerHeight,
//         paragraphHeight
//       );
      
//       pages.push({
//         id: `${chapter.id}--page--${pageIndex}`,
//         title: isFirstPage ? chapter.title : "",
//         fullText: fittedParagraphs.join("\n\n")
//       });
      
//       remainingParagraphs = nextParagraphs;
      
//       pageIndex ++;
//       isFirstPage = false;

//     };
//   });
//   return pages;
// }

export function generateNextPage(
  chapters: Book["chapters"],
  state: PaginationState,
  titleHeight: HTMLHeadingElement,
  containerHeight: HTMLDivElement,
  paragraphHeight: HTMLParagraphElement
) {

  if (state.chapterIndex >= chapters.length) {
    return null;
  }

  const chapter = chapters[state.chapterIndex];

  if (state.remainingParagraphs.length === 0) {
    state.remainingParagraphs = extractIntoParagraphs(chapter.fullText);
  }

  const { fittedParagraphs, remainingParagraphs } = fitContentIntoPage(
    state.remainingParagraphs,
    chapter.title,
    state.isFirstPage,
    titleHeight,
    containerHeight,
    paragraphHeight
  );

  const page = {
    id: `${chapter.id}--page--${state.pageIndex}`,
    title: state.isFirstPage ? chapter.title : "",
    fullText: fittedParagraphs.join("\n\n")
  };

  state.remainingParagraphs = remainingParagraphs;
  state.pageIndex += 1;
  state.isFirstPage = false;

  if (remainingParagraphs.length === 0) {
    state.chapterIndex += 1;
    state.pageIndex = 0;
    state.isFirstPage = true;
  }

  return page;
}