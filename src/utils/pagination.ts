import { Book } from "@/types/book";

function fitTextIntoPage(
  text: string,
  title: string,
  showTitle: boolean,
  measuredTitleHeight: HTMLHeadingElement,
  measureTextContainerHeight: HTMLDivElement,
  measureTextParagraphHeight: HTMLParagraphElement
){
  measureTextParagraphHeight.innerText = "";
  measuredTitleHeight.innerText = showTitle ? title:"";

  const words = text.split(" ");
  const fittedWords:string[] = [];

  for (const word of words){
    fittedWords.push(word)
    measureTextParagraphHeight.innerText = fittedWords.join(" ").trimEnd();

    if (measureTextParagraphHeight.scrollHeight > measureTextContainerHeight.clientHeight){
      fittedWords.pop()
      break;
    }
  }

  return {
    fittedText: fittedWords.join(" ").trimEnd(),
    remaining: words.slice(fittedWords.length).join(" ")
  }
}

export function paginateByHeight(
  chapters: Book["chapters"],
  measuredTitleHeight: HTMLHeadingElement,
  measureTextContainerHeight: HTMLDivElement,
  measureTextParagraphHeight: HTMLParagraphElement
){
  const pages = [{ id: "blank", title: "", fullText: "" }];

  chapters.forEach((chapter) => {
    let remainingText = chapter.fullText;
    let isFirstPage = true;
    let pageIndex = 0;

    while (remainingText.length > 0){
      const { fittedText, remaining } = fitTextIntoPage(
        remainingText,
        chapter.title,
        isFirstPage,
        measuredTitleHeight,
        measureTextContainerHeight,
        measureTextParagraphHeight
      );
      pages.push({
        id: chapter.id + "--page--" + pageIndex,
        title: isFirstPage ? chapter.title : "",
        fullText: fittedText
      });
      
      remainingText = remaining;
      pageIndex ++;
      isFirstPage = false;

      if (fittedText.length === 0) break;
    };
  });
  return pages;
}

export function extractIntoParagraphs(text: string):string[]{
  return text.split("\n\n").map(p => p.trim()).filter(Boolean);
}
