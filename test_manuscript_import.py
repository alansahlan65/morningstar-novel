import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from docx import Document

import generate_document_voice_metadata
from generate_document_voice_metadata import document_spans
from parse_docx_to_json import build_manuscript, parse_docx


ROOT = Path(__file__).resolve().parent
ENHANCED_DIR = ROOT / "Enhanced First Person Manuscript - Use"


class EnhancedManuscriptImportTests(unittest.TestCase):
    def test_build_manuscript_imports_all_enhanced_parts(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            output_path = Path(temporary_directory) / "manuscript.json"
            build_manuscript(ENHANCED_DIR, output_path)
            manuscript = json.loads(output_path.read_text(encoding="utf-8"))

        self.assertEqual(6, len(manuscript))
        self.assertEqual(43, sum(len(part["chapters"]) for part in manuscript))

    def test_part_iv_heading_one_paragraphs_are_chapters(self):
        parts = parse_docx(ENHANCED_DIR / "Fixed_Enhanced_Part_IV.docx")

        self.assertEqual(1, len(parts))
        self.assertEqual(7, len(parts[0]["chapters"]))
        self.assertEqual("CIRI", parts[0]["chapters"][0]["chapter_title"])

    def test_manual_line_breaks_are_preserved(self):
        parts = parse_docx(ENHANCED_DIR / "Fixed_Enhanced_Part_II.docx")
        poem = next(
            paragraph
            for chapter in parts[0]["chapters"]
            for paragraph in chapter["paragraphs"]
            if paragraph.startswith("Red wolf, red wolf")
        )

        self.assertEqual(4, len(poem.splitlines()))

    def test_document_fragment_paragraph_style_is_document_voice(self):
        document = Document(ENHANCED_DIR / "Fixed_Enhanced_Part_IV.docx")
        fragment = next(
            paragraph
            for paragraph in document.paragraphs
            if paragraph.style.name == "Document Fragment" and paragraph.text.strip()
        )

        self.assertIs(True, document_spans(fragment))

    def test_document_voice_metadata_builds_from_enhanced_sources(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            output_path = Path(temporary_directory) / "document-voice.json"
            with patch.object(generate_document_voice_metadata, "OUTPUT_PATH", output_path):
                generate_document_voice_metadata.main()
            metadata = json.loads(output_path.read_text(encoding="utf-8"))

        self.assertGreater(sum(len(entries) for entries in metadata.values()), 0)


if __name__ == "__main__":
    unittest.main()
