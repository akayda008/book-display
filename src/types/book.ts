export type Chapter = {
    id: string;
    title: string;
    fullText: string
}

export type Book = {
    id: string;
    title: string;
    author:string;
    blurb: string;
    aboutAuthor: string;
    chapters: Chapter[];
}