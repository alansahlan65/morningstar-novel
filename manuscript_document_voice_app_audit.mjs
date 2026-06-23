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

if (fullParagraphs !== 153) {
  throw new Error(`Expected 153 full document paragraphs, found ${fullParagraphs}`);
}
if (partialParagraphs !== 0) {
  throw new Error(`Expected 0 mixed document paragraphs, found ${partialParagraphs}`);
}
if (sentenceSpans !== 0) {
  throw new Error(`Expected 0 sentence spans, found ${sentenceSpans}`);
}

const assertDocumentParagraph = (needle, label) => {
  for (const chapter of chapters.values()) {
    const index = chapter.paragraphs.findIndex((paragraph) => paragraph.includes(needle));
    if (index !== -1) {
      if (metadata[chapter.chapter_id]?.[index] !== true) {
        throw new Error(`${label} is not classified as document voice`);
      }
      return;
    }
  }
  throw new Error(`${label} is missing from the enhanced manuscript`);
};

assertDocumentParagraph("Subject displays unusual field effect", "Part I field report");
assertDocumentParagraph("LIVING CHAMBER POSSIBILITY", "Part V LIVING CHAMBER report");

if (!/--font-prose:\s*'EB Garamond'/.test(css)) {
  throw new Error("Default manuscript prose font is not EB Garamond");
}
if (!/--font-document:\s*Garamond,/.test(css)) {
  throw new Error("Document voice font does not prefer Garamond");
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
if (!/\.prose-column p\s*\{[^}]*white-space:\s*pre-line/s.test(css)) {
  throw new Error("Manuscript paragraphs do not preserve source line breaks");
}

console.log(
  `document_voice_app_audit=pass full=${fullParagraphs} partial=${partialParagraphs} spans=${sentenceSpans}`
);
