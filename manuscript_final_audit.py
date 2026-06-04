import collections
import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MANUSCRIPT_PATHS = [
    ROOT / "src" / "data" / "manuscript.json",
    ROOT / "manuscript.json",
    ROOT / "src" / "data" / "manuscript_temp.json",
]
ENCYCLOPEDIA = ROOT / "src" / "data" / "encyclopedia.json"


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def manuscript_text(data):
    return "\n".join(
        paragraph
        for part in data
        for chapter in part["chapters"]
        for paragraph in chapter["paragraphs"]
    )


def main():
    print("MANUSCRIPT COPIES")
    hashes = []
    data = None
    for path in MANUSCRIPT_PATHS:
        data = load_json(path)
        digest = hashlib.md5(path.read_bytes()).hexdigest()
        hashes.append(digest)
        text = manuscript_text(data)
        print(
            f"{path.name}: parts={len(data)} "
            f"chapters={sum(len(part['chapters']) for part in data)} "
            f"words={len(text.split())} md5={digest}"
        )
    print(f"all_copies_identical={len(set(hashes)) == 1}")

    assert data is not None
    findings = []
    for part in data:
        for chapter in part["chapters"]:
            previous_separator = False
            for idx, paragraph in enumerate(chapter["paragraphs"]):
                is_separator = paragraph.strip() == "---"
                if is_separator and previous_separator:
                    findings.append((chapter["chapter_id"], idx, "consecutive-separator", paragraph[:120]))
                if paragraph.strip() == "***" or paragraph.startswith("---\n"):
                    findings.append((chapter["chapter_id"], idx, "separator", paragraph[:120]))
                if "Costs rarely had the decency" in paragraph or "Not by being powerful" in paragraph:
                    findings.append((chapter["chapter_id"], idx, "duplicate-aftermath", paragraph[:120]))
                previous_separator = is_separator
    print(f"separator_or_duplicate_aftermath_findings={len(findings)}")
    for item in findings[:20]:
        print(item)

    quote_findings = []
    for part in data:
        for chapter in part["chapters"]:
            inside_quote_block = False
            for idx, paragraph in enumerate(chapter["paragraphs"]):
                if paragraph == "---":
                    inside_quote_block = False
                    continue
                trimmed = paragraph.strip()
                quote_count = paragraph.count('"')
                if inside_quote_block and not trimmed.startswith('"'):
                    quote_findings.append((chapter["chapter_id"], idx, paragraph[:120]))
                if inside_quote_block:
                    if quote_count % 2 == 0:
                        inside_quote_block = False
                elif trimmed.startswith('"') and quote_count % 2 != 0:
                    inside_quote_block = True
    print(f"missing_dialogue_continuation_openings={len(quote_findings)}")
    for item in quote_findings[:20]:
        print(item)

    normalized_paragraphs = []
    for part in data:
        for chapter in part["chapters"]:
            for idx, paragraph in enumerate(chapter["paragraphs"]):
                norm = re.sub(r"[^a-z0-9 ]+", " ", paragraph.lower())
                norm = re.sub(r"\s+", " ", norm).strip()
                normalized_paragraphs.append((norm, chapter["chapter_id"], chapter["chapter_title"], idx))

    by_paragraph = collections.defaultdict(list)
    for item in normalized_paragraphs:
        if len(item[0].split()) >= 8:
            by_paragraph[item[0]].append(item)
    duplicate_paragraphs = [items for items in by_paragraph.values() if len(items) > 1]
    print(f"exact_duplicate_paragraphs_min8={len(duplicate_paragraphs)}")

    windows = collections.defaultdict(list)
    for norm, chapter_id, title, idx in normalized_paragraphs:
        words = norm.split()
        for start in range(0, max(0, len(words) - 31), 8):
            windows[" ".join(words[start : start + 32])].append((chapter_id, title, idx, start))
    repeated_windows = [
        items
        for items in windows.values()
        if len({(chapter_id, idx) for chapter_id, _title, idx, _start in items}) > 1
    ]
    print(f"repeated_32_word_windows={len(repeated_windows)}")

    print("CADENCE TERMS")
    for term in ["cost", "enough", "dangerous", "truth", "looked at"]:
        counts = []
        for part in data:
            for chapter in part["chapters"]:
                count = len(
                    re.findall(re.escape(term), " ".join(chapter["paragraphs"]), re.I)
                )
                if count:
                    counts.append((count, chapter["chapter_id"], chapter["chapter_title"]))
        print(term, sorted(counts, reverse=True)[:5])

    encyclopedia = load_json(ENCYCLOPEDIA)
    missing_meta = [
        entry["id"]
        for group in ("characters", "regions")
        for entry in encyclopedia.get(group, [])
        if "revealChapter" not in entry or "spoilerLevel" not in entry
    ]
    print(
        f"encyclopedia_characters={len(encyclopedia.get('characters', []))} "
        f"regions={len(encyclopedia.get('regions', []))} "
        f"missing_meta={missing_meta}"
    )


if __name__ == "__main__":
    main()
