import fs from 'node:fs';

const manuscript = JSON.parse(fs.readFileSync('src/data/manuscript.json', 'utf8'));

const terms = [
  { key: 'cost', pattern: /\bcost(?:s|ing|ly)?\b/gi },
  { key: 'enough', pattern: /\benough\b/gi },
  { key: 'dangerous', pattern: /\bdangerous(?:ly)?\b/gi },
  { key: 'truth', pattern: /\btruth(?:s)?\b/gi },
  { key: 'looked at', pattern: /\blooked at\b/gi },
];

const payoffChapters = new Set([18, 24, 34, 38, 39, 40, 41, 42]);

function splitSentences(paragraph) {
  return String(paragraph)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeShape(sentence) {
  return sentence
    .toLowerCase()
    .replace(/\b(jack|ciri|geralt|yennefer|triss|mara|regis|asha|sorel|tala|nadir|rian|buck|dandelion|zoltan|cazren|saesenthessis|vharakthul|emhyr|roche|ves|keira|lambert|eskel|cerys|ermion)\b/g, '{name}')
    .replace(/\b\d+\b/g, '{num}')
    .replace(/[^a-z0-9{}'" ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCadenceShape(sentence) {
  const lower = sentence.toLowerCase();
  if (/\b(looked at|looked away|did not look|gave .* a long look|studied .* for a breath)\b/.test(lower)) return true;
  if (/\b(was enough|were enough|close enough|true enough|answer enough|enough to)\b/.test(lower)) return true;
  if (/\b(dangerous|truth|cost|paid for|no clean anger|no proper enemy)\b/.test(lower)) return true;
  if (/\bthat (made|left|was|had)|\bit (made|left|was|had)|\bsome truths\b/.test(lower)) return true;
  return false;
}

function classify(sentence, paragraph, termKeys, chapterId) {
  const lower = sentence.toLowerCase();
  const words = sentence.split(/\s+/).filter(Boolean).length;
  const inDialogue = sentence.includes('"');
  const standalone = paragraph.trim() === sentence.trim();
  const isPayoff = payoffChapters.has(chapterId);

  if (isPayoff && (lower.includes('truth') || lower.includes('cost') || lower.includes('enough'))) {
    return 'keep';
  }

  if (termKeys.includes('looked at')) {
    if (words <= 9 || /\b(looked at him|looked at her|looked at them|looked at it)\b/i.test(sentence)) {
      return 'replace';
    }
    return 'soften';
  }

  if (termKeys.includes('dangerous') && words <= 10) return isPayoff ? 'soften' : 'replace';
  if (termKeys.includes('truth') && /\b(the truth|some truths|that truth|truth was|truth had)\b/i.test(sentence)) {
    return isPayoff ? 'soften' : 'replace';
  }
  if (termKeys.includes('enough') && (standalone || words <= 7 || /\b(close enough|true enough|answer enough|enough to)\b/i.test(sentence))) {
    return isPayoff ? 'soften' : 'replace';
  }
  if (termKeys.includes('cost') && !/\b(crowns|coins?|paid|price|ledger|money|tax|payment|expenses?|compensation)\b/i.test(sentence)) {
    return isPayoff ? 'soften' : 'replace';
  }

  if (inDialogue || words > 24) return 'keep';
  return 'soften';
}

const chapterRows = [];
const occurrences = [];
const shapeMap = new Map();

for (const part of manuscript) {
  for (const chapter of part.chapters) {
    const row = {
      part: part.part_title,
      chapterId: chapter.chapter_id,
      chapterTitle: chapter.chapter_title,
      words: 0,
      counts: Object.fromEntries(terms.map((term) => [term.key, 0])),
      actions: { keep: 0, soften: 0, replace: 0, cut: 0 },
    };

    chapter.paragraphs.forEach((paragraph, paragraphIndex) => {
      const paragraphWords = String(paragraph).split(/\s+/).filter(Boolean).length;
      row.words += paragraphWords;

      for (const term of terms) {
        const matches = String(paragraph).match(term.pattern);
        row.counts[term.key] += matches ? matches.length : 0;
      }

      for (const sentence of splitSentences(paragraph)) {
        const termKeys = terms
          .filter((term) => {
            term.pattern.lastIndex = 0;
            return term.pattern.test(sentence);
          })
          .map((term) => term.key);

        if (isCadenceShape(sentence)) {
          const shape = normalizeShape(sentence);
          if (!shapeMap.has(shape)) shapeMap.set(shape, []);
          shapeMap.get(shape).push({ chapterId: chapter.chapter_id, paragraphIndex, sentence });
        }

        if (termKeys.length === 0) continue;

        const action = classify(sentence, paragraph, termKeys, chapter.chapter_id);
        row.actions[action] += 1;
        occurrences.push({
          part: part.part_title,
          chapterId: chapter.chapter_id,
          chapterTitle: chapter.chapter_title,
          paragraphIndex,
          action,
          terms: termKeys,
          sentence,
        });
      }
    });

    row.totalTermHits = Object.values(row.counts).reduce((sum, count) => sum + count, 0);
    row.termHitsPer10k = Number(((row.totalTermHits / row.words) * 10000).toFixed(2));
    row.rewritePressure = row.actions.replace * 2 + row.actions.soften;
    chapterRows.push(row);
  }
}

const repeatedShapes = [...shapeMap.entries()]
  .filter(([, items]) => items.length > 1 && items[0].sentence.split(/\s+/).length >= 6)
  .map(([shape, items]) => ({ shape, count: items.length, items }))
  .sort((a, b) => b.count - a.count || a.shape.localeCompare(b.shape));

const output = {
  generatedAt: new Date().toISOString(),
  terms: terms.map((term) => term.key),
  chapterRows: chapterRows.sort((a, b) => b.rewritePressure - a.rewritePressure || b.termHitsPer10k - a.termHitsPer10k),
  occurrences,
  repeatedShapes: repeatedShapes.slice(0, 100),
};

fs.mkdirSync('.codex', { recursive: true });
fs.writeFileSync('.codex/cadence-audit.json', `${JSON.stringify(output, null, 2)}\n`);

const lines = [
  '# Morningstar Cadence Heatmap',
  '',
  '| Rank | Chapter | Words | Hits/10k | Keep | Soften | Replace | Cut | Top terms |',
  '|---:|---|---:|---:|---:|---:|---:|---:|---|',
];

for (const [index, row] of output.chapterRows.entries()) {
  const topTerms = Object.entries(row.counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([term, count]) => `${term}: ${count}`)
    .join(', ');
  lines.push(
    `| ${index + 1} | Ch ${row.chapterId}: ${row.chapterTitle} | ${row.words} | ${row.termHitsPer10k} | ${row.actions.keep} | ${row.actions.soften} | ${row.actions.replace} | ${row.actions.cut} | ${topTerms} |`
  );
}

lines.push('', '## Repeated Sentence Shapes', '');
for (const item of output.repeatedShapes.slice(0, 30)) {
  const chapters = item.items.map((entry) => `ch ${entry.chapterId}/p${entry.paragraphIndex}`).join(', ');
  lines.push(`- ${item.count}x ${chapters}: ${item.items[0].sentence}`);
}

fs.writeFileSync('.codex/cadence-heatmap.md', `${lines.join('\n')}\n`);

console.log(`chapters=${chapterRows.length}`);
console.log(`occurrences=${occurrences.length}`);
console.log(`replace=${occurrences.filter((item) => item.action === 'replace').length}`);
console.log(`soften=${occurrences.filter((item) => item.action === 'soften').length}`);
console.log(`keep=${occurrences.filter((item) => item.action === 'keep').length}`);
console.log(`repeated_shapes=${repeatedShapes.length}`);
console.log('.codex/cadence-heatmap.md');
