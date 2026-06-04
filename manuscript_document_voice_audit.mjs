import fs from "node:fs";

const manuscript = JSON.parse(fs.readFileSync("src/data/manuscript.json", "utf8"));

const documentMarkers = [
  "advisory",
  "archive",
  "black ink",
  "cipher",
  "confiscated",
  "cord",
  "deposition",
  "discarded lyric",
  "dossier",
  "draft",
  "druidic",
  "extract",
  "field order",
  "fragment",
  "heavily crossed out",
  "judicial summary",
  "ledger",
  "letter",
  "memorandum",
  "notation",
  "order",
  "packet",
  "pamphlet",
  "papers",
  "private testimony",
  "proverb",
  "report",
  "seal",
  "song draft",
  "tablet",
  "testimony",
  "translated",
  "verse",
];

const documentPattern = new RegExp(documentMarkers.join("|"), "i");

for (const part of manuscript) {
  for (const chapter of part.chapters) {
    const candidates = [];

    chapter.paragraphs.forEach((paragraph, index) => {
      if (paragraph !== "---" && documentPattern.test(paragraph)) {
        candidates.push({ index, paragraph });
      }
    });

    if (candidates.length === 0) continue;

    console.log(`CH ${chapter.chapter_id} ${chapter.chapter_title}`);
    for (const candidate of candidates) {
      console.log(
        `p${candidate.index}: ${candidate.paragraph.slice(0, 260)}`
      );
    }
    console.log("");
  }
}
