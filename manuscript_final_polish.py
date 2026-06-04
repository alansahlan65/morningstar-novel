import copy
import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CANONICAL = ROOT / "src" / "data" / "manuscript.json"
ROOT_MANUSCRIPT = ROOT / "manuscript.json"
TEMP_MANUSCRIPT = ROOT / "src" / "data" / "manuscript_temp.json"
ENCYCLOPEDIA = ROOT / "src" / "data" / "encyclopedia.json"


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def all_chapters(data):
    for part in data:
        for chapter in part["chapters"]:
            yield part, chapter


def chapter_by_id(data, chapter_id):
    for _part, chapter in all_chapters(data):
        if chapter["chapter_id"] == chapter_id:
            return chapter
    raise KeyError(f"Missing chapter {chapter_id}")


def normalize_separators(chapter):
    normalized = []
    for para in chapter["paragraphs"]:
        if para.strip() == "***":
            normalized.append("---")
            continue
        if para.startswith("---\n"):
            normalized.append("---")
            rest = para[4:].strip()
            if rest:
                normalized.append(rest)
            continue
        normalized.append(para)
    chapter["paragraphs"] = normalized


def replace_paragraphs(chapter, predicate, replacement):
    next_paragraphs = []
    replaced = 0
    for para in chapter["paragraphs"]:
        if predicate(para):
            replaced += 1
            if isinstance(replacement, list):
                next_paragraphs.extend(replacement)
            elif replacement:
                next_paragraphs.append(replacement)
        else:
            next_paragraphs.append(para)
    chapter["paragraphs"] = next_paragraphs
    return replaced


def remove_sequence(chapter, start_index, count):
    del chapter["paragraphs"][start_index : start_index + count]


def polish_part_vi(data):
    # Normalize all separators first so later index edits are predictable.
    for _part, chapter in all_chapters(data):
        normalize_separators(chapter)

    ch36 = chapter_by_id(data, 36)
    replace_paragraphs(
        ch36,
        lambda p: p.startswith("The true price remained hidden at first. Costs rarely had the decency."),
        "",
    )

    ch37 = chapter_by_id(data, 37)
    # Remove a compressed alternate summary of the siege that repeats the detailed action already present.
    for i, para in enumerate(list(ch37["paragraphs"])):
        if para.startswith("The last ordinary morning hurt because it managed to be ordinary."):
            # Remove that paragraph, the following summary, the repeated defense summary, and its trailing separator.
            remove_sequence(ch37, i, 4)
            break

    ch38 = chapter_by_id(data, 38)
    replace_paragraphs(
        ch38,
        lambda p: p.startswith("Consequences did not arrive with fanfare. Costs rarely had the decency."),
        "The breach changed the company before anyone found language for it. Ciri stayed nearer without announcing protection. Geralt began watching the rear as if the road itself had learned pursuit. Yennefer and Triss measured every word Jack spoke, not for weakness, but for the places where the Crown might have left a hook. Asha and Tala kept their own silence, old law and old guilt standing side by side. Black smoke shaped like a crown had not won the field. It had made every survivor reveal what they would guard first.",
    )
    replace_paragraphs(
        ch38,
        lambda p: p.startswith("No one felt the toll right away. Costs rarely had the decency."),
        "",
    )

    ch39 = chapter_by_id(data, 39)
    replace_paragraphs(
        ch39,
        lambda p: p.startswith("The resulting damage was entirely silent at the beginning. Costs rarely had the decency."),
        "The failed seizure left its mark in arrangements rather than speeches. Ciri did not step away from Jack until the corridor was clear. Geralt took the rear without being asked. Yennefer held her anger so tightly it became useful, and Triss counted breaths instead of wounds. Asha and Tala watched the old rites with new suspicion. The room had not been solved; it had been exposed. Every person in it now knew what they would protect before law, rank, or fear.",
    )
    replace_paragraphs(
        ch39,
        lambda p: p.startswith("Payment was not demanded on the spot. Costs rarely had the decency."),
        "",
    )
    replace_paragraphs(
        ch39,
        lambda p: p.startswith("The true expense took its time to become visible. Costs rarely had the decency."),
        "",
    )

    ch42 = chapter_by_id(data, 42)
    replace_paragraphs(
        ch42,
        lambda p: p.startswith("It wasn't obvious at first what they had lost. Costs rarely had the decency."),
        "Recovery did not arrive as mercy. It arrived as small arrangements: Ciri walking on Jack's left because his right hand tired first, Geralt pretending not to notice, Yennefer changing doses before Triss could ask, Asha pausing at thresholds that had once meant law. The road did not become kinder. It only became honest enough to show what survival had rearranged.",
    )
    replace_paragraphs(
        ch42,
        lambda p: p.startswith("The immediate aftermath gave no hint of the price. Costs rarely had the decency."),
        "",
    )


LOOKED_AT_VARIANTS = {
    "Jack looked at her.": [
        "Jack turned to her.",
        "Jack met her eyes.",
        "His attention settled on her.",
        "Jack gave her the whole of his silence.",
    ],
    "Jack looked at him.": [
        "Jack turned to him.",
        "Jack studied him for a breath.",
        "Jack let the silence answer first.",
    ],
    "Geralt looked at him.": [
        "Geralt gave him a long look.",
        "Geralt watched him without blinking.",
    ],
    "Geralt looked at Jack.": [
        "Geralt turned to Jack.",
        "Geralt measured Jack's face.",
    ],
    "Jack looked at Ciri.": [
        "Jack turned to Ciri.",
        "Jack met Ciri's gaze.",
    ],
    "Yennefer looked at him.": [
        "Yennefer fixed him with that winter-black stare.",
        "Yennefer's attention cut to him.",
    ],
    "Everyone looked at her.": [
        "The room turned toward her.",
        "Every face in the room found her.",
    ],
    "Everyone looked at him.": [
        "The room turned toward him.",
        "Every face in the room found him.",
    ],
}


APHORISM_REPLACEMENTS = {
    "That was answer enough.": "No one needed the sentence finished.",
    "That made it worse.": "That left no clean anger to hold.",
    "It was not enough.": "It still left the wound open.",
    "Not safe.": "Safety had no place in it.",
}


def replace_repeated_sentences(data):
    counters = {key: 0 for key in LOOKED_AT_VARIANTS}
    aphorism_counts = {key: 0 for key in APHORISM_REPLACEMENTS}

    def replace_sentence(text, sentence, variants, counter_dict):
        count = counter_dict[sentence]

        def repl(_match):
            nonlocal count
            if count == 0:
                # Keep the first use of a simple sentence. Repetition, not the sentence itself, is the issue.
                count += 1
                return sentence
            variant = variants[(count - 1) % len(variants)]
            count += 1
            return variant

        text = re.sub(rf"(?<!\w){re.escape(sentence)}(?!\w)", repl, text)
        counter_dict[sentence] = count
        return text

    for _part, chapter in all_chapters(data):
        new_paragraphs = []
        for para in chapter["paragraphs"]:
            text = para
            for sentence, variants in LOOKED_AT_VARIANTS.items():
                text = replace_sentence(text, sentence, variants, counters)
            for sentence, replacement in APHORISM_REPLACEMENTS.items():
                if sentence in text:
                    if aphorism_counts[sentence] == 0:
                        aphorism_counts[sentence] += text.count(sentence)
                    else:
                        text = text.replace(sentence, replacement)
                        aphorism_counts[sentence] += 1
            new_paragraphs.append(text)
        chapter["paragraphs"] = new_paragraphs


def add_reveal_metadata(encyclopedia):
    reveal = {
        "jack": 1,
        "geralt": 4,
        "ciri": 6,
        "triss": 6,
        "yennefer": 8,
        "regis": 28,
        "zoltan": 9,
        "dandelion": 9,
        "roche_ves": 25,
        "keira": 12,
        "mara": 2,
        "sorel": 5,
        "asha": 16,
        "jacob_helena": 24,
        "zerrikanterment": 24,
        "vharakthul": 16,
        "buck": 1,
        "priscilla": 9,
        "ilyra": 7,
        "lambert": 12,
        "eskel": 12,
        "ciri_imperial_circle": 18,
        "cerys": 30,
        "ermion": 30,
        "emhyr": 18,
        "saesenthessis": 32,
        "tala": 33,
        "sera": 34,
        "nadir": 33,
        "cazren": 27,
        "rian": 5,
        "faithel": 16,
        "black_ink": 2,
        "zerrikania": 32,
        "velen": 1,
        "toussaint": 6,
        "kaer_morhen": 12,
        "novigrad": 9,
        "skellige": 30,
        "elskerdeg_pass": 33,
        "sanctuary_faithel": 34,
        "canyon_stars": 35,
        "obsidian_crown": 38,
    }

    for group in ("characters", "regions"):
        for entry in encyclopedia.get(group, []):
            entry["revealChapter"] = reveal.get(entry["id"], 1)
            if "spoilerLevel" not in entry:
                entry["spoilerLevel"] = "open"


def append_missing_encyclopedia_entries(encyclopedia):
    existing = {entry["id"] for group in ("characters", "regions") for entry in encyclopedia.get(group, [])}
    missing_characters = [
        {
            "id": "buck",
            "name": "Buck",
            "title": "Jack's horse",
            "type": "Character",
            "factions": ["Independent"],
            "description": "Jack's stubborn, perceptive horse. Buck often senses danger before people are willing to name it.",
            "details": "Buck is not comic furniture; he is part of the novel's witness system. His refusals, shying, and grudging loyalty externalize the road's pressure on Jack.",
            "revealChapter": 1,
            "spoilerLevel": "open",
        },
        {
            "id": "priscilla",
            "name": "Priscilla",
            "title": "Poet and performer",
            "type": "Character",
            "factions": ["The Chameleon"],
            "description": "A gifted poet and Dandelion's sharpest counterweight. She understands how songs can protect, distort, or weaponize memory.",
            "details": "Priscilla helps separate useful rumor from manufactured myth, especially when the Crimson Wolf stories begin moving faster than fact.",
            "revealChapter": 9,
            "spoilerLevel": "open",
        },
        {
            "id": "ilyra",
            "name": "Ilyra Sarn",
            "title": "Imperial adviser and cipher-worker",
            "type": "Character",
            "factions": ["Nilfgaardian Empire"],
            "description": "A precise imperial intelligence figure attached to Ciri's political world. She translates affection, risk, and succession into the language of state survival.",
            "details": "Ilyra is one of the reasons Ciri's personal choices become politically legible. Her memoranda make intimacy dangerous because courts can read it as leverage.",
            "revealChapter": 7,
            "spoilerLevel": "open",
        },
        {
            "id": "lambert",
            "name": "Lambert",
            "title": "Wolf School witcher",
            "type": "Character",
            "factions": ["School of the Wolf"],
            "description": "A harsh, funny, loyal witcher whose barbs often hide accurate fear. He enters through Kaer Morhen's reopened wounds.",
            "details": "Lambert's presence keeps the old Wolf School dynamic from becoming too solemn. His relationship with Keira adds tension without turning the story into romantic convenience.",
            "revealChapter": 12,
            "spoilerLevel": "open",
        },
        {
            "id": "eskel",
            "name": "Eskel",
            "title": "Wolf School witcher",
            "type": "Character",
            "factions": ["School of the Wolf"],
            "description": "A steady Wolf School survivor whose calm gives weight to the Kaer Morhen investigation.",
            "details": "Eskel functions as a quiet witness to what Vesemir hid and what Geralt still carries. His restraint makes the old keep feel lived-in rather than merely remembered.",
            "revealChapter": 12,
            "spoilerLevel": "open",
        },
        {
            "id": "ciri_imperial_circle",
            "name": "Ciri's Imperial Circle",
            "title": "Court pressure around the empress-elect",
            "type": "Character",
            "factions": ["Nilfgaardian Empire"],
            "description": "The advisers, couriers, committees, and observers who turn Ciri's private loyalties into imperial risk.",
            "details": "This circle is less a single villain than a pressure field. It makes Ciri's affection for Jack matter politically before either of them can decide what it means personally.",
            "revealChapter": 18,
            "spoilerLevel": "open",
        },
        {
            "id": "cerys",
            "name": "Cerys an Craite",
            "title": "Queen of Skellige",
            "type": "Character",
            "factions": ["Skellige"],
            "description": "The ruler of Skellige, practical enough to recognize danger without surrendering her people's judgment to foreign courts.",
            "details": "Cerys enters as a distant but important authority whose druidic correspondence helps widen the crisis beyond the northern roads.",
            "revealChapter": 30,
            "spoilerLevel": "open",
        },
        {
            "id": "ermion",
            "name": "Ermion",
            "title": "Skellige druid",
            "type": "Character",
            "factions": ["Skellige Druids"],
            "description": "A senior druid whose reports and warnings connect Skellige's weather, monsters, and old magic to Jack's eastern crisis.",
            "details": "Ermion's role is connective rather than showy: he helps prove the world is reacting to the seal before the characters can afford to call it prophecy.",
            "revealChapter": 30,
            "spoilerLevel": "open",
        },
        {
            "id": "emhyr",
            "name": "Emhyr var Emreis",
            "title": "Emperor of Nilfgaard",
            "type": "Character",
            "factions": ["Nilfgaardian Empire"],
            "description": "Ciri's father and the imperial force behind much of the political pressure surrounding her future.",
            "details": "Emhyr is not physically central, but his state apparatus shapes the stakes. Ciri's movement toward the throne turns Jack's survival into a matter of imperial vulnerability.",
            "revealChapter": 18,
            "spoilerLevel": "open",
        },
        {
            "id": "saesenthessis",
            "name": "Saesenthessis",
            "title": "Dragon in human shape",
            "type": "Character",
            "factions": ["Dragons"],
            "description": "A dragon whose recognition of the eastern crisis gives Part VI its ancient, nonhuman scale.",
            "details": "Saesenthessis helps keep draconic power from becoming simple spectacle. Her silence and intervention sharpen the difference between witness, judgment, and apology.",
            "revealChapter": 32,
            "spoilerLevel": "open",
        },
        {
            "id": "tala",
            "name": "Tala",
            "title": "Faithel-aligned defender",
            "type": "Character",
            "factions": ["The Faithel", "Zerrikania"],
            "description": "A dry, formidable Zerrikanian defender whose practicality cuts through northern sentiment.",
            "details": "Tala gives the eastern chapters a living local voice. She treats Jack's crisis as duty, boundary, and consequence rather than romantic destiny.",
            "revealChapter": 33,
            "spoilerLevel": "open",
        },
        {
            "id": "sera",
            "name": "Sera",
            "title": "Faithel elder and keeper",
            "type": "Character",
            "factions": ["The Faithel"],
            "description": "A keeper of Faithel rites and sanctuary law.",
            "details": "Sera's authority turns old memory into procedure. She is one of the figures who makes Zerrikania feel governed by inherited cost rather than vague mysticism.",
            "revealChapter": 34,
            "spoilerLevel": "open",
        },
        {
            "id": "nadir",
            "name": "Nadir",
            "title": "Pass-keeper and trader",
            "type": "Character",
            "factions": ["Elskerdeg Pass", "Zerrikania"],
            "description": "A practical pass-keeper whose humor and ledger-minded survival instincts ground the eastern journey.",
            "details": "Nadir is useful because he refuses grandeur. He treats death, debt, water, and courage as things that must be counted honestly.",
            "revealChapter": 33,
            "spoilerLevel": "open",
        },
        {
            "id": "cazren",
            "name": "Brother Cazren",
            "title": "Saint with ledgers",
            "type": "Character",
            "factions": ["Eternal Fire", "Obsidian Crown"],
            "description": "A preacher whose charity and doctrine become a vehicle for cultic hunger.",
            "details": "Cazren is dangerous because he understands mercy as administration. He can feed people, comfort them, and still teach them the sentence that opens the wrong door.",
            "revealChapter": 27,
            "spoilerLevel": "open",
        },
        {
            "id": "rian",
            "name": "Rian",
            "title": "Black Ink clerk",
            "type": "Character",
            "factions": ["Black Ink"],
            "description": "A bureaucratic witness inside the machinery that classifies Jack.",
            "details": "Rian's fear and paperwork make Black Ink feel humanly plausible. He shows how ordinary clerks can become instruments of violence by trying to keep the columns neat.",
            "revealChapter": 5,
            "spoilerLevel": "open",
        },
    ]
    missing_regions = [
        {
            "id": "skellige",
            "name": "Skellige",
            "type": "Region",
            "description": "The island realm ruled by Cerys, connected to the crisis through weather, druidic packets, and old monster signs.",
            "details": "Skellige proves the eastern threat is not a private family matter. Druidic warnings widen the scale before the road turns fully toward Zerrikania.",
            "revealChapter": 30,
            "spoilerLevel": "open",
        },
        {
            "id": "elskerdeg_pass",
            "name": "Elskerdeg Pass",
            "type": "Region",
            "description": "The harsh Zerrikanian threshold where northern assumptions begin to fail.",
            "details": "Elskerdeg Pass tests whether Jack's company can enter the eastern crisis as guests, liabilities, or invaders. Its gates make hospitality a moral and tactical question.",
            "revealChapter": 33,
            "spoilerLevel": "open",
        },
        {
            "id": "sanctuary_faithel",
            "name": "Sanctuary of the Faithel",
            "type": "Region",
            "description": "The hidden sanctuary where Faithel memory, rites, and anchor systems converge.",
            "details": "The sanctuary is not a safe temple; it is a living archive of old decisions. It reveals how Jack's bloodline became a lock and why repair can become another kind of harm.",
            "revealChapter": 34,
            "spoilerLevel": "open",
        },
        {
            "id": "canyon_stars",
            "name": "Canyon of Stars",
            "type": "Region",
            "description": "A Zerrikanian ritual landscape where failed solutions become visible.",
            "details": "The canyon strips away easy answers. It tests magic, Elder Blood, draconic recognition, and human willingness before the final containment choice becomes unavoidable.",
            "revealChapter": 35,
            "spoilerLevel": "open",
        },
        {
            "id": "obsidian_crown",
            "name": "The Obsidian Crown",
            "type": "Region",
            "description": "The crisis field surrounding Vharakthul's return: part entity, part doctrine, part corrupted hierarchy.",
            "details": "The Crown is not only a monster's name. It is the shape domination takes when law, cult, and draconic hunger all learn the same grammar.",
            "revealChapter": 38,
            "spoilerLevel": "open",
        },
    ]

    encyclopedia.setdefault("characters", [])
    encyclopedia.setdefault("regions", [])
    for entry in missing_characters:
        if entry["id"] not in existing:
            encyclopedia["characters"].append(entry)
            existing.add(entry["id"])
    for entry in missing_regions:
        if entry["id"] not in existing:
            encyclopedia["regions"].append(entry)
            existing.add(entry["id"])


def canonicalize_outputs(data):
    save_json(CANONICAL, data)
    save_json(ROOT_MANUSCRIPT, data)
    save_json(TEMP_MANUSCRIPT, data)


def main():
    data = load_json(CANONICAL)
    encyclopedia = load_json(ENCYCLOPEDIA)

    # Keep a local backup outside the app import path for easy manual comparison.
    backup_dir = ROOT / ".codex" / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(CANONICAL, backup_dir / "manuscript.before-final-polish.json")
    shutil.copy2(ENCYCLOPEDIA, backup_dir / "encyclopedia.before-final-polish.json")

    polish_part_vi(data)
    replace_repeated_sentences(data)
    canonicalize_outputs(data)

    add_reveal_metadata(encyclopedia)
    append_missing_encyclopedia_entries(encyclopedia)
    # Sorting keeps the app list predictable without changing existing entry IDs.
    encyclopedia["characters"].sort(key=lambda entry: entry["revealChapter"])
    encyclopedia["regions"].sort(key=lambda entry: entry["revealChapter"])
    save_json(ENCYCLOPEDIA, encyclopedia)

    print("Final polish applied.")


if __name__ == "__main__":
    main()
