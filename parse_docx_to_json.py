import os
import sys
import json
import re
import zipfile
import xml.etree.ElementTree as ET

def parse_docx(file_path):
    parts = []
    try:
        with zipfile.ZipFile(file_path) as z:
            xml_content = z.read('word/document.xml')
            root = ET.fromstring(xml_content)
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            p_list = []
            for p in root.findall('.//w:p', namespaces):
                texts = []
                for r in p.findall('.//w:r', namespaces):
                    t = r.find('.//w:t', namespaces)
                    if t is not None and t.text:
                        texts.append(t.text)
                txt = ''.join(texts).strip()
                # We want to preserve paragraphs, including empty ones or separators if needed, but let's filter out empty paragraphs
                if not txt:
                    continue
                
                pPr = p.find('w:pPr', namespaces)
                style_val = 'none'
                jc_val = 'none'
                if pPr is not None:
                    pStyle = pPr.find('w:pStyle', namespaces)
                    if pStyle is not None:
                        style_val = pStyle.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', 'none')
                    jc = pPr.find('w:jc', namespaces)
                    if jc is not None:
                        jc_val = jc.attrib.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', 'none')
                
                p_list.append((txt, style_val, jc_val))
                
            current_part = None
            current_chapter = None
            
            for idx, (txt, style, jc) in enumerate(p_list):
                previous_txt = p_list[idx-1][0] if idx > 0 else ''
                previous_previous_txt = p_list[idx-2][0] if idx > 1 else ''
                current_part_needs_name = current_part is not None and not current_part.get("part_name")
                # Is it a part title number (e.g. PART I)?
                is_part_title = (
                    (style in ['PartTitle', 'MorningstarPartTitle'] and not previous_txt.startswith('PART '))
                    or (style == 'none' and jc == 'center' and re.match(r'^PART\s+[IVXLCDM]+$', txt))
                )
                # Is it a part name (e.g. BACK ON THE PATH)?
                is_part_name = (
                    style in ['MorningstarPartName', 'PartName']
                    or (style == 'PartTitle' and previous_txt.startswith('PART '))
                    or (style == 'PartSubtitle' and current_part_needs_name)
                    or (style == 'none' and jc == 'center' and txt.isupper() and idx > 0 and previous_txt.startswith('PART '))
                )
                # Is it a part subtitle?
                is_part_subtitle = (
                    (style in ['PartSubtitle', 'MorningstarPartTheme', 'PartTheme', 'PartEpigraph'] and not is_part_name)
                    or (style == 'none' and jc == 'center' and idx > 1 and (previous_txt.startswith('PART ') or previous_previous_txt.startswith('PART ')) and not txt.isupper())
                )
                # Is it a chapter title?
                is_chap_title = style in ['ChapterTitle', 'MorningstarChapterTitle'] or (style == 'none' and jc == 'center' and txt.isupper() and not is_part_title and not is_part_name and txt != '* * *')
                
                if is_part_title:
                    current_part = {
                        "part_title": txt,
                        "part_name": "",
                        "part_subtitle": "",
                        "chapters": []
                    }
                    parts.append(current_part)
                elif is_part_name:
                    if current_part:
                        current_part["part_name"] = txt
                    else:
                        current_part = {
                            "part_title": "",
                            "part_name": txt,
                            "part_subtitle": "",
                            "chapters": []
                        }
                        parts.append(current_part)
                elif is_part_subtitle:
                    if current_part:
                        current_part["part_subtitle"] = txt
                elif is_chap_title:
                    current_chapter = {
                        "chapter_title": txt,
                        "paragraphs": []
                    }
                    if current_part:
                        current_part["chapters"].append(current_chapter)
                    else:
                        # Fallback if no part is defined yet
                        current_part = {
                            "part_title": "PART I",
                            "part_name": "BACK ON THE PATH",
                            "part_subtitle": "The road remembers what people deny.",
                            "chapters": [current_chapter]
                        }
                        parts.append(current_part)
                else:
                    # Regular text paragraph or section break
                    if current_chapter:
                        # Clean up formatting artifact, e.g. section break represented as * * * or ***
                        if txt == '* * *' or txt == '***':
                            current_chapter["paragraphs"].append("---") # we will use --- as section break symbol
                        else:
                            current_chapter["paragraphs"].append(txt)
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
    return parts

def roman_to_int(roman):
    val = {'I': 1, 'V': 5, 'X': 10}
    ans = 0
    for i in range(len(roman)):
        if i > 0 and val[roman[i]] > val[roman[i - 1]]:
            ans += val[roman[i]] - 2 * val[roman[i - 1]]
        else:
            ans += val[roman[i]]
    return ans

def get_file_sort_key(filename):
    match = re.search(r'Part[\s_]+([IVX]+)', filename, re.IGNORECASE)
    if match:
        return roman_to_int(match.group(1))
    return 999

def build_manuscript(doc_dir, output_path):
    all_parts = []
    files = [f for f in os.listdir(doc_dir) if f.endswith(".docx") and re.match(r'^Part[\s_]+[IVX]+', f, re.IGNORECASE)]
    files.sort(key=get_file_sort_key)
    
    # We will track part count to ensure correct IDs
    part_id = 1
    chapter_id = 1
    
    for f in files:
        full_path = os.path.join(doc_dir, f)
        print(f"Processing {f}...")
        parts = parse_docx(full_path)
        
        for part in parts:
            part["part_id"] = part_id
            part_id += 1
            
            # Assign chapter IDs
            for chap in part["chapters"]:
                chap["chapter_id"] = chapter_id
                chapter_id += 1
            
            all_parts.append(part)
            
    # Fix Part I which had PartTitle style twice
    # (The first part will have title 'PART I', name 'BACK ON THE PATH', etc.)
    # Let's check and merge duplicate parts if any
    merged_parts = []
    final_parts = []
    skip_next = False
    
    # We will just merge them in final parts directly
    for i in range(len(all_parts)):
        if skip_next:
            skip_next = False
            continue
        p = all_parts[i]
        if p["part_title"] == "PART I" and not p["chapters"] and i + 1 < len(all_parts):
            next_p = all_parts[i+1]
            if next_p["part_title"] == "BACK ON THE PATH":
                # Merge them
                combined = {
                    "part_id": p["part_id"],
                    "part_title": "PART I",
                    "part_name": "BACK ON THE PATH",
                    "part_subtitle": next_p["part_subtitle"] if next_p["part_subtitle"] else "The road remembers what people deny.",
                    "chapters": next_p["chapters"]
                }
                final_parts.append(combined)
                skip_next = True
                continue
        final_parts.append(p)
        
    # Re-index final parts and chapters
    chapter_counter = 1
    for p_idx, p in enumerate(final_parts):
        p["part_id"] = p_idx + 1
        for chap in p["chapters"]:
            chap["chapter_id"] = chapter_counter
            chapter_counter += 1
        
    with open(output_path, "w", encoding="utf-8") as out:
        json.dump(final_parts, out, ensure_ascii=False, indent=2)
    print(f"Successfully generated structured manuscript JSON at {output_path}")
    print(f"Total parts: {len(final_parts)}")
    print(f"Total chapters: {sum(len(p['chapters']) for p in final_parts)}")

if __name__ == "__main__":
    doc_dir = r"d:\DesignWork\Novel App\Novel Document Source"
    output_path = r"d:\DesignWork\Novel App\manuscript.json"
    build_manuscript(doc_dir, output_path)
