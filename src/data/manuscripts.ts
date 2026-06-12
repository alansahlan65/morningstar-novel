import firstPersonData from './manuscript-first-person.json';
import thirdPersonData from './manuscript-third-person.json';

export type ManuscriptPov = 'first-person' | 'third-person';

export interface ManuscriptChapter {
  chapter_title: string;
  paragraphs: string[];
  chapter_id: number;
}

export interface ManuscriptPart {
  part_title: string;
  part_name: string;
  part_subtitle: string;
  chapters: ManuscriptChapter[];
  part_id: number;
}

export type ManuscriptData = ManuscriptPart[];

export const DEFAULT_MANUSCRIPT_POV: ManuscriptPov = 'first-person';

export const MANUSCRIPT_OPTIONS: Array<{
  value: ManuscriptPov;
  label: string;
}> = [
  { value: 'first-person', label: 'First Person POV' },
  { value: 'third-person', label: 'Third Person POV' },
];

export const MANUSCRIPTS: Record<ManuscriptPov, ManuscriptData> = {
  'first-person': firstPersonData as ManuscriptData,
  'third-person': thirdPersonData as ManuscriptData,
};
