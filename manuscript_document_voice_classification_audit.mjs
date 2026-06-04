import fs from "node:fs";

const manuscript = JSON.parse(fs.readFileSync("src/data/manuscript.json", "utf8"));

const DOCUMENT_VOICE_PARAGRAPHS = {
  4: [214],
  8: [5, 7, 11, 12],
  17: [224, 225, 226, 227, 228, 229, 230, 231, 232],
  18: [0],
  19: [0],
  20: [0],
  21: [0],
  22: [0],
  23: [0],
  24: [0, 81, 82, 85, 87, 95, 96, 100, 101, 216, 229, 230],
  25: [0],
  30: [0, 84, 85, 86, 87, 88],
  32: [0, 1, 2, 162],
  33: [0],
  34: [0],
  35: [0],
  36: [0, 1],
  37: [0],
  38: [0],
  39: [0, 1, 2, 3],
  40: [0, 1, 2],
  41: [0, 199],
  42: [0, 144],
};

let total = 0;
for (const part of manuscript) {
  for (const chapter of part.chapters) {
    const indexes = DOCUMENT_VOICE_PARAGRAPHS[chapter.chapter_id] ?? [];
    if (indexes.length === 0) continue;

    total += indexes.length;
    console.log(`CH ${chapter.chapter_id} ${chapter.chapter_title}: ${indexes.length}`);
    for (const index of indexes) {
      const paragraph = chapter.paragraphs[index];
      console.log(`p${index}: ${paragraph?.slice(0, 220) ?? "[missing paragraph]"}`);
    }
    console.log("");
  }
}

console.log(`document_voice_paragraphs=${total}`);
