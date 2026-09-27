"""
Aptora - Text Cleaner
===========================

Processing stage: OCR output → TextCleaner → Chunker

Cleans raw text produced by Tesseract OCR / PyMuPDF before it is
chunked and embedded.  The cleaner is deliberately conservative:
it removes *formatting noise* while carefully preserving all
semantic content (paragraphs, code blocks, numbered lists, bullets).

Design principles
-----------------
- Pure-function interface  (TextCleaner.clean is stateless)
- Single-pass where possible to avoid quadratic re-processing
- No NLP / AI – deterministic regex + Unicode normalization only
- Returns clean UTF-8 text; never raises on well-formed input
"""

from __future__ import annotations

import logging
import re
import unicodedata
from collections import Counter

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Compiled regex constants
# ---------------------------------------------------------------------------

# Standalone page-number patterns (entire line must match).
#
# Recognised forms:
#   "1"  "12"  "123"             – lone integer
#   "Page 1"  "Page 12"          – "Page" keyword + integer
#   "Page: 18"                   – "Page:" variant
#   "- 1 -"  "— 12 —"           – dashes around an integer (common in PDFs)
#
_RE_PAGE_NUMBER = re.compile(
    r"""
    ^                           # start of line
    \s*                         # optional leading space
    (?:
        Page\s*:?\s*\d+         # "Page 1" / "Page: 1"
        | [-\u2013\u2014]{1,3}\s*\d+\s*[-\u2013\u2014]{1,3}   # "- 1 -" / "\u2014 12 \u2014"
        | \d+                   # lone integer
    )
    \s*                         # optional trailing space
    $                           # end of line
    """,
    re.VERBOSE | re.IGNORECASE | re.MULTILINE,
)

# Repeated OCR garbage characters: long runs of underscores, hyphens,
# equals-signs, dots, tildes, asterisks.  Must be >= 4 chars to qualify.
_RE_GARBAGE_RUNS = re.compile(
    r"(?:[_\-=~*#|]{4,})"
)

# Non-printable control characters (except CR/LF/tab which we handle
# separately) and the Unicode replacement character U+FFFD.
_RE_CONTROL_CHARS = re.compile(
    r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd]"
)

# Trailing whitespace on every line.
_RE_TRAILING_SPACE = re.compile(r"[ \t]+$", re.MULTILINE)

# Runs of more than two consecutive blank lines collapsed to exactly two.
# Two blank lines (one empty line between paragraphs) is the canonical
# paragraph separator we want to preserve.
_RE_EXCESS_BLANK_LINES = re.compile(r"\n{3,}")

# Multiple spaces / tabs inside a single line collapsed to one space.
_RE_INLINE_WHITESPACE = re.compile(r"[ \t]{2,}")

# "Strange" Unicode – private-use area codepoints and Unicode line / paragraph
# separators that break many downstream parsers.
_RE_PUA = re.compile(
    r"[\ue000-\uf8ff"      # BMP Private Use Area
    r"\u2028\u2029"        # Line Separator / Paragraph Separator
    r"]"
)


# ---------------------------------------------------------------------------
# Heuristic thresholds for repeated-header / repeated-footer detection
# ---------------------------------------------------------------------------

# A line is considered a "repeated header/footer candidate" if it appears
# in at least this fraction of the total page-separator count.
_REPEAT_THRESHOLD_FRACTION: float = 0.60

# We only bother scanning for headers/footers when the document has at
# least this many page-like separators (otherwise there is not enough
# signal to distinguish genuine repetition from coincidence).
_MIN_PAGE_COUNT_FOR_REPEAT_DETECTION: int = 3

# A header/footer line must be short enough to be plausible metadata.
# Lines longer than this character limit are never treated as headers.
_MAX_HEADER_LINE_LEN: int = 80


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


class TextCleaner:
    """
    Stateless text-cleaning utility for OCR / PDF output.

    Usage
    -----
    ::

        from app.processing.text_cleaner import TextCleaner

        raw_text   = ocr_service.extract(file_path)
        clean_text = TextCleaner.clean(raw_text)
        chunks     = chunk_service.split(clean_text)

    The ``clean`` method is the single public entry point.  All helper
    methods are private and not part of the stable API.
    """

    @staticmethod
    def clean(text: str) -> str:
        """
        Run the full cleaning pipeline on raw OCR / PDF text.

        Steps applied (in order)
        -------------------------
        1.  Normalise line endings to ``\\n``
        2.  Strip non-printable control characters
        3.  Strip Private-Use-Area Unicode codepoints
        4.  Unicode NFC normalisation
        5.  Convert tabs to spaces (4 spaces; preserves code indentation)
        6.  Remove OCR garbage runs (long underscore / hyphen / symbol lines)
        7.  Remove page numbers
        8.  Remove repeated headers and footers
        9.  Collapse inline whitespace (never across newlines)
        10. Remove trailing whitespace per line
        11. Collapse excess blank lines (>2 consecutive newlines → 2)
        12. Final strip

        Parameters
        ----------
        text:
            Raw string from Tesseract / PyMuPDF.  May contain ``\\r\\n``
            line endings, funky Unicode, or OCR artefacts.

        Returns
        -------
        str
            Cleaned UTF-8 text ready for chunking.  Paragraph boundaries
            (double newlines), code blocks, numbered lists, and bullet
            lists are preserved.
        """
        if not text:
            return ""

        # ── Step 1: Normalise line endings ────────────────────────────────
        text = TextCleaner._normalise_line_endings(text)

        # ── Step 2: Strip non-printable control characters ────────────────
        text = TextCleaner._remove_control_chars(text)

        # ── Step 3: Strip Private-Use-Area codepoints ─────────────────────
        text = TextCleaner._remove_pua(text)

        # ── Step 4: Unicode NFC normalisation ─────────────────────────────
        # Converts decomposed characters (e.g. "é" as e + combining acute)
        # into their canonical precomposed form.  This keeps accented
        # characters while eliminating many invisible combining marks that
        # OCR engines sometimes generate.
        text = unicodedata.normalize("NFC", text)

        # ── Step 5: Tabs → spaces ─────────────────────────────────────────
        # Four spaces per tab to preserve code-block and list indentation
        # alignment without destroying visual structure.
        text = text.replace("\t", "    ")

        # ── Step 6: Remove OCR garbage runs ───────────────────────────────
        text = TextCleaner._remove_garbage_runs(text)

        # ── Step 7: Remove page numbers ───────────────────────────────────
        text = TextCleaner._remove_page_numbers(text)

        # ── Step 8: Remove repeated headers / footers ─────────────────────
        text = TextCleaner._remove_repeated_headers_footers(text)

        # ── Step 9: Collapse inline whitespace ────────────────────────────
        text = TextCleaner._collapse_inline_whitespace(text)

        # ── Step 10: Strip trailing whitespace per line ───────────────────
        text = _RE_TRAILING_SPACE.sub("", text)

        # ── Step 11: Collapse excess blank lines ──────────────────────────
        # Reduce 3+ consecutive newlines to exactly 2 so that paragraph
        # boundaries become consistent double-newlines throughout the output.
        text = _RE_EXCESS_BLANK_LINES.sub("\n\n", text)

        # ── Step 12: Final strip ──────────────────────────────────────────
        return text.strip()

    # -----------------------------------------------------------------------
    # Private helpers
    # -----------------------------------------------------------------------

    @staticmethod
    def _normalise_line_endings(text: str) -> str:
        """
        Convert all CRLF (``\\r\\n``) and lone CR (``\\r``) to LF (``\\n``).

        This is always the first step so every subsequent regex can assume
        ``\\n`` as the only line-separator, avoiding duplicated logic for
        different platform conventions.
        """
        # CRLF must be replaced before lone CR; order matters.
        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")
        return text

    @staticmethod
    def _remove_control_chars(text: str) -> str:
        """
        Remove ASCII control characters that carry no textual meaning.

        Preserved
        ---------
        - ``\\n`` (0x0A)  – line feed; structural.
        - ``\\t`` (0x09)  – tab; handled in step 5.

        Removed
        -------
        NUL (0x00), BEL (0x07), BS (0x08), VT (0x0B), FF (0x0C),
        SO–US (0x0E–0x1F), DEL (0x7F), and U+FFFD (replacement char).
        """
        return _RE_CONTROL_CHARS.sub("", text)

    @staticmethod
    def _remove_pua(text: str) -> str:
        """
        Remove Unicode Private-Use-Area (PUA) codepoints and Unicode
        line/paragraph separators.

        PUA codepoints (U+E000–U+F8FF) have no standard meaning and are
        frequently hallucinated by Tesseract when it cannot classify a
        glyph.  U+2028 / U+2029 (Line Separator / Paragraph Separator)
        are technically valid Unicode but cause problems in many parsers
        and are functionally identical to ``\\n`` in plain text.
        """
        return _RE_PUA.sub("", text)

    @staticmethod
    def _remove_garbage_runs(text: str) -> str:
        """
        Remove lines (or inline runs) consisting only of repeated OCR
        separator characters.

        Characters considered "garbage separators":
        ``_`` ``-`` ``=`` ``~`` ``*`` ``#`` ``|``

        A run of **4 or more** such characters is classified as garbage.

        Behaviour
        ---------
        - If the **entire stripped line** matches, the whole line is dropped.
          This handles decorative horizontal rules that Tesseract picks up
          from printed forms (e.g. ``_______________________``).
        - If the run appears **mid-line**, only the run is removed and the
          surrounding text is kept intact.

        Examples removed
        ----------------
        ``____________________________``
        ``-------------------``
        ``================``
        ``########``
        """
        lines: list[str] = text.split("\n")
        cleaned: list[str] = []

        for line in lines:
            stripped = line.strip()

            # Drop lines that are entirely garbage.
            if stripped and _RE_GARBAGE_RUNS.fullmatch(stripped):
                continue

            # Strip inline garbage runs while preserving surrounding text.
            line = _RE_GARBAGE_RUNS.sub("", line)
            cleaned.append(line)

        return "\n".join(cleaned)

    @staticmethod
    def _remove_page_numbers(text: str) -> str:
        """
        Remove lines that contain *only* a page number.

        Recognised patterns (case-insensitive, full-line match)
        --------------------------------------------------------
        - ``1``  ``12``  ``123``         – lone integer
        - ``Page 1``  ``Page 12``        – "Page" keyword + space + integer
        - ``Page: 18``                   – "Page:" colon variant
        - ``- 1 -``  ``\u2014 12 \u2014``    – en/em-dash wrapped integer

        Lines containing additional words or content beyond the page number
        pattern are left completely intact so that inline references like
        "see page 5" are never stripped.
        """
        # Each matched line is replaced with an empty string.  The excess-
        # blank-line pass in step 11 will later collapse the resulting runs
        # of blank lines back to double-newlines.
        return _RE_PAGE_NUMBER.sub("", text)

    @staticmethod
    def _remove_repeated_headers_footers(text: str) -> str:
        """
        Detect and remove lines that appear to be repeated page headers or
        footers across the document.

        Background
        ----------
        Scanned handwritten notes and many printed PDFs contain a small set
        of lines that repeat on every page: the student's name, the date,
        the subject heading, or a "Page N" label.  These add significant
        noise to downstream embeddings.

        Detection algorithm
        -------------------
        1. Split the document into logical "pages" using consecutive blank
           lines as page-break proxies (after earlier normalisation).
        2. For each page, collect the set of *unique* short, non-prose lines
           (see :meth:`_is_header_footer_candidate` for the filter criteria).
        3. Count how many distinct pages each such line appears on.
        4. Lines that appear on ≥ ``_REPEAT_THRESHOLD_FRACTION`` of all
           pages are classified as headers/footers and removed everywhere.

        Conservatism
        ------------
        The algorithm is intentionally conservative:

        - Requires a **majority presence** (≥ 60 % of pages by default).
        - Only considers **short lines** (≤ 80 chars).
        - **Excludes** lines with sentence-ending punctuation, list markers,
          or code-like characters – these are almost certainly content.
        - Does nothing when the document has fewer than
          ``_MIN_PAGE_COUNT_FOR_REPEAT_DETECTION`` logical pages (not enough
          signal to distinguish repetition from coincidence).

        Parameters
        ----------
        text:
            Text after steps 1–7 have been applied.

        Returns
        -------
        str
            Text with repeated header/footer lines removed.
        """
        # Use double-newline boundaries as logical page separators.
        pages: list[str] = re.split(r"\n{2,}", text)
        num_pages: int = len(pages)

        if num_pages < _MIN_PAGE_COUNT_FOR_REPEAT_DETECTION:
            # Not enough pages to make a reliable determination.
            return text

        # Count how many distinct pages each candidate line appears on.
        # Using a set per page prevents double-counting duplicate lines
        # within the same page.
        line_page_count: Counter[str] = Counter()

        for page in pages:
            seen_on_page: set[str] = set()
            for line in page.splitlines():
                candidate = line.strip()
                if TextCleaner._is_header_footer_candidate(candidate):
                    seen_on_page.add(candidate)
            line_page_count.update(seen_on_page)

        # Compute the removal set.
        threshold: float = _REPEAT_THRESHOLD_FRACTION * num_pages
        repeated_lines: set[str] = {
            line
            for line, count in line_page_count.items()
            if count >= threshold
        }

        if not repeated_lines:
            return text

        logger.debug(
            "TextCleaner: removing %d repeated header/footer line(s): %s",
            len(repeated_lines),
            repeated_lines,
        )

        # Filter out matching lines from the full text.
        result_lines: list[str] = [
            line
            for line in text.splitlines()
            if line.strip() not in repeated_lines
        ]

        return "\n".join(result_lines)

    @staticmethod
    def _is_header_footer_candidate(line: str) -> bool:
        """
        Return ``True`` if *line* is short and simple enough to be a
        repeated header or footer rather than genuine content.

        A line is **not** a candidate (returns ``False``) if it:

        - Is empty.
        - Exceeds ``_MAX_HEADER_LINE_LEN`` characters (too long to be a label).
        - Contains sentence-ending punctuation (``.,!?;:``) – implies prose.
        - Looks like a numbered-list item: ``1.`` / ``(a)`` / ``i.``
        - Looks like a bullet-list item: ``-`` / ``*`` / ``•``
        - Contains code-like syntax characters: ``= ( ) { } [ ] < >``

        Parameters
        ----------
        line:
            A single stripped line of text.

        Returns
        -------
        bool
        """
        if not line:
            return False

        if len(line) > _MAX_HEADER_LINE_LEN:
            return False

        # Sentence-ending punctuation → almost certainly prose, not a label.
        if re.search(r"[.!?;:]", line):
            return False

        # Numbered list items: "1." / "(a)" / "iv."
        if re.match(r"^\s*(?:\d+\.|\([a-zA-Z]\)|[ivxlIVXL]+\.)\s", line):
            return False

        # Bullet-list items: "- " / "* " / "• "
        if re.match(r"^\s*[-*\u2022]\s", line):
            return False

        # Code-like characters imply structure that should be preserved.
        if re.search(r"[=(){}[\]<>]", line):
            return False

        return True

    @staticmethod
    def _collapse_inline_whitespace(text: str) -> str:
        """
        Collapse runs of two or more spaces (or mixed space/tab sequences)
        within each individual line into a single space.

        This is done **line-by-line** rather than across the whole string
        to ensure that leading indentation (tabs / spaces at the start of a
        line) is never collapsed.  Preserving leading whitespace is critical
        for code blocks and indented list items.

        Example
        -------
        ``"hello   world"``  →  ``"hello world"``

        Indented line (leading spaces preserved):
        ``"    x =  1 + 2"``  →  ``"    x = 1 + 2"``
        """
        lines: list[str] = text.split("\n")
        result: list[str] = []

        for line in lines:
            # Measure and preserve leading indentation.
            leading_spaces: int = len(line) - len(line.lstrip(" "))
            indent: str = line[:leading_spaces]
            rest: str = line[leading_spaces:]

            # Collapse multiple spaces only in the non-indented portion.
            rest = _RE_INLINE_WHITESPACE.sub(" ", rest)
            result.append(indent + rest)

        return "\n".join(result)
