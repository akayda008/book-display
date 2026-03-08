import { Book } from "@/types/book";

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

  for (let i=0; i<paragraphs.length; i++){ 
    const paragraph = paragraphs[i];

    const candidateParagraph = [...fittedParagraphs, paragraph].join("\n\n");
    paragraphHeight.innerText = candidateParagraph;

    if (paragraphHeight.scrollHeight <= containerHeight.clientHeight){
      fittedParagraphs.push(paragraph);
      continue;
    }

    const words = paragraph.split(" ");
    const fittedWords:string[] = [];

    for (const word of words){
      fittedWords.push(word);

      const candidateText = [...fittedParagraphs, fittedWords.join(" ")].join("\n\n");
      paragraphHeight.innerText = candidateText;

      if(paragraphHeight.scrollHeight > containerHeight.clientHeight){
        fittedWords.pop();
        break;
      }
    }

    if (fittedWords.length === 0){
      return{
        fittedText: fittedParagraphs.join("\n\n"),
        remainingParagraphs: paragraphs.slice(i),
      }
    }

    const partialParagraph = fittedWords.join(" ");
    const remainingWords = words.slice(fittedWords.length).join(" ");

    fittedParagraphs.push(partialParagraph);

    return{
      fittedText: fittedParagraphs.join("\n\n"),
      remainingParagraphs: [
        remainingWords,
        ...paragraphs.slice(i+1)
      ]
    };
  }
  return {
    fittedText: fittedParagraphs.join("\n\n"),
    remainingParagraphs: []
  };
}

export function paginateByHeight(
  chapters: Book["chapters"],
  titleHeight: HTMLHeadingElement,
  containerHeight: HTMLDivElement,
  paragraphHeight: HTMLParagraphElement
){
  const pages = [{ id: "blank", title: "", fullText: "" }];

  chapters.forEach((chapter) => {
    let remainingParagraphs:string[] = extractIntoParagraphs(chapter.fullText);
    let isFirstPage = true;
    let pageIndex = 0;

    while (remainingParagraphs.length > 0){
      const { fittedText, remainingParagraphs:nextParagraphs } = fitContentIntoPage(
        remainingParagraphs,
        chapter.title,
        isFirstPage,
        titleHeight,
        containerHeight,
        paragraphHeight
      );
      
      pages.push({
        id: `${chapter.id}--page--${pageIndex}`,
        title: isFirstPage ? chapter.title : "",
        fullText: fittedText
      });
      
      remainingParagraphs = nextParagraphs;
      
      pageIndex ++;
      isFirstPage = false;

    };
  });
  return pages;
}

export function extractIntoParagraphs(text: string):string[]{
  return text
    .split("\n\n")
    .map(p => p.trim())
    .filter(Boolean);
}
