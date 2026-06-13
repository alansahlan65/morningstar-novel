import fs from "node:fs";

const manuscript = JSON.parse(
  fs.readFileSync("src/data/manuscript-first-person.json", "utf8")
);
const metadata = JSON.parse(
  fs.readFileSync("src/data/document-voice-first-person.json", "utf8")
);
const css = fs.readFileSync("src/index.css", "utf8");

const chapters = new Map();
for (const part of manuscript) {
  for (const chapter of part.chapters) {
    chapters.set(chapter.chapter_id, chapter);
  }
}

let fullParagraphs = 0;
let partialParagraphs = 0;
let sentenceSpans = 0;

for (const [chapterIdText, paragraphEntries] of Object.entries(metadata)) {
  const chapterId = Number(chapterIdText);
  const chapter = chapters.get(chapterId);
  if (!chapter) {
    throw new Error(`Unknown chapter in document-voice metadata: ${chapterId}`);
  }

  for (const [indexText, value] of Object.entries(paragraphEntries)) {
    const index = Number(indexText);
    const paragraph = chapter.paragraphs[index];
    if (paragraph === undefined) {
      throw new Error(`Missing paragraph CH ${chapterId} p${index}`);
    }

    if (value === true) {
      fullParagraphs += 1;
      continue;
    }

    if (!Array.isArray(value) || value.length === 0) {
      throw new Error(`Invalid span metadata CH ${chapterId} p${index}`);
    }

    partialParagraphs += 1;
    sentenceSpans += value.length;
    for (const span of value) {
      if (!paragraph.includes(span)) {
        throw new Error(`Missing span in CH ${chapterId} p${index}: ${span}`);
      }
    }
  }
}

if (fullParagraphs !== 155) {
  throw new Error(`Expected 155 full document paragraphs, found ${fullParagraphs}`);
}
if (partialParagraphs !== 23) {
  throw new Error(`Expected 23 mixed document paragraphs, found ${partialParagraphs}`);
}
if (sentenceSpans !== 28) {
  throw new Error(`Expected 28 sentence spans, found ${sentenceSpans}`);
}
if (metadata[1]?.[207] !== true) {
  throw new Error("Screenshot report CH 1 p207 is not classified as document voice");
}
if (metadata[25]?.[69] !== true) {
  throw new Error("LIVING CHAMBER report CH 25 p69 is not classified as document voice");
}
const cssRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
const hasItalicRule = (selector) =>
  cssRules.some(([, selectors, declarations]) =>
    selectors.split(",").some((candidate) => candidate.trim() === selector) &&
    /font-family:\s*var\(--font-document\)/.test(declarations) &&
    /font-style:\s*italic/.test(declarations)
  );

if (!hasItalicRule(".prose-column p.document-voice")) {
  throw new Error("Full document paragraphs do not enforce Garamond italic styling");
}
if (!hasItalicRule(".prose-column .document-voice-span")) {
  throw new Error("Document spans do not enforce Garamond italic styling");
}

console.log(
  `document_voice_app_audit=pass full=${fullParagraphs} partial=${partialParagraphs} spans=${sentenceSpans}`
);
