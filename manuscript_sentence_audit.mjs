import fs from 'node:fs';

const manuscript = JSON.parse(fs.readFileSync('src/data/manuscript.json', 'utf8'));
const sentenceMap = new Map();

for (const part of manuscript) {
  for (const chapter of part.chapters) {
    for (const paragraph of chapter.paragraphs) {
      if (paragraph === '---') continue;

      for (const sentence of String(paragraph).split(/(?<=[.!?])\s+/)) {
        const clean = sentence.trim().replace(/^['"“”]+|['"“”]+$/g, '');
        const words = clean.split(/\s+/).filter(Boolean);
        if (words.length < 8) continue;

        const key = clean
          .toLowerCase()
          .replace(/[^a-z0-9' ]/g, '')
          .replace(/\s+/g, ' ');

        if (!sentenceMap.has(key)) sentenceMap.set(key, []);
        sentenceMap.get(key).push({
          chapter: chapter.chapter_id,
          title: chapter.chapter_title,
          sentence: clean,
        });
      }
    }
  }
}

const repeated = [...sentenceMap.values()]
  .filter((items) => items.length > 1)
  .sort((a, b) => b.length - a.length);

console.log(`repeated_sentences_min8=${repeated.length}`);
for (const group of repeated.slice(0, 12)) {
  console.log(
    `${group.length}x ch ${group.map((item) => item.chapter).join(',')} :: ${group[0].sentence.slice(0, 160)}`
  );
}
