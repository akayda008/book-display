export type Chapter = {
    id: string;
    title: string;
    fullText: string
}

export type BookContent =
    | { type: "text"; chapters: Chapter[] }
    | { type: "pages"; pages: string[]; startsWithBlankPage?: boolean };

export type Book = {
    id: string;
    title: string;
    author:string;
    blurb: string;
    aboutAuthor: string;
    content: BookContent;
}