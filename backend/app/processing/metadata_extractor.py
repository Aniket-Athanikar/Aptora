"""
Aptora - Metadata Extractor
===================================

Processing stage: DocumentProcessor → MetadataExtractor

Extracts structured metadata from cleaned document text produced by
TextCleaner.  The metadata powers search, library filters, AI retrieval,
workspace UI, and analytics inside Aptora.

All extraction is done with deterministic regex heuristics — no NLP
libraries or external API calls are required.

Design principles
-----------------
- Pure-function interface  (MetadataExtractor.extract is stateless)
- No external dependencies – pure Python stdlib only
- Conservative heading detection: prefer false negatives over false positives
  (better to miss a heading than to treat body text as one)
- Returns a well-typed dict (MetadataDict TypedDict) for static analysis
"""

from __future__ import annotations

import logging
import re
from typing import TypedDict

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Average characters per page used for page estimation.
# Typical A4 document: ~2 000–2 500 chars/page; 2 200 is a safe middle value.
_CHARS_PER_PAGE: int = 2_200

# Maximum characters of text scanned when inferring the document title.
# Titles virtually always appear in the first 500 characters of clean text.
_TITLE_SCAN_LIMIT: int = 500

# Minimum / maximum lengths for a line to be considered a heading.
_HEADING_MIN_LEN: int = 3
_HEADING_MAX_LEN: int = 120

# A line that exceeds this word count is almost certainly body text, not a
# heading — even if it is ALL CAPS or matches a numbered pattern.
_HEADING_MAX_WORDS: int = 12

# Language detection: map trigram fingerprints to ISO language names.
# Expanded list covering major European + South / East Asian languages.
_LANGUAGE_TRIGRAMS: dict[str, list[str]] = {
    "English":    ["the", "and", "for", "that", "this", "with", "are", "not"],
    "Spanish":    ["que", "los", "las", "del", "una", "por", "con", "para"],
    "French":     ["les", "des", "que", "est", "une", "pas", "sur", "dans"],
    "German":     ["die", "der", "und", "den", "das", "ist", "ich", "von"],
    "Italian":    ["che", "del", "per", "una", "con", "non", "sono", "nel"],
    "Portuguese": ["que", "uma", "para", "com", "por", "nos", "mas", "ele"],
    "Dutch":      ["van", "het", "een", "dat", "zijn", "niet", "ook", "maar"],
    "Hindi":      ["hai", "mein", "nahi", "kya", "hain", "aur", "yeh", "koi"],
}

# ---------------------------------------------------------------------------
# Compiled regex patterns
# ---------------------------------------------------------------------------

# Markdown headings: lines starting with one or more '#' characters.
_RE_MARKDOWN_HEADING = re.compile(
    r"^(?P<level>#{1,6})\s+(?P<text>.+)$",
    re.MULTILINE,
)

# Numbered headings: "1.", "1.1", "1.1.2", "Chapter 3", "Section 4.2" etc.
_RE_NUMBERED_HEADING = re.compile(
    r"""
    ^
    (?:
        (?:Chapter|Section|Part|Unit|Module|Lecture|Topic|Lesson)   # keyword prefix
        \s+\d+[\d.]*                                                 # followed by number
        |
        \d+(?:\.\d+)*\.?                                             # bare "1." / "1.2.3"
    )
    \s+
    (?P<text>[A-Z][^\n]{2,""" + str(_HEADING_MAX_LEN) + r"""})      # heading text
    $
    """,
    re.VERBOSE | re.MULTILINE,
)

# ALL-CAPS headings: a line that is entirely uppercase letters (and common
# punctuation) and is short enough to be a heading.
_RE_ALLCAPS_HEADING = re.compile(
    r"^(?P<text>[A-Z][A-Z0-9\s\-:,&/()]{2," + str(_HEADING_MAX_LEN) + r"})$",
    re.MULTILINE,
)

# Chapter detection patterns: "Chapter 1", "CHAPTER ONE", "1. Introduction" etc.
_RE_CHAPTER = re.compile(
    r"""
    ^
    (?:
        Chapter\s+\d+               # "Chapter 1"
        | CHAPTER\s+\d+             # "CHAPTER 1"
        | Chapter\s+[IVXLCDM]+      # "Chapter IV"
        | CHAPTER\s+[IVXLCDM]+      # "CHAPTER IV"
        | \d+\.\s+[A-Z][a-z]        # "1. Introduction" (first word capitalised)
    )
    .*
    $
    """,
    re.VERBOSE | re.IGNORECASE | re.MULTILINE,
)

# Lines that are most likely body text even when ALL CAPS (skip them).
_RE_LIKELY_BODY = re.compile(
    r"""
    (?:
        https?://           # URLs
        | www\.             # URLs
        | @                 # e-mail / mentions
        | \d{4}-\d{2}-\d{2} # ISO dates
        | [=\-_]{4,}        # separator lines
    )
    """,
    re.VERBOSE,
)


# ---------------------------------------------------------------------------
# Return-type definition
# ---------------------------------------------------------------------------


class MetadataDict(TypedDict):
    """
    Typed return value of ``MetadataExtractor.extract()``.

    Fields
    ------
    title:
        Inferred document title (first prominent heading or filename stem).
    language:
        Detected natural language (e.g. ``"English"``).  Falls back to
        ``"Unknown"`` when detection is inconclusive.
    estimated_pages:
        Page estimate based on character count and average chars-per-page.
    word_count:
        Whitespace-delimited token count of *text*.
    character_count:
        ``len(text)`` after cleaning.
    chapter_count:
        Number of detected chapter-level headings.
    chapters:
        Ordered list of unique chapter heading texts.
    headings:
        Ordered list of all unique detected headings (all types combined),
        including the chapter headings.
    """

    title: str
    language: str
    estimated_pages: int
    word_count: int
    character_count: int
    chapter_count: int
    chapters: list[str]
    headings: list[str]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


class MetadataExtractor:
    """
    Stateless metadata extraction utility for cleaned document text.

    Usage
    -----
    ::

        from app.processing.metadata_extractor import MetadataExtractor

        result = MetadataExtractor.extract(clean_text, filename="lec1.pdf")

        print(result["title"])
        print(result["language"])
        print(result["headings"])

    The ``extract`` method is the single public entry point.  All helpers
    are private and not part of the stable API.
    """

    @staticmethod
    def extract(
        text: str,
        filename: str = "",
    ) -> MetadataDict:
        """
        Extract structured metadata from *text*.

        Parameters
        ----------
        text:
            Cleaned document text produced by ``TextCleaner.clean()``.
        filename:
            Original filename (e.g. ``"lec1.pdf"``).  Used as a fallback
            title when no heading can be detected in the text.

        Returns
        -------
        MetadataDict
            Structured metadata dictionary.  All fields are always present;
            lists default to ``[]``, strings to ``"Unknown"`` or ``""``,
            and integers to ``0``.
        """
        if not text or not text.strip():
            logger.warning(
                "[MetadataExtractor] Received empty text for '%s'", filename
            )
            return MetadataExtractor._empty_result(filename)

        logger.info(
            "[MetadataExtractor] Extracting metadata from '%s' (%d chars)",
            filename,
            len(text),
        )

        # ── Headings ──────────────────────────────────────────────────────
        markdown_headings  = MetadataExtractor._extract_markdown_headings(text)
        numbered_headings  = MetadataExtractor._extract_numbered_headings(text)
        allcaps_headings   = MetadataExtractor._extract_allcaps_headings(text)

        # Merge all heading sources, preserving order and deduplicating.
        all_headings: list[str] = MetadataExtractor._merge_unique(
            markdown_headings + numbered_headings + allcaps_headings
        )

        # ── Chapters ──────────────────────────────────────────────────────
        chapters: list[str] = MetadataExtractor._extract_chapters(text)

        # ── Title ─────────────────────────────────────────────────────────
        title: str = MetadataExtractor._infer_title(
            text=text,
            headings=all_headings,
            filename=filename,
        )

        # ── Language ──────────────────────────────────────────────────────
        language: str = MetadataExtractor._detect_language(text)

        # ── Counts ────────────────────────────────────────────────────────
        character_count: int = len(text)
        word_count: int      = len(text.split())
        estimated_pages: int = max(1, round(character_count / _CHARS_PER_PAGE))

        result = MetadataDict(
            title=title,
            language=language,
            estimated_pages=estimated_pages,
            word_count=word_count,
            character_count=character_count,
            chapter_count=len(chapters),
            chapters=chapters,
            headings=all_headings,
        )

        logger.info(
            "[MetadataExtractor] Done: title='%s', lang='%s', "
            "~%d pages, %d headings, %d chapters",
            title,
            language,
            estimated_pages,
            len(all_headings),
            len(chapters),
        )

        return result

    # -----------------------------------------------------------------------
    # Private helpers
    # -----------------------------------------------------------------------

    @staticmethod
    def _empty_result(filename: str) -> MetadataDict:
        """
        Return a zero-value ``MetadataDict`` for empty or missing input.

        The title falls back to the filename stem when available.
        """
        stem = filename.rsplit(".", 1)[0] if "." in filename else filename
        return MetadataDict(
            title=stem or "Unknown",
            language="Unknown",
            estimated_pages=0,
            word_count=0,
            character_count=0,
            chapter_count=0,
            chapters=[],
            headings=[],
        )

    # ── Heading extractors ────────────────────────────────────────────────

    @staticmethod
    def _extract_markdown_headings(text: str) -> list[str]:
        """
        Extract headings written in Markdown style (``# Heading``).

        Recognises ``#`` through ``######`` (h1–h6).  The leading hash
        characters and surrounding whitespace are stripped from the result.

        Returns
        -------
        list[str]
            Ordered list of heading texts, duplicates not yet removed.
        """
        headings: list[str] = []

        for match in _RE_MARKDOWN_HEADING.finditer(text):
            heading_text = match.group("text").strip()
            if MetadataExtractor._is_valid_heading(heading_text):
                headings.append(heading_text)

        return headings

    @staticmethod
    def _extract_numbered_headings(text: str) -> list[str]:
        """
        Extract numbered headings such as:

        - ``1. Introduction``
        - ``1.2 Background``
        - ``Chapter 3 Results``
        - ``Section 2.1 Methodology``

        Returns
        -------
        list[str]
            Ordered list of full heading lines (number + text).
        """
        headings: list[str] = []

        for match in _RE_NUMBERED_HEADING.finditer(text):
            # Capture the full matched line (number + text).
            full_line = match.group(0).strip()
            if MetadataExtractor._is_valid_heading(full_line):
                headings.append(full_line)

        return headings

    @staticmethod
    def _extract_allcaps_headings(text: str) -> list[str]:
        """
        Extract headings written entirely in UPPERCASE letters.

        OCR output from scanned handwritten notes and printed slides
        frequently renders section titles in ALL CAPS.

        Filtering rules (conservative)
        --------------------------------
        - Line length between ``_HEADING_MIN_LEN`` and ``_HEADING_MAX_LEN``
        - Word count does not exceed ``_HEADING_MAX_WORDS``
        - Must contain at least one letter (rejects pure number / symbol lines)
        - Must not look like a URL, date, separator line, or other body noise
        - Must be entirely uppercase (``line == line.upper()``)

        Returns
        -------
        list[str]
            Ordered list of ALL CAPS heading texts.
        """
        headings: list[str] = []

        for match in _RE_ALLCAPS_HEADING.finditer(text):
            candidate = match.group("text").strip()

            if not MetadataExtractor._is_valid_heading(candidate):
                continue

            # Must be actually all-uppercase (regex allows digits/punct so
            # we double-check on the alphabetic portion).
            letters_only = re.sub(r"[^a-zA-Z]", "", candidate)
            if not letters_only or letters_only != letters_only.upper():
                continue

            # Skip lines that are likely body text or noise.
            if _RE_LIKELY_BODY.search(candidate):
                continue

            headings.append(candidate)

        return headings

    @staticmethod
    def _extract_chapters(text: str) -> list[str]:
        """
        Extract chapter-level headings specifically.

        Looks for lines that explicitly use "Chapter", "CHAPTER", or
        a top-level numbered pattern (``"1. Title"``).

        Returns
        -------
        list[str]
            Ordered, deduplicated list of chapter heading lines.
        """
        chapters: list[str] = []

        for match in _RE_CHAPTER.finditer(text):
            line = match.group(0).strip()
            if MetadataExtractor._is_valid_heading(line):
                chapters.append(line)

        return MetadataExtractor._merge_unique(chapters)

    # ── Title inference ───────────────────────────────────────────────────

    @staticmethod
    def _infer_title(
        text: str,
        headings: list[str],
        filename: str,
    ) -> str:
        """
        Infer the document title using a priority waterfall:

        1. **First markdown h1** (``# Title``) found anywhere in the text.
        2. **First heading of any type** that appears in the opening
           ``_TITLE_SCAN_LIMIT`` characters of the document.
        3. **First non-empty line** of the text (if it passes heading
           validity checks).
        4. **Filename stem** (without extension) as a last resort.

        Parameters
        ----------
        text:
            Cleaned document text.
        headings:
            All headings already extracted by the caller.
        filename:
            Original filename string.

        Returns
        -------
        str
            Best-guess document title.
        """
        # Priority 1: first markdown h1.
        for match in _RE_MARKDOWN_HEADING.finditer(text):
            if match.group("level") == "#":
                candidate = match.group("text").strip()
                if MetadataExtractor._is_valid_heading(candidate):
                    return candidate

        # Priority 2: first heading appearing in the opening section.
        opening = text[:_TITLE_SCAN_LIMIT]
        for heading in headings:
            if heading in opening:
                return heading

        # Priority 3: first non-empty line that looks like a heading.
        for line in text.splitlines():
            stripped = line.strip()
            if stripped and MetadataExtractor._is_valid_heading(stripped):
                return stripped

        # Priority 4: filename stem.
        if filename:
            stem = filename.rsplit(".", 1)[0] if "." in filename else filename
            # Convert underscores / hyphens to spaces for readability.
            return re.sub(r"[_\-]+", " ", stem).strip()

        return "Unknown"

    # ── Language detection ────────────────────────────────────────────────

    @staticmethod
    def _detect_language(text: str) -> str:
        """
        Detect the dominant natural language of *text*.

        Strategy
        --------
        Lower-case the first 2 000 characters (enough signal, fast) and
        count occurrences of language-specific high-frequency words
        (function words / stopwords) from ``_LANGUAGE_TRIGRAMS``.

        The language whose wordlist yields the highest total hit count wins.
        If no language reaches a minimum threshold of 3 hits, returns
        ``"Unknown"``.

        This approach is fast, has zero dependencies, and is accurate enough
        for the typical mix of English / other-European academic documents
        processed by Aptora.

        Parameters
        ----------
        text:
            Cleaned document text.

        Returns
        -------
        str
            Detected language name (e.g. ``"English"``) or ``"Unknown"``.
        """
        # Use only the opening portion for speed; language is consistent.
        sample = text[:2_000].lower()

        # Tokenise into words for accurate whole-word matching.
        words = re.findall(r"\b[a-z]+\b", sample)
        word_set = set(words)  # for O(1) lookup

        scores: dict[str, int] = {}

        for language, markers in _LANGUAGE_TRIGRAMS.items():
            score = sum(1 for marker in markers if marker in word_set)
            if score > 0:
                scores[language] = score

        if not scores:
            return "Unknown"

        best_language = max(scores, key=lambda lang: scores[lang])
        best_score    = scores[best_language]

        # Require at least 3 marker hits to avoid spurious detection on
        # very short texts.
        if best_score < 3:
            return "Unknown"

        logger.debug(
            "[MetadataExtractor] Language scores: %s → '%s'",
            scores,
            best_language,
        )

        return best_language

    # ── Validation & utility ──────────────────────────────────────────────

    @staticmethod
    def _is_valid_heading(text: str) -> bool:
        """
        Return ``True`` if *text* is plausibly a document heading.

        A valid heading must:

        - Have at least ``_HEADING_MIN_LEN`` characters.
        - Not exceed ``_HEADING_MAX_LEN`` characters.
        - Not exceed ``_HEADING_MAX_WORDS`` whitespace-split tokens.
        - Contain at least one alphabetic character.

        Parameters
        ----------
        text:
            Candidate heading string (already stripped of leading/trailing
            whitespace).

        Returns
        -------
        bool
        """
        if not text:
            return False

        if len(text) < _HEADING_MIN_LEN:
            return False

        if len(text) > _HEADING_MAX_LEN:
            return False

        if len(text.split()) > _HEADING_MAX_WORDS:
            return False

        # Must contain at least one letter.
        if not re.search(r"[a-zA-Z]", text):
            return False

        return True

    @staticmethod
    def _merge_unique(items: list[str]) -> list[str]:
        """
        Remove duplicates from *items* while preserving insertion order.

        Case-sensitive: ``"Introduction"`` and ``"INTRODUCTION"`` are treated
        as distinct headings because they may represent genuinely different
        structural elements in the source document.

        Parameters
        ----------
        items:
            List of strings potentially containing duplicates.

        Returns
        -------
        list[str]
            Deduplicated list in original insertion order.
        """
        seen: set[str] = set()
        unique: list[str] = []

        for item in items:
            if item not in seen:
                seen.add(item)
                unique.append(item)

        return unique


# ---------------------------------------------------------------------------
# __main__ – smoke test
# ---------------------------------------------------------------------------

if __name__ == "__main__":  # pragma: no cover
    import sys

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%H:%M:%S",
    )

    sample_text = """\
# Introduction to Computer Science

COURSE OVERVIEW

This course provides a broad introduction to computer science and
programming. It covers fundamental concepts that every software engineer
must understand.

## 1. Variables and Data Types

Variables store data values. Python has no command for declaring a
variable — it is created the moment you first assign a value to it.

    name = "Alice"
    age  = 30

## 2. Control Flow

Control flow determines the order in which instructions are executed.

### 2.1 Conditionals

if age >= 18:
    print("Adult")

### 2.2 Loops

for i in range(10):
    print(i)

Chapter 3 Functions

Functions are reusable blocks of code that perform a specific task.

    def greet(name):
        return f"Hello, {name}!"

Chapter 4 Data Structures

Python provides several built-in data structures:

• Lists
• Tuples
• Dictionaries
• Sets

ALGORITHMS AND COMPLEXITY

Understanding time and space complexity is essential for writing
efficient code. Big-O notation describes the upper bound of an
algorithm's growth rate.

Chapter 5 Object-Oriented Programming

OOP organises code around objects rather than functions and logic.
"""

    print("=" * 60)
    print("MetadataExtractor - smoke test")
    print("=" * 60)
    print()

    meta = MetadataExtractor.extract(sample_text, filename="intro_cs.pdf")

    fields = [
        ("Title",           meta["title"]),
        ("Language",        meta["language"]),
        ("Estimated pages", meta["estimated_pages"]),
        ("Word count",      meta["word_count"]),
        ("Character count", meta["character_count"]),
        ("Chapter count",   meta["chapter_count"]),
    ]

    for label, value in fields:
        print(f"  {label:<20}: {value}")

    print()
    print("  Chapters:")
    for ch in meta["chapters"]:
        print(f"    - {ch}")

    print()
    print("  All headings:")
    for h in meta["headings"]:
        print(f"    - {h}")

    print()
    sys.exit(0)
