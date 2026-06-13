import bisect
import json
from collections import defaultdict
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn


ROOT = Path(__file__).resolve().parent
MANUSCRIPT_PATH = ROOT / "src/data/manuscript-first-person.json"
REVIEWED_DIR = ROOT / "First Person Manuscript/Reviewed"
OUTPUT_PATH = ROOT / "src/data/document-voice-first-person.json"

PART_FILES = {
    1: "Part_I_fpv.docx",
    2: "Part_II_fpv.docx",
    3: "Part_III_fpv.docx",
    4: "Part_IV_fpv.docx",
    5: "Part_V_fpv.docx",
    6: "Part_VI_fpv.docx",
}


def run_font_name(run):
    if run.font.name:
        return run.font.name
    run_properties = run._element.rPr
    if run_properties is not None and run_properties.rFonts is not None:
        return run_properties.rFonts.get(qn("w:ascii"))
    return None


def document_spans(paragraph):
    runs = [run for run in paragraph.runs if run.text]
    if not runs:
        return None

    document_flags = [
        run_font_name(run) == "Garamond" and run.italic is True for run in runs
    ]
    if all(document_flags):
        return True
    if not any(document_flags):
        return None

    spans = []
    current = ""
    for run, is_document in zip(runs, document_flags):
        if is_document:
            current += run.text
        elif current:
            spans.append(current)
            current = ""
    if current:
        spans.append(current)
    return spans


def flatten_part(part):
    flattened = []
    positions = defaultdict(list)
    for chapter in part["chapters"]:
        for index, text in enumerate(chapter["paragraphs"]):
            position = len(flattened)
            flattened.append((chapter["chapter_id"], index, text))
            positions[text].append(position)
    return flattened, positions


def main():
    manuscript = json.loads(MANUSCRIPT_PATH.read_text(encoding="utf-8"))
    metadata = defaultdict(dict)

    for part in manuscript:
        part_id = part["part_id"]
        reviewed_path = REVIEWED_DIR / PART_FILES[part_id]
        reviewed_document = Document(reviewed_path)
        flattened, positions = flatten_part(part)
        cursor = 0

        for paragraph in reviewed_document.paragraphs:
            text = paragraph.text
            candidate_positions = positions.get(text, [])
            candidate_index = bisect.bisect_left(candidate_positions, cursor)
            matched_position = (
                candidate_positions[candidate_index]
                if candidate_index < len(candidate_positions)
                else None
            )

            formatting = document_spans(paragraph)
            if formatting is not None and matched_position is None:
                raise ValueError(
                    f"Could not map formatted paragraph in {reviewed_path.name}: {text!r}"
                )

            if matched_position is None:
                continue

            cursor = matched_position + 1
            if formatting is None:
                continue

            chapter_id, paragraph_index, _ = flattened[matched_position]
            metadata[str(chapter_id)][str(paragraph_index)] = formatting

    ordered = {
        chapter_id: {
            index: entries[index]
            for index in sorted(entries, key=lambda value: int(value))
        }
        for chapter_id, entries in sorted(
            metadata.items(), key=lambda item: int(item[0])
        )
    }

    full_count = sum(
        value is True for entries in ordered.values() for value in entries.values()
    )
    partial_count = sum(
        isinstance(value, list)
        for entries in ordered.values()
        for value in entries.values()
    )
    span_count = sum(
        len(value)
        for entries in ordered.values()
        for value in entries.values()
        if isinstance(value, list)
    )

    if (full_count, partial_count, span_count) != (155, 23, 28):
        raise ValueError(
            "Unexpected document voice counts: "
            f"full={full_count}, partial={partial_count}, spans={span_count}"
        )

    OUTPUT_PATH.write_text(
        json.dumps(ordered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"Wrote {OUTPUT_PATH.relative_to(ROOT)}: "
        f"full={full_count}, partial={partial_count}, spans={span_count}"
    )


if __name__ == "__main__":
    main()
