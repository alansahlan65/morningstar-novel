import fs from "node:fs";

const FILES = [
  "src/data/manuscript.json",
  "manuscript.json",
  "src/data/manuscript_temp.json",
];

const WRITE = process.argv.includes("--write");

function needsContinuationOpening(paragraph, insideQuote) {
  return insideQuote && paragraph !== "---" && !paragraph.trimStart().startsWith('"');
}

function startsOpenQuoteBlock(paragraph) {
  const trimmed = paragraph.trim();
  const quoteCount = (trimmed.match(/"/g) ?? []).length;
  return trimmed.startsWith('"') && quoteCount % 2 !== 0;
}

function closesOpenQuoteBlock(paragraph) {
  const quoteCount = (paragraph.match(/"/g) ?? []).length;
  return quoteCount % 2 === 0;
}

for (const file of FILES) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  let added = 0;
  const locations = [];

  for (const part of data) {
    for (const chapter of part.chapters) {
      let insideQuote = false;

      chapter.paragraphs = chapter.paragraphs.map((paragraph, index) => {
        if (paragraph === "---") {
          insideQuote = false;
          return paragraph;
        }

        let next = paragraph;
        if (needsContinuationOpening(next, insideQuote)) {
          next = `"${next}`;
          added += 1;
          locations.push(`Ch ${chapter.chapter_id} paragraph ${index}`);
        }

        if (insideQuote && closesOpenQuoteBlock(next)) {
          insideQuote = false;
        } else if (!insideQuote && startsOpenQuoteBlock(next)) {
          insideQuote = true;
        }

        return next;
      });
    }
  }

  console.log(`${file}: added ${added} continuation opening quotes`);
  if (locations.length) console.log(locations.slice(0, 40).join(", "));

  if (WRITE) {
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  }
}

if (!WRITE) {
  console.log("Dry run only. Re-run with --write to update manuscript files.");
}
