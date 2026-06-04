import fs from "node:fs";

const FILES = [
  "src/data/manuscript.json",
  "manuscript.json",
  "src/data/manuscript_temp.json",
];

const WRITE = process.argv.includes("--write");

const countWords = (text) => text.split(/\s+/).filter(Boolean).length;
const hasDialogue = (text) => /["“”]/.test(text);

const sentenceEndings =
  /[^.!?]+(?:[.!?]+["”']?|$)(?=\s+|$)|[^.!?]+$/g;

function splitIntoSentences(paragraph) {
  const sentences = paragraph.match(sentenceEndings) ?? [paragraph];
  return sentences.map((sentence) => sentence.trim()).filter(Boolean);
}

function splitParagraph(paragraph, maxWords, softMinWords) {
  const wordCount = countWords(paragraph);
  if (wordCount <= maxWords) return [paragraph];

  const sentences = splitIntoSentences(paragraph);
  if (sentences.length < 2) return [paragraph];

  const groups = [];
  let current = [];
  let currentWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    const wouldExceed = currentWords > 0 && currentWords + sentenceWords > maxWords;
    const hasEnoughWeight = currentWords >= softMinWords;

    if (wouldExceed && hasEnoughWeight) {
      groups.push(current.join(" "));
      current = [sentence];
      currentWords = sentenceWords;
    } else {
      current.push(sentence);
      currentWords += sentenceWords;
    }
  }

  if (current.length > 0) groups.push(current.join(" "));

  if (groups.length <= 1) return [paragraph];

  const splitWordCount = groups.reduce((total, group) => total + countWords(group), 0);
  if (splitWordCount !== wordCount) {
    throw new Error(
      `Refusing to split paragraph because word count changed ` +
        `from ${wordCount} to ${splitWordCount}: ${paragraph.slice(0, 120)}`
    );
  }

  return groups;
}

function thresholdsFor(partId, paragraph) {
  if (partId === 6) {
    return hasDialogue(paragraph)
      ? { maxWords: 78, softMinWords: 34 }
      : { maxWords: 72, softMinWords: 34 };
  }

  return hasDialogue(paragraph)
    ? { maxWords: 96, softMinWords: 42 }
    : { maxWords: 104, softMinWords: 45 };
}

function reflowManuscript(data) {
  const stats = new Map();

  for (const part of data) {
    const partStats = {
      splitParagraphs: 0,
      addedParagraphs: 0,
      dialogueSplits: 0,
      chapters: new Map(),
    };

    for (const chapter of part.chapters) {
      const chapterStats = { splitParagraphs: 0, addedParagraphs: 0 };
      const nextParagraphs = [];

      for (const paragraph of chapter.paragraphs) {
        if (paragraph === "---") {
          nextParagraphs.push(paragraph);
          continue;
        }

        const { maxWords, softMinWords } = thresholdsFor(part.part_id, paragraph);
        const split = splitParagraph(paragraph, maxWords, softMinWords);

        if (split.length > 1) {
          partStats.splitParagraphs += 1;
          partStats.addedParagraphs += split.length - 1;
          chapterStats.splitParagraphs += 1;
          chapterStats.addedParagraphs += split.length - 1;
          if (hasDialogue(paragraph)) partStats.dialogueSplits += 1;
        }

        nextParagraphs.push(...split);
      }

      chapter.paragraphs = nextParagraphs;
      if (chapterStats.splitParagraphs > 0) {
        partStats.chapters.set(chapter.chapter_id, chapterStats);
      }
    }

    stats.set(part.part_id, partStats);
  }

  return stats;
}

for (const file of FILES) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const stats = reflowManuscript(data);

  console.log(file);
  for (const part of data) {
    const partStats = stats.get(part.part_id);
    console.log(
      `${part.part_title}: split=${partStats.splitParagraphs} ` +
        `added=${partStats.addedParagraphs} dialogue=${partStats.dialogueSplits}`
    );
  }
  console.log("");

  if (WRITE) {
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  }
}

if (!WRITE) {
  console.log("Dry run only. Re-run with --write to update manuscript files.");
}
