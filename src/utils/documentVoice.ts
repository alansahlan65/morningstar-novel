import firstPersonDocumentVoice from '../data/document-voice-first-person.json';
import type { ManuscriptPov } from '../data/manuscripts';

type DocumentVoiceEntry = true | string[];
type FirstPersonDocumentVoice = Record<string, Record<string, DocumentVoiceEntry>>;

export interface DocumentVoiceSegment {
  text: string;
  isDocumentVoice: boolean;
}

const FIRST_PERSON_DOCUMENT_VOICE =
  firstPersonDocumentVoice as FirstPersonDocumentVoice;

const THIRD_PERSON_DOCUMENT_VOICE_PARAGRAPHS: Record<number, number[]> = {
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
  42: [0, 144]
};

const getDocumentVoiceEntry = (
  pov: ManuscriptPov,
  chapterId: number,
  index: number
): DocumentVoiceEntry | undefined => {
  if (pov === 'first-person') {
    return FIRST_PERSON_DOCUMENT_VOICE[String(chapterId)]?.[String(index)];
  }

  return THIRD_PERSON_DOCUMENT_VOICE_PARAGRAPHS[chapterId]?.includes(index)
    ? true
    : undefined;
};

export const getDocumentVoiceSegments = (
  pov: ManuscriptPov,
  chapterId: number,
  index: number,
  paragraph: string
): DocumentVoiceSegment[] => {
  const entry = getDocumentVoiceEntry(pov, chapterId, index);

  if (entry === true) {
    return [{ text: paragraph, isDocumentVoice: true }];
  }

  if (!entry) {
    return [{ text: paragraph, isDocumentVoice: false }];
  }

  const segments: DocumentVoiceSegment[] = [];
  let cursor = 0;

  for (const documentText of entry) {
    const start = paragraph.indexOf(documentText, cursor);
    if (start === -1) {
      return [{ text: paragraph, isDocumentVoice: false }];
    }

    if (start > cursor) {
      segments.push({
        text: paragraph.slice(cursor, start),
        isDocumentVoice: false
      });
    }

    segments.push({ text: documentText, isDocumentVoice: true });
    cursor = start + documentText.length;
  }

  if (cursor < paragraph.length) {
    segments.push({
      text: paragraph.slice(cursor),
      isDocumentVoice: false
    });
  }

  return segments;
};
