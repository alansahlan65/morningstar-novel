import fs from "node:fs";

const manuscript = JSON.parse(fs.readFileSync("src/data/manuscript.json", "utf8"));

const countWords = (text) => text.split(/\s+/).filter(Boolean).length;
const hasDialogue = (text) => /["“”]/.test(text);
const percentile = (values, ratio) => values[Math.floor(values.length * ratio)] ?? 0;

for (const part of manuscript) {
  const paragraphs = part.chapters.flatMap((chapter) =>
    chapter.paragraphs.filter((paragraph) => paragraph !== "---")
  );
  const wordCounts = paragraphs.map(countWords).sort((a, b) => a - b);
  const dialogueWordCounts = paragraphs
    .filter(hasDialogue)
    .map(countWords)
    .sort((a, b) => a - b);

  const average =
    wordCounts.reduce((total, count) => total + count, 0) / wordCounts.length;
  const longParagraphs = wordCounts.filter((count) => count >= 80).length;
  const veryLongParagraphs = wordCounts.filter((count) => count >= 120).length;
  const longDialogue = dialogueWordCounts.filter((count) => count >= 90).length;

  console.log(`${part.part_title} ${part.part_name}`);
  console.log(
    `paragraphs=${paragraphs.length} avg=${average.toFixed(1)} ` +
      `p75=${percentile(wordCounts, 0.75)} p90=${percentile(wordCounts, 0.9)} ` +
      `max=${wordCounts.at(-1)}`
  );
  console.log(
    `80+ words=${longParagraphs} 120+ words=${veryLongParagraphs} ` +
      `dialogue paragraphs=${dialogueWordCounts.length} dialogue 90+ words=${longDialogue}`
  );
  console.log("");
}
