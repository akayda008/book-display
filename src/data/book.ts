import { Chapter, Book } from "@/types/book";

const chapter1: Chapter = {
  id: "book1_chapter1",
  title: "The Quiet Library",
  fullText: `
The library was never truly silent.

Even in the stillness of late evening, when the last of the students had left and the heavy wooden doors had been shut, something remained. The faint hum of memory. The scent of aged parchment. The low whisper of stories waiting to be read.

Akaash often found himself drawn to the farthest corner of the old hall, where a single brass lamp cast a pool of golden light onto a desk worn smooth by decades of quiet ambition. The shelves towered around him like ancient guardians, their shadows dancing softly against the stone walls.

He did not come here merely to read.

He came to listen.

For in that quiet, between the turning of pages and the settling of dust, he began to understand something important: stories were not written to impress the world. They were written to understand it.

And perhaps, to understand oneself.
  `,
};

const chapter2: Chapter = {
  id: "book1_chapter2",
  title: "The Weight of a Blank Page",
  fullText: `
There is a peculiar weight to a blank page.

It does not accuse. It does not judge. And yet, it demands courage.

Akaash stared at the empty space before him, fingers resting lightly on the keyboard. The cursor blinked patiently, like a metronome measuring hesitation. Outside, the rain traced uneven paths down the window, blurring the world beyond into soft streaks of grey.

He had always believed that learning required movement — action over contemplation. But this moment felt different. This moment required stillness. A willingness to begin without certainty.

He typed a single sentence.

Then another.

Not because they were perfect. Not because they were profound. But because they existed.

And in their existence, they proved something simple yet powerful:

The only way forward is through.
  `,
};

export const book1 : Book = {
    id: "book1",
    title: "Anthology",
    author: "J Akaash",
    blurb: "This book is a compilation of all the stories that Akaash has written over the years.",
    aboutAuthor: "Akaash is a young writer who is trying to find his voice while he is learning tech.",
    chapters: [chapter1, chapter2]
}