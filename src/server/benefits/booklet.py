import os
import argparse
import json
import fitz
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional, Tuple
from utils import callGPT, setup_results_directory, CUMULATIVE_TOKENS
import concurrent.futures
from collections import defaultdict
import math

class BookletSection:
    def __init__(self, heading: str, attributes: dict, body: str, sequence: int, page: int,
                 summary=None, classification=None, key_entities=None, breadcrumb_heading=None):
        self.heading = heading
        self.breadcrumb_heading = breadcrumb_heading
        self.attributes = attributes
        self.body = body
        self.sequence = sequence
        self.page = page
        self.summary = summary
        self.classification = classification
        self.key_entities = key_entities
        #print(f"Page: {page} | {heading}")

    def to_dict(self):
        return {
            "heading": self.heading,
            "breadcrumb_heading": self.breadcrumb_heading,
            "attributes": self.attributes,
            "body": self.body,
            "summary": self.summary,
            "classification": self.classification,
            "key_entities": self.key_entities,
            "sequence": self.sequence,
            "page": self.page
        }

    @classmethod
    def from_dict(cls, data):
        return cls(**data)

    def __repr__(self):
        return f"BookletSection(heading='{self.heading}', breadcrumb_heading='{self.breadcrumb_heading}', body={self.body}, classification={self.classification}, sequence={self.sequence}, page={self.page})"

    def summarize(self):
        if self.summary is None:
            summary_data = summarize_text(self.heading, self.body)
            self.heading = summary_data.get("heading", "")
            self.summary = summary_data.get("summary", "")
            self.classification = summary_data.get("classification", "")
            self.key_entities = summary_data.get("key_entities", "")
        return self.summary

class BenefitsBooklet:
    def __init__(self, pdf_path, results_dir):
        self.pdf_path = pdf_path
        self.results_dir = results_dir
        self.sections = []
        self.hierarchical = False
        self.load_or_process()

    def get_cache_filename(self):
        base_name = "booklet"
        return os.path.join(self.results_dir, f"{base_name}_cache.json")

    def parallel_summarize(self, max_workers=1):
        print("Starting parallel summarization...")
        sections_to_summarize = [section for section in self.sections if section.summary is None]

        if not sections_to_summarize:
            print("No sections require summarization.")
            return

        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(section.summarize): section for section in sections_to_summarize}

            for future in concurrent.futures.as_completed(futures):
                section = futures[future]
                try:
                    future.result()  # Get the result to raise any exceptions
                    print(f"Summarized section: {section.heading}")
                except Exception as e:
                    print(f"Error summarizing section {section.heading}: {e}")

        print("Parallel summarization completed.")

    def load_or_process(self):
        cache_filename = self.get_cache_filename()
        cached_data = load_cache(cache_filename)

        if cached_data:
            self.sections = [BookletSection.from_dict(s) for s in cached_data["provisions"]]
            self.hierarchical = cached_data.get("hierarchical", False)
            print("Booklet cache loaded successfully.")
            if not self.hierarchical:
                self.reconstruct_hierarchy()
                data = {
                    "provisions": [section.to_dict() for section in self.sections],
                    "hierarchical": self.hierarchical
                }
                save_cache(data, cache_filename)
                print("Data saved to cache.")

        else:
            print("Cache not found or failed to load. Parsing PDF...")
            self.parse_pdf()

            # Run parallel summarization
            self.parallel_summarize()

            # Reconstruct the hierarchy after summarization
            self.reconstruct_hierarchy()

            # Save the processed data to the cache
            data = {
                "provisions": [section.to_dict() for section in self.sections],
                "hierarchical": self.hierarchical
            }
            save_cache(data, cache_filename)
            print("Data saved to cache.")

    def build_style_list(self, pdf_document) -> List[Dict[str, Any]]:
        #page_width = get_page_width(pdf_document)
        page_left_margin, page_right_margin = get_page_width(pdf_document)

        style_dict = defaultdict(lambda: {"count": 0, "pages": set(), "text": set()})

        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            blocks = page.get_text("dict")["blocks"]
            page_fonts = page.get_fonts()

            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            style_key = extract_span_style(span, page_left_margin, page_right_margin, page_fonts)
                            style_dict[style_key]["count"] += 1
                            style_dict[style_key]["pages"].add(page_num + 1)
                            style_dict[style_key]["text"].add(span["text"])

        style_list = [
            {
                "attributes": {
                    "size": style[0],
                    "formatting": ", ".join(style[1]),
                    "alignment": style[2],
                    "indentation": style[3]
                },
                "span_count": data["count"],
                "unique_pages": len(data["pages"]),
                "pages": sorted(list(data["pages"])),
                "sample_text": list(data["text"])[:5]  # Include up to 5 sample texts
            }
            for style, data in style_dict.items()
        ]

        return sorted(style_list, key=lambda x: (-x["span_count"], -x["unique_pages"]))

    def extract_text_with_headers_footers(self, header_margin=0, footer_margin=0) -> List[Dict[str, Any]]:

        def evaluate_group(group_text, style_key, page_num):
            nonlocal current_provision, sequence
            font_size, formatting = style_key[0], ", ".join(style_key[1])
            alignment, indentation = style_key[2], style_key[3]
            attributes = {
                "size": font_size,
                "formatting": formatting,
                "indentation": indentation,
                "page": page_num + 1,
                "alignment": alignment
            }
            header = True

            # Check 1: Font Size at least Normal Size
            if float(font_size) < normal_font_size:
                header = False

            # Check 2: Headings must be BOLD
            if "bold" not in formatting:
                header = False

            # Check 3: Heading lines cannot have multiple styles
            if "Mixed" in formatting:
                header = False

            # Check 4: Check that Header Style is Repeated
            style = lookup_style(style_list, attributes)
            if style:
                if style["unique_pages"] < 2 or style["span_count"] < 3:
                    print(f"...dropped {group_text} -> unique pages is only {style['unique_pages']} | {attributes}")
                    header = False
            else:
                if "Mixed" not in style_key[1]:
                    print(f"error, no style found: {group_text} | {style_key} | {page_num}")

            # Check 5: Check if it is too short for a Header
            if len(group_text) < 3:
                header = False

            # Check 6: Check for periods. Headers don't tend to have them.
            if "." in group_text:
                header = False

            # Check 7: Check for Phrases that Automatically Qualify as Header
            if group_text in ["Summary of Benefits", "Table of Contents", "Schedule of Benefits",
                                  "Benefit Schedule", "Benefit Summary"]:
                print(f"automatically included {group_text}")
                header = True

            # Create a New Section or add Text to Section Body
            if header:
                # Stores Previous Section & Opens New Section
                if current_provision:
                    result.append(current_provision)
                current_provision = {
                    'heading': group_text.strip(),
                    'attributes': attributes,
                    'body': "",
                    'sequence': sequence,
                    'page': page_num + 1
                }
                sequence += 1
                print(f"New heading: {group_text.strip()} | {attributes}")
            else:
                current_provision['body'] += group_text + " "

        def get_page_initial_lines(page_num, max_lines=5):
            """Get the first few lines of a page, stopping at first content difference"""
            if page_num < 0 or page_num >= pdf_document.page_count:
                return []

            page = pdf_document.load_page(page_num)
            blocks = page.get_text("dict", sort=True)["blocks"]
            lines = []

            # Collect all lines with their positions
            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        if line["spans"]:
                            line_text = " ".join(span["text"] for span in line["spans"]).strip()
                            bbox = line["spans"][0]["bbox"]
                            if line_text:
                                lines.append({
                                    "text": line_text,
                                    "bbox": bbox,
                                    "top": bbox[1]  # y1 coordinate
                                })

            # Sort by top position
            lines.sort(key=lambda x: x["top"])

            # Return first N lines
            return lines[:max_lines]

        def get_page_final_lines(page_num, max_lines=5):
            """Get the last few lines of a page, from bottom up"""
            if page_num < 0 or page_num >= pdf_document.page_count:
                return []

            page = pdf_document.load_page(page_num)
            blocks = page.get_text("dict", sort=True)["blocks"]
            lines = []

            # Collect all lines with their positions
            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        if line["spans"]:
                            line_text = " ".join(span["text"] for span in line["spans"]).strip()
                            bbox = line["spans"][0]["bbox"]
                            if line_text:
                                lines.append({
                                    "text": line_text,
                                    "bbox": bbox,
                                    "bottom": bbox[3]  # y2 coordinate
                                })

            # Sort by bottom position, reverse to get bottom-up order
            lines.sort(key=lambda x: x["bottom"], reverse=True)

            # Return first N lines from bottom
            return lines[:max_lines]

        header_margin = float(header_margin)
        footer_margin = float(footer_margin)
        pdf_document = fitz.open(self.pdf_path)
        style_list = self.build_style_list(pdf_document)
        normal_font_style = style_list[0]
        normal_font_size = normal_font_style["attributes"]["size"]

        print("\nSTYLE LIST")
        for style in style_list:
            print(style)
        print(f"Total # of styles are {len(style_list)}\n")

        result = []
        current_provision = {
            'heading': 'Preamble',
            'attributes': {"size": normal_font_size,"formatting": "regular","indentation": 0,"page": 1,"alignment": "left"},
            'body': "",
            'sequence': 0,
            'page': 1
        }
        sequence = 1
        accumulated_text = ""
        current_style_key = None
        previous_page_first_lines = []

        #effective_width = get_page_width(pdf_document)
        page_left_margin, page_right_margin = get_page_width(pdf_document)

        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            blocks = page.get_text("dict", sort=True)["blocks"]
            page_height = page.rect.height
            page_fonts = page.get_fonts()
            #is_first_line_on_page = True

            # Get initial lines from current, previous and next pages
            current_lines = get_page_initial_lines(page_num)
            prev_lines = get_page_initial_lines(page_num - 1)  # Adjacent previous
            #next_lines = get_page_initial_lines(page_num + 1)  # Adjacent next
            prev2_lines = get_page_initial_lines(page_num - 2)  # Alternating previous
            #next2_lines = get_page_initial_lines(page_num + 2)  # Alternating next

            # Find how many lines match with previous and next pages
            header_lines = []
            for i, current in enumerate(current_lines):
                # Remove digits before comparing
                current_text = ''.join(c for c in current["text"] if not c.isdigit()).strip()

                # Check if this line matches in any of the surrounding pages
                prev_match = (i < len(prev_lines) and
                              current_text == ''.join(c for c in prev_lines[i]["text"] if not c.isdigit()).strip())
                #next_match = (i < len(next_lines) and
                #              current_text == ''.join(c for c in next_lines[i]["text"] if not c.isdigit()).strip())
                prev2_match = (i < len(prev2_lines) and
                               current_text == ''.join(c for c in prev2_lines[i]["text"] if not c.isdigit()).strip())
                #next2_match = (i < len(next2_lines) and
                #               current_text == ''.join(c for c in next2_lines[i]["text"] if not c.isdigit()).strip())

                # Line is a header if it matches either adjacent pages OR alternating pages
                #if prev_match or next_match or prev2_match or next2_match:

                if prev_match or prev2_match:
                    header_lines.append((current["text"], current["top"]))
                else:
                    break

            # Get final lines from current and surrounding pages
            current_lines = get_page_final_lines(page_num)
            prev_lines = get_page_final_lines(page_num - 1)
            next_lines = get_page_final_lines(page_num + 1)
            prev2_lines = get_page_final_lines(page_num - 2)
            next2_lines = get_page_final_lines(page_num + 2)

            # Find how many lines match from bottom up
            footer_lines = []
            for i, current in enumerate(current_lines):
                # Remove digits before comparing
                current_text = ''.join(c for c in current["text"] if not c.isdigit()).strip()

                # Compare with corresponding lines in other pages
                prev_match = (i < len(prev_lines) and
                              current_text == ''.join(c for c in prev_lines[i]["text"] if not c.isdigit()).strip())
                next_match = (i < len(next_lines) and
                              current_text == ''.join(c for c in next_lines[i]["text"] if not c.isdigit()).strip())
                prev2_match = (i < len(prev2_lines) and
                               current_text == ''.join(
                            c for c in prev2_lines[i]["text"] if not c.isdigit()).strip())
                next2_match = (i < len(next2_lines) and
                               current_text == ''.join(
                            c for c in next2_lines[i]["text"] if not c.isdigit()).strip())

                if prev_match or next_match or prev2_match or next2_match:
                    footer_lines.append((current["text"], current["bottom"]))
                else:
                    break

            lines_processed = 0
            lines_processed_from_bottom = 0

            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        first_span = line["spans"][0] if line["spans"] else None
                        if not first_span:
                            continue

                        line_text = " ".join(span["text"] for span in line["spans"]).strip()
                        if not line_text:
                            continue

                        bbox = first_span["bbox"]

                        # Skip if it's part of the page header
                        if any(line_text == h[0] and abs(bbox[1] - h[1]) < 5 for h in header_lines):
                            print(f"Skipping header line: {line_text[:50]}...")
                            continue

                        # Skip if it's part of the page footer
                        if any(line_text == f[0] and abs(bbox[3] - f[1]) < 5 for f in footer_lines):
                            print(f"Skipping footer line: {line_text[:50]}...")
                            continue

                        # Get style info for this line
                        line_text = clean_text(line_text)
                        style_key = extract_span_style(first_span, page_left_margin, page_right_margin, page_fonts)

                        # Accumulate Lines with Same Style. Allocate to Heading or Body.
                        consistent_style_across_line = line_has_one_style(line)
                        if consistent_style_across_line and style_matches(style_key, current_style_key):
                            accumulated_text += " " + line_text
                        else:
                            if accumulated_text:
                                evaluate_group(accumulated_text, current_style_key, page_num)
                            accumulated_text = line_text
                            current_style_key = style_key
                            if not consistent_style_across_line:
                                current_style_key = (0, ('Mixed'), 'Mixed', 0)    # Just add a style that will never match so that mixed line is processed by itself

            # Evaluate any remaining accumulated text at the end of the page
            if accumulated_text:
                evaluate_group(accumulated_text, current_style_key, page_num)
                accumulated_text = ""
                current_style_key = None

        # Add the last provision if it exists
        if current_provision:
            result.append(current_provision)

        # Remove the preamble if it's empty
        if result[0]['heading'] == 'Preamble' and not result[0]['body'].strip():
            result.pop(0)

        print(f"Extraction complete. Total provisions extracted: {len(result)}")
        return result

    def parse_pdf(self):
        # Extract text from the PDF
        extracted_provisions = self.extract_text_with_headers_footers()

        # Create sections from the extracted provisions
        self.sections = [
            BookletSection(
                p['heading'],
                p['attributes'],
                p['body'],
                sequence=p['sequence'],
                page=p['page']
            )
            for p in extracted_provisions
        ]
        print("Parsed PDF.")

    def reconstruct_hierarchy(self):
        if not self.hierarchical:
            self.sections.sort(key=lambda p: p.sequence)

            # Initialize the hierarchy stack with the first provision
            hierarchy = [self.sections[0]]
            self.sections[0].breadcrumb_heading = self.sections[0].heading
            #print(self.sections[0].breadcrumb_heading)

            for section in self.sections[1:]:


                comparison = compare_headings(section, hierarchy[-1])

                # Compare with the last item in the hierarchy
                while comparison > 0:
                    hierarchy.pop()
                    if hierarchy:
                        comparison = compare_headings(section, hierarchy[-1])
                    else:
                        comparison = 0

                # If we reached the top, start a new branch
                if not hierarchy:
                    hierarchy = [section]
                    section.breadcrumb_heading = section.heading

                # If it's equal, add at the same level (sibling)
                elif comparison == 0:
                    hierarchy.pop()
                    hierarchy.append(section)
                    section.breadcrumb_heading = ' -> '.join([h.heading for h in hierarchy])

                # If it's "smaller", add as a child
                else:
                    hierarchy.append(section)
                    section.breadcrumb_heading = ' -> '.join([h.heading for h in hierarchy])

                #print(section.breadcrumb_heading)

            self.hierarchical = True
            print("Reconstructed heading hierarchy.")

            # Save the reconstructed hierarchy to the cache
            cache_filename = self.get_cache_filename()
            data = {
                "provisions": [section.to_dict() for section in self.sections],
                "hierarchical": self.hierarchical
            }
            save_cache(data, cache_filename)
            print("Hierarchy saved to cache.")

    def print_hierarchy(self):
        """Print the document hierarchy using breadcrumb headings"""
        for section in self.sections:
            print(section.breadcrumb_heading)

    def get_mini_booklet(self) -> List[Dict[str, Any]]:
        """
        Get a complete outline of the document structure with summaries.
        Used by get_mini_booklet tool.

        Returns:
            List[Dict] containing all sections:
            [{
                'heading': str,
                'breadcrumb_heading': str,
                'summary': str,
                'classification': str,
                'page': int
            }]
        """
        return [{
            'heading': s.heading,
            'breadcrumb_heading': s.breadcrumb_heading,
            'summary': s.summary,
            'classification': s.classification,
            'page': s.page
        } for s in self.sections]

    def get_full_booklet(self) -> List[Dict[str, Any]]:
        return [p.to_dict() for p in self.sections]

    def get_section_context(self, breadcrumb_heading: str) -> List[Dict[str, Any]]:
        """
        Get the context of a section by returning all sections in its path.
        For the target section, also includes a listing of direct sub-sections.

        Args:
            breadcrumb_heading: Full path to the section

        Returns:
            List[Dict] containing all sections in the path:
            [{
                'heading': str,
                'breadcrumb_heading': str,
                'body': str,
                'classification': str,
                'page': int,
                'sub-sections': List[str]  # Only present for target section
            }]
        """
        target_section = next((s for s in self.sections
                               if s.breadcrumb_heading == breadcrumb_heading), None)
        if not target_section:
            return []

        target_path = breadcrumb_heading.split(' -> ')
        context = []

        # Find sub-sections for target section
        sub_sections = []
        target_path_str = breadcrumb_heading + " -> "
        for section in self.sections:
            if (section.breadcrumb_heading.startswith(target_path_str) and
                    len(section.breadcrumb_heading.split(' -> ')) == len(target_path) + 1):
                sub_sections.append(section.heading)

        # Build context including ancestor sections
        for section in self.sections:
            section_path = section.breadcrumb_heading.split(' -> ')
            if (len(section_path) <= len(target_path) and
                    all(sp == tp for sp, tp in zip(section_path, target_path))):
                section_dict = {
                    'heading': section.heading,
                    'breadcrumb_heading': section.breadcrumb_heading,
                    'body': section.body,
                    'classification': section.classification,
                    'page': section.page
                }

                # Add sub-sections only to target section
                if section.breadcrumb_heading == breadcrumb_heading:
                    section_dict['sub-sections'] = sub_sections

                context.append(section_dict)

        return context

    def get_booklet_outline(self) -> List[Dict[str, Any]]:
        mini_booklet = [
            {
                "breadcrumb_heading": s.breadcrumb_heading,
                "classification": s.classification
            }
            for s in self.sections
        ]
        return mini_booklet



# HELPER METHODS BELOW

def is_all_caps(text):
    return text.isupper() and any(c.isalpha() for c in text)

def compare_headings(current, previous):
    # First, compare font sizes
    if current.attributes['size'] != previous.attributes['size']:
        return current.attributes['size'] - previous.attributes['size']

    # If font sizes are the same, check capitalization
    current_is_caps = "ALL CAPS" in current.attributes['formatting']
    previous_is_caps = "ALL CAPS" in previous.attributes['formatting']
    if current_is_caps != previous_is_caps:
        return 1 if current_is_caps else -1

    if current.attributes['alignment'] != 'left' and current.attributes['alignment'] != 'unknown':
        if previous.attributes['alignment'] != 'left' and previous.attributes['alignment'] != 'unknown':
            return 0
        if previous.attributes['alignment'] == 'left' or previous.attributes['alignment'] == 'unknown':
            return 1
    elif previous.attributes['alignment'] != 'left' and previous.attributes['alignment'] != 'unknown':
        return -1

    # If capitalization is the same, check indentation
    return previous.attributes['indentation'] - current.attributes['indentation']

def determine_alignment_and_indentation(bbox: List[float], page_left_margin: float, page_right_margin: float,  margin: float = 10) -> Tuple[str, float]:
    left, right = bbox[0], bbox[2]
    center = (left + right) / 2

    left_margin = bbox[0] - page_left_margin
    right_margin = page_right_margin - bbox[2]
    margin_difference = abs(left_margin - right_margin)

    if left < page_left_margin + margin:
        return "left", 0
    if margin_difference < margin:
        return "center", 0
    if right > (page_right_margin - margin):
        return "right", 0
    else:
        return "left", math.floor(left/5)*5

def extract_span_style(span: Dict[str, Any], page_left_margin: float, page_right_margin: float, page_fonts: List[Tuple]) -> Tuple[Any, ...]:
    font_size = round(float(span["size"]), 2)
    bbox = span["bbox"]

    formatting, _ = extract_font_properties(span, page_fonts)
    alignment, indentation = determine_alignment_and_indentation(bbox, page_left_margin, page_right_margin)

    return (
        font_size,
        tuple(sorted(formatting)),
        alignment,
        indentation
    )

def extract_font_properties(span: Dict[str, Any], page_fonts: List[Tuple]) -> Tuple[List[str], str]:
    font_flags = span["flags"]
    font_name = span["font"]
    text = span["text"].strip()

    formatting = []
    if font_flags & 2 or font_flags & 16:
        formatting.append("bold")
    if font_flags & 4:
        formatting.append("italic")
    if font_flags & 8:
        formatting.append("underline")

    font = next((f for f in page_fonts if f[3] == font_name), None)

    if text.isupper() or (font and "allcaps" in font[2]):
        formatting.append("ALL CAPS")
        text = text.upper()
    elif is_title_case(text):
        formatting.append("Title Case")

    return formatting, text

def get_page_width(pdf_document) -> float:
    max_right = 0
    min_left = float('inf')
    for page_num in range(pdf_document.page_count):
        page = pdf_document.load_page(page_num)
        blocks = page.get_text("dict")["blocks"]
        #blocks = page.get_text("text")["blocks"]

        for block in blocks:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        bbox = span["bbox"]
                        min_left = min(min_left, bbox[0])
                        max_right = max(max_right, bbox[2])
    return min_left, max_right

def lookup_style(style_list: List[Dict[str, Any]], attributes: Dict[str, Any]) -> Dict[str, Any]:
    for style in style_list:
        if (style["attributes"]["size"] == attributes["size"] and
                style["attributes"]["formatting"] == attributes["formatting"] and
                style["attributes"]["alignment"] == attributes["alignment"] and
                (attributes["alignment"] != "left" or
                 style["attributes"]["indentation"] == attributes["indentation"])):
            return style
    return None

def clean_text(text):
    replacements = {
        "ﬁ": "fi",
        "ﬂ": "fl",
        "Ɵ": "ti",
        # Add more replacements as you encounter them
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text

def is_title_case(text):
    words = []
    current_word = ""
    in_parentheses = False

    # Split words and handle parentheses
    for char in text:
        if char == '(':
            in_parentheses = True
            if current_word:
                words.append(current_word)
                current_word = ""
        elif char == ')':
            in_parentheses = False
            if current_word:
                words.append(current_word)
                current_word = ""
        elif char.isspace() and not in_parentheses:
            if current_word:
                words.append(current_word)
                current_word = ""
        else:
            current_word += char

    if current_word:
        words.append(current_word)

    if not words:
        return False

    if not words[0][0].isupper():
        return False

    small_words = {'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with'}

    for i, word in enumerate(words[1:], 1):
        word_without_parentheses = word.strip('()')
        if word_without_parentheses.lower() not in small_words and not word_without_parentheses[0].isupper():
            return False
        if word_without_parentheses.lower() in small_words and i != len(words) - 1 and word_without_parentheses[
            0].isupper():
            return False

    return True

def summarize_text(heading: str, text: str) -> Dict[str, Any]:
    prompt = f"""
            # Input
            The following is a section from an employee benefits booklet under the heading: [{heading}]
            Here is the text: [{text}]

            # Task
            Your task is to:
            1. Summarize the text in 30 words or less.
            2. Classify the type of information contained in the text.
            3. Extract key entities mentioned in the text.
            4. Use the text to detect and correct any spelling issues in the heading.

            # Rules for Summarization:
            - Preserve all proper nouns to clearly indicate which benefits or benefit attributes are being described.
            - Focus on the most important information that gives a clear overview of the section's content.
            - Use concise language while maintaining clarity.

            # Rules for Classification:
            - Assign only one classification to each section. Choose the best fit.
            - If the content spans multiple categories, choose the most dominant or important one.

            # Classification Categories:
            1. Plan Membership Rules: Eligibility criteria, enrollment requirements, membership conditions.
            2. Benefit Provisions: Coverage details, benefit amounts, conditions, exclusions, limitations.
            3. Procedural Information: Claim processes, enrollment procedures, how to access benefits.
            4. Contractual Obligations: Information change notifications, coordination of benefits, legal responsibilities.
            5. Definitions: Descriptions of key terms, qualifying persons/earnings/service, spousal/dependent definitions.
            6. Financial Information: Premium details, cost-sharing, deductibles, co-pays.
            7. Timeline Information: Important dates, deadlines, waiting periods.
            8. Contact Information: Resources for questions, support contacts.
            9. Other: Any content that doesn't fit into the above categories.

            # Entity Extraction:
            - Identify and list key entities mentioned in the text. These may include:
              - Specific benefits (e.g., "Dental Plan", "Life Insurance")
              - Important dates or time periods
              - Monetary amounts or percentages
              - Job titles or roles
              - Company names or departments

            # Output
            Return your results in JSON format as follows:""" + """
            {
              "heading": "Place the section heading here, correct for any spelling mistakes"
              "summary": "Place the summarized text here (30 words or less)",
              "classification": "One of: Plan Membership Rules, Benefit Provisions, Procedural Information, Contractual Obligations, Definitions, Financial Information, Timeline Information, Contact Information, Other",
              "key_entities": [
                "List",
                "of",
                "key",
                "entities",
                "extracted",
                "from",
                "the",
                "text"
              ]
            }

            # Additional Instructions:
            1. Ensure the summary is concise but informative, capturing the essence of the section.
            2. Be as specific as possible with the classification, using the provided categories.
            3. For entity extraction, focus on names, terms, or values that are crucial to understanding the benefits or procedures described.
            4. If the text is too short or vague to classify confidently, use the "Other" category and explain briefly in the summary.
            """

    messages = [{"role": "system", "content": prompt}]
    summary = callGPT(messages, JSONflag=True)
    return summary

def save_cache(data: Dict[str, Any], filename: str) -> None:
    """Helper function to save data to a JSON cache file."""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

def load_cache(filename: str) -> Optional[Dict[str, Any]]:
    """Helper function to load data from a JSON cache file."""
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return None

def line_has_one_style(line):
    spans = line["spans"]
    if not spans:
        return False

    first_span = spans[0]
    first_size = first_span["size"]
    first_font = first_span["font"]
    first_flags = first_span["flags"]

    for span in spans[1:]:
        if span["text"].strip():  # Only consider non-empty spans
            if (span["size"] != first_size or
                    span["font"] != first_font or
                    span["flags"] != first_flags):
                return False

    return True

def style_matches(style1, style2):
    if style1 is None or style2 is None:
        return False
    # Compare font size, formatting, alignment and indentation
    return style1[0] == style2[0] and style1[1] == style2[1] and style1[2] == style2[2] and style1[3] == style2[3]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--out", required=True)  # directory to write booklet_cache.json
    parser.add_argument("--summarize", action="store_true")
    args = parser.parse_args()

    # Load API key from src/server/.env for parity with TS
    load_dotenv(os.path.join("src", "server", ".env"))

    # TODO: call your existing load_or_process(pdf=args.pdf, out=args.out, summarize=args.summarize)
    # and write JSON to f"{args.out}/booklet_cache.json"
    #
    # Pseudocode:
    # result = BenefitsBookletPY(pdf_path=args.pdf, results_dir=args.out, summarize=args.summarize).run()
    # with open(os.path.join(args.out, "booklet_cache.json"), "w") as f:
    #     json.dump(result, f, indent=2)

if __name__ == "__main__":
    main()
