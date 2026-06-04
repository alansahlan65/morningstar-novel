import json
import os

def create_encyclopedia():
    data = {
        "characters": [
            {
                "id": "jack",
                "name": "Jack Morningstar",
                "title": "The Crimson Wolf / Lone Wolf",
                "type": "Character",
                "factions": ["School of the Wolf", "House Morningstar"],
                "description": "A 23-year-old Witcher of the School of the Wolf. Unlike standard witchers, Jack is a fertile over-mutated anomaly who possesses crimson eyes, peak reflexes, and the capacity for deep human emotion. He was trained in absolute secrecy at Kaer Morhen by Vesemir and Geralt to protect him from external interest.",
                "details": "Jack's crimson eyes are the physical indicator of an ancient, dormant draconic bloodline sealed within him. He travels with a heavy, barbed-star amulet left by his mother, and his faithful horse, Buck. His combat style is efficient, acrobat-oriented, and highly strategic, reflecting his INTJ mastermind personality."
            },
            {
                "id": "geralt",
                "name": "Geralt of Rivia",
                "title": "The White Wolf",
                "type": "Character",
                "factions": ["School of the Wolf"],
                "description": "Legendary Witcher who successfully stopped the Wild Hunt and helped Ciri defeat the White Frost. He has retired from the Path and resides in Toussaint at the Corvo Bianco vineyard, seeking peace away from royal courts and mage politics.",
                "details": "Geralt acted as Jack's mentor and guardian, keeping his training hidden from even his closest friends, including Yennefer and Ciri. Despite his retirement, Geralt stands by Jack when the shadow network of 'Black Ink' begins hunting the young witcher."
            },
            {
                "id": "ciri",
                "name": "Cirilla Fiona Elen Riannon (Ciri)",
                "title": "Empress-elect of Nilfgaard",
                "type": "Character",
                "factions": ["Nilfgaardian Empire", "Elder Blood"],
                "description": "The 21-year-old heiress to the Nilfgaardian throne and daughter of Elder Blood. After defeating the White Frost, Ciri made the bittersweet choice to sacrifice her freedom as a witcher to take her place as Emhyr's successor, seeking to stabilize the continent.",
                "details": "Ciri was kept unaware of Jack's existence during her childhood at Kaer Morhen due to the danger surrounding his mutations. When they finally meet, she recognizes the intense weight Jack carries, and her political standing becomes both a weapon and a vulnerability in the conflict."
            },
            {
                "id": "triss",
                "name": "Triss Merigold",
                "title": "Fourteenth of the Hill",
                "type": "Character",
                "factions": ["Lodge of Sorceresses", "Kovir Council"],
                "description": "A legendary and compassionate sorceress who lives with Geralt at Corvo Bianco. She advises the Kovir council and acts as a key researcher in unraveling the magical containment seals bound to Jack.",
                "details": "Triss helps identify the bureaucratic anti-mage courier networks. Her deep care for Geralt's family translates into unconditional support for Jack, researching Kovir records to trace Black Ink's operations."
            },
            {
                "id": "yennefer",
                "name": "Yennefer of Vengerberg",
                "title": "Sorceress of Vengerberg",
                "type": "Character",
                "factions": ["Lodge of Sorceresses"],
                "description": "Geralt's longtime love and Ciri's adoptive mother. A fiercely independent and brilliant sorceress who investigates magical dead zones and draconic seals.",
                "details": "Yennefer is the first to analyze the administrative diagrams of the 'vessel-prison' (Living Chamber). She reacts with deep maternal anger to the institutional cruelty that seeks to convert Jack's body into a containment device."
            },
            {
                "id": "regis",
                "name": "Emiel Regis Rohellec Terzieff-Godefroy",
                "title": "Higher Vampire",
                "type": "Character",
                "factions": ["Independent"],
                "description": "A highly intellectual and articulate higher vampire who advises Jack and Geralt on the nature of raw appetite, restraint, and the moral horrors of physical containment.",
                "details": "Regis acts as a philosophical guide, warning Jack about the high cost of seals that consume blood, helping construct a diagnosis of the hunger that resides within Jack's sealed lineage."
            },
            {
                "id": "zoltan",
                "name": "Zoltan Chivay",
                "title": "Veteran Merchant",
                "type": "Character",
                "factions": ["Novigrad Merchants"],
                "description": "A veteran dwarf soldier and merchant who assists in Novigrad by tracing material ledger trails, counterfeit wax seals, and dockside shipments for the group.",
                "details": "Zoltan's streetwise competence provides practical evidence. He uncovers the financial and logistical pipelines tracking Jack across Velen and Novigrad."
            },
            {
                "id": "dandelion",
                "name": "Dandelion (Julian Alfred Pankratz)",
                "title": "Viscount de Lettenhove",
                "type": "Character",
                "factions": ["The Chameleon"],
                "description": "The continent's most famous bard and close companion to Geralt. He runs 'The Chameleon' cabaret house in Novigrad, using his network to filter gossip and rumors.",
                "details": "Dandelion uncovers songs and broadsheets describing a red-eyed witcher, recognizing that the prose is too polished to be natural folk songs, signaling an intentional disinformation campaign."
            },
            {
                "id": "roche_ves",
                "name": "Vernon Roche & Ves",
                "title": "Temerian Blue Stripes",
                "type": "Character",
                "factions": ["Temerian Resistance / Blue Stripes"],
                "description": "Former commanders of the Temerian Special Forces (Blue Stripes). They assist Triss and Geralt by providing secure, unchecked roads and maps through Velen's borderlands.",
                "details": "Roche acts with cold pragmatism, warning Geralt that Ciri's involvement with a hunted witcher creates dangerous leverage for Nilfgaard's intelligence apparatus. Ves assists by scouting Black Ink courier routes."
            },
            {
                "id": "keira",
                "name": "Keira Metz",
                "title": "Sorceress of Carreras",
                "type": "Character",
                "factions": ["Lodge of Sorceresses"],
                "description": "A clever, provocative, and diagnostic sorceress who travels with Lambert. She assists when old Kaer Morhen secrets and mutagen archives are reopened.",
                "details": "Keira provides analysis on Vesemir's laboratory logs, helping trace what exactly was done to Jack's blood during his trials."
            },
            {
                "id": "mara",
                "name": "Mara Veyr",
                "title": "Field Alchemist",
                "type": "Character",
                "factions": ["Black Ink (Affiliated)"],
                "description": "A compassionate medic and alchemist working near Black Ink's field camps. She provides early warmth and medical support to Jack, though her records are used by Black Ink.",
                "details": "Mara represents the tragedy of administrative involvement. Her care is genuine, but her professional reports accidentally feed Sorel Veyrane's tracking data."
            },
            {
                "id": "sorel",
                "name": "Sorel Veyrane",
                "title": "Black Ink Strategic Architect",
                "type": "Character",
                "factions": ["Black Ink"],
                "description": "The institutional antagonist and strategic architect of the Black Ink network. He views magical anomalies and Elder Bloodlines as administrative hazards that must be classified, owned, and contained.",
                "details": "Sorel is not a traditional monster or wizard; he is a bureaucrat of classification. He orchestrates the legal and military attempts to capture Jack, arguing that safety demands absolute structural containment."
            },
            {
                "id": "asha",
                "name": "Asha of the Faithel",
                "title": "Helena's Handmaid-Guard",
                "type": "Character",
                "factions": ["The Faithel"],
                "description": "A survivor and initiate of the ancient order of the Faithel. She was Helena Morningstar's protector and fled with key artifacts when the order collapsed.",
                "details": "Asha spent years hiding from Sorel's agents. When she meets Jack in Novigrad, she tests his restraint and reveals the old lyrics that map the path to Zerrikania's star-temple."
            },
            {
                "id": "jacob_helena",
                "name": "Jacob & Helena Morningstar",
                "title": "Jack's Parents",
                "type": "Character",
                "factions": ["House Morningstar", "The Faithel"],
                "description": "Jack's biological parents. Jacob was a Nilfgaardian soldier who died defending his family. Helena was a member of the Faithel and the last keeper of the draconic seal before Jack.",
                "details": "Helena left Jack her barbed-star amulet containing the dragon's compact. Jacob's letters, uncovered in Velen, show a practical soldier who chose family loyalty over the Empire's banners."
            },
            {
                "id": "zerrikanterment",
                "name": "Zerrikanterment",
                "title": "The Golden Last Warden",
                "type": "Character",
                "factions": ["Dragons"],
                "description": "A hidden golden dragon who acted as the Last Warden of the eastern seals. In a desperate final act, he compressed a failing seal into the infant Jack to prevent Vharakthul's release.",
                "details": "Unlike traditional monsters, Zerrikanterment possesses ancient memory and a cold concern for balance, sacrificing his own form to seed the seal inside Jack's bloodline."
            },
            {
                "id": "vharakthul",
                "name": "Vharakthul (The Obsidian Crown)",
                "title": "Black Entity of Erasure",
                "type": "Character",
                "factions": ["Obsidian Crown"],
                "description": "An ancient, dark draconic presence representing absolute hierarchy and dominion through erasure. It seeks to break Jack's seal to return and consume the continent.",
                "details": "Vharakthul represents structural decay and absolute authority. Its influence makes even stone and water run cold, threatening to consume Jack's body if the containment fails."
            }
        ],
        "regions": [
            {
                "id": "toussaint",
                "name": "Toussaint (Corvo Bianco)",
                "type": "Region",
                "description": "A southern duchy under Nilfgaardian vassalage, famous for its wines, fairytale chivalry, and complete isolation from the war's scars. Geralt lives here at the Corvo Bianco vineyard.",
                "details": "Corvo Bianco acts as a peaceful sanctuary in Part II. Its quiet cellars and sun-drenched vineyards are where Jack, Geralt, Triss, and Yennefer gather to analyze the initial clues of Sorel's tracking net."
            },
            {
                "id": "kaer_morhen",
                "name": "Kaer Morhen",
                "type": "Region",
                "description": "The ancient, crumbling stone keep of the School of the Wolf, hidden deep in the Blue Mountains. It is largely abandoned after Vesemir's death.",
                "details": "Kaer Morhen serves as the backdrop for Part III. Its cold laboratories and hidden caches contain Vesemir's journals on Jack's Trials, proving that his over-mutations were part of an emergency containment project."
            },
            {
                "id": "novigrad",
                "name": "Novigrad",
                "type": "Region",
                "description": "A massive, crowded port city governed by the Church of the Eternal Fire. It is a place of dockside commerce, criminal cabals, and intense witch-hunts.",
                "details": "Novigrad is where Jack and Zoltan trace the financial trail of Black Ink. Its crowded tenements and sermon houses hide Sorel's clerks and the refugee Asha."
            },
            {
                "id": "velen",
                "name": "Velen & White Orchard",
                "type": "Region",
                "description": "A war-torn, swampy border province in the North, filled with displaced monsters, ruined hill-forts, and poor villages that refuse to name themselves.",
                "details": "Velen is where Jack's journey begins in Part I. Its muddy roads, whitewashed posts, and the ruined fort at the Broken Crown hold the first material signs of the Black Ink's surveillance network."
            },
            {
                "id": "zerrikania",
                "name": "Zerrikania",
                "type": "Region",
                "description": "A mythical, dry eastern land located across the mountains. It is characterized by intense heat, gold worship, dragon reverence, and ancient alchemical structures.",
                "details": "Zerrikania serves as the setting for the final arc (Part VI). Its barren deserts (The Frying Pan), Elskerdeg Pass, and star-canyons are where Jack must travel to replace his failing seals at the Sanctuary of the Faithel."
            }
        ]
    }
    
    os.makedirs(r"d:\DesignWork\Novel App\src\data", exist_ok=True)
    with open(r"d:\DesignWork\Novel App\src\data\encyclopedia.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Successfully generated encyclopedia.json")

if __name__ == "__main__":
    create_encyclopedia()
