"""
Aptora - Text Chunker
============================

Processing stage: TextCleaner → TextChunker → Embeddings

Splits cleaned text into overlapping chunks suitable for vector
embedding and semantic retrieval via Qdrant.

Design principles
-----------------
- Pure-function interface  (TextChunker.chunk is stateless)
- Zero external dependencies – pure Python stdlib only
- Separator-priority splitting: paragraph > sentence > word boundary
- Words are never broken unless the chunk_size is smaller than a word
- Overlap is applied at clean word/sentence boundaries, not mid-word
- Returns clean UTF-8 str chunks; never raises on well-formed input
"""

from __future__ import annotations

import logging
import re
import sys
from typing import Final

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Separator priority list
# ---------------------------------------------------------------------------
# The chunker tries each separator in order.  It uses the first one that
# produces a split point at or before the chunk_size limit.
#
# Priority reasoning:
#   1. Double newline  → paragraph boundary (strongest semantic break)
#   2. Single newline  → line break (code blocks, lists, soft wraps)
#   3. ". " / "? " / "! " → sentence endings (include space to avoid
#      breaking abbreviations like "Dr. Smith" when followed by a capital,
#      though we keep this simple here)
#   4. "; " / ", "    → clause boundaries (weaker but still semantic)
#   5. " "             → word boundary (last resort before breaking words)
#
_SEPARATORS: Final[list[str]] = [
    "\n\n",   # paragraph
    "\n",     # line
    ". ",     # sentence (period + space)
    "? ",     # sentence (question)
    "! ",     # sentence (exclamation)
    "; ",     # clause
    ", ",     # clause
    " ",      # word
]

# Minimum chunk size as a fraction of the requested chunk_size.
# Chunks shorter than (chunk_size * _MIN_CHUNK_FRACTION) are merged
# into the previous chunk rather than emitted as standalone fragments.
_MIN_CHUNK_FRACTION: Final[float] = 0.20

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


class TextChunker:
    """
    Stateless text-chunking utility for cleaned OCR / PDF text.

    Usage
    -----
    ::

        from app.processing.text_chunker import TextChunker

        clean_text = TextCleaner.clean(raw_text)
        chunks     = TextChunker.chunk(clean_text, chunk_size=1000, overlap=200)
        # → list[str], each ≈ 1000 chars with 200-char overlap

    The ``chunk`` method is the single public entry point.  All helpers
    are private and not part of the stable API.
    """

    @staticmethod
    def chunk(
        text: str,
        chunk_size: int = 1000,
        overlap: int = 200,
    ) -> list[str]:
        """
        Split *text* into overlapping chunks ready for embedding.

        Parameters
        ----------
        text:
            Cleaned UTF-8 text produced by ``TextCleaner.clean()``.
        chunk_size:
            Target maximum length (in characters) of each chunk.
            Chunks may be slightly longer if no clean split point exists
            within the limit.
        overlap:
            Number of characters carried over from the end of one chunk
            to the beginning of the next.  Applied at clean word or
            sentence boundaries to avoid mid-word cuts.

        Returns
        -------
        list[str]
            Ordered list of text chunks.  Empty chunks are removed.
            Each chunk is stripped of leading/trailing whitespace.

        Raises
        ------
        ValueError
            If ``chunk_size`` < 1 or ``overlap`` >= ``chunk_size``.
        """
        if not text or not text.strip():
            return []

        if chunk_size < 1:
            raise ValueError(f"chunk_size must be >= 1, got {chunk_size}")

        if overlap >= chunk_size:
            raise ValueError(
                f"overlap ({overlap}) must be less than chunk_size ({chunk_size})"
            )

        # ── 1. Coarse split along separator hierarchy ─────────────────────
        raw_chunks: list[str] = TextChunker._split_on_separators(
            text=text,
            chunk_size=chunk_size,
        )

        # ── 2. Merge fragments that are too small ──────────────────────────
        merged: list[str] = TextChunker._merge_small_chunks(
            chunks=raw_chunks,
            chunk_size=chunk_size,
            min_size=int(chunk_size * _MIN_CHUNK_FRACTION),
        )

        # ── 3. Apply overlap between consecutive chunks ────────────────────
        overlapped: list[str] = TextChunker._apply_overlap(
            chunks=merged,
            overlap=overlap,
        )

        # ── 4. Final clean-up: strip and drop empty chunks ─────────────────
        result: list[str] = [c.strip() for c in overlapped if c.strip()]

        logger.debug(
            "TextChunker: %d chars → %d chunks "
            "(chunk_size=%d, overlap=%d)",
            len(text),
            len(result),
            chunk_size,
            overlap,
        )

        return result

    # -----------------------------------------------------------------------
    # Private helpers
    # -----------------------------------------------------------------------

    @staticmethod
    def _split_on_separators(
        text: str,
        chunk_size: int,
    ) -> list[str]:
        """
        Recursively split *text* into segments no longer than *chunk_size*
        by trying each separator in priority order.

        Algorithm
        ---------
        1. If ``len(text) <= chunk_size`` the text fits in one chunk → return
           it as-is.
        2. Try each separator in ``_SEPARATORS`` (highest priority first).
           Find the last occurrence of the separator that falls at or before
           the ``chunk_size`` boundary.
        3. If a suitable split point is found, split there and recurse on
           both halves.
        4. If *no* separator produces a valid split (e.g. a single very long
           word), fall back to a hard character split at ``chunk_size``.

        Parameters
        ----------
        text:
            The text to split (may already be a sub-segment from recursion).
        chunk_size:
            Maximum character length per output segment.

        Returns
        -------
        list[str]
            Segments, none longer than ``chunk_size`` characters (except in
            the degenerate case of a single unsplittable token longer than
            ``chunk_size``).
        """
        # Base case: the text already fits.
        if len(text) <= chunk_size:
            return [text] if text.strip() else []

        split_pos: int = TextChunker._find_split_position(text, chunk_size)

        left: str = text[:split_pos]
        right: str = text[split_pos:]

        # Recurse on both halves.
        return (
            TextChunker._split_on_separators(left, chunk_size)
            + TextChunker._split_on_separators(right, chunk_size)
        )

    @staticmethod
    def _find_split_position(text: str, chunk_size: int) -> int:
        """
        Find the best character index at which to split *text* so that the
        left portion is at most *chunk_size* characters.

        The function tries each separator in ``_SEPARATORS`` priority order
        and returns the position of the *last* occurrence of that separator
        that falls at or before *chunk_size*.  Including the separator in the
        left portion keeps contextual punctuation with its preceding content.

        If no separator matches within the limit, falls back to splitting at
        the last space before *chunk_size* (preserving word boundaries).
        If even that is impossible (no space exists), splits hard at
        *chunk_size* as an absolute last resort.

        Parameters
        ----------
        text:
            Text that is longer than *chunk_size*.
        chunk_size:
            Target maximum length for the left portion.

        Returns
        -------
        int
            Character index at which to split *text*.
        """
        window: str = text[:chunk_size]

        for separator in _SEPARATORS:
            pos: int = window.rfind(separator)
            if pos > 0:
                # Include the separator itself in the left portion so that
                # paragraph / sentence delimiters stay with their context.
                return pos + len(separator)

        # No separator found within the window; split at last whitespace
        # to avoid breaking a word (covers the " " case explicitly in case
        # it was not caught above).
        last_space: int = window.rfind(" ")
        if last_space > 0:
            return last_space + 1  # +1 to exclude the space from the right

        # Absolute fallback: hard split at chunk_size (unavoidable for a
        # single token longer than chunk_size, e.g. a very long URL or hash).
        logger.warning(
            "TextChunker: no split boundary found within %d chars; "
            "falling back to hard split at character %d.",
            chunk_size,
            chunk_size,
        )
        return chunk_size

    @staticmethod
    def _merge_small_chunks(
        chunks: list[str],
        chunk_size: int,
        min_size: int,
    ) -> list[str]:
        """
        Merge consecutive chunks that are shorter than *min_size* into
        their neighbour to avoid emitting tiny, low-signal fragments.

        Strategy
        --------
        Iterate left-to-right.  When a chunk is shorter than *min_size*,
        append it to the previous chunk (separated by a newline) provided
        the combined length does not exceed *chunk_size*.  If the combined
        length *would* exceed *chunk_size*, leave the small chunk as-is and
        start a new accumulation from it.

        The first chunk is never merged into a non-existent predecessor —
        it is always kept regardless of length.

        Parameters
        ----------
        chunks:
            Output of ``_split_on_separators``.
        chunk_size:
            Target maximum chunk length.
        min_size:
            Chunks shorter than this threshold are candidates for merging.

        Returns
        -------
        list[str]
            Chunks list with small fragments merged where possible.
        """
        if not chunks:
            return []

        merged: list[str] = [chunks[0]]

        for chunk in chunks[1:]:
            previous: str = merged[-1]

            # Merge condition: current chunk is small AND the result fits.
            if len(chunk) < min_size and len(previous) + len(chunk) + 1 <= chunk_size:
                merged[-1] = previous + "\n" + chunk
            else:
                merged.append(chunk)

        return merged

    @staticmethod
    def _apply_overlap(
        chunks: list[str],
        overlap: int,
    ) -> list[str]:
        """
        Prepend an *overlap* tail from the previous chunk onto each chunk.

        Overlap ensures that sentence/concept context is not completely lost
        at chunk boundaries when the vector store retrieves individual chunks.

        Boundary preservation
        ---------------------
        The overlap suffix is taken from the *end* of the previous chunk and
        then trimmed to begin at a clean word boundary (the first space
        character found within it, from the left).  This avoids prepending a
        mid-word fragment.

        If the previous chunk is shorter than *overlap*, the entire previous
        chunk is used as the prefix (still trimmed to a word boundary).

        Parameters
        ----------
        chunks:
            Merged chunks from ``_merge_small_chunks``.
        overlap:
            Desired character overlap length.

        Returns
        -------
        list[str]
            Chunks with overlap prepended to all chunks except the first.
        """
        if overlap <= 0 or len(chunks) < 2:
            return chunks

        result: list[str] = [chunks[0]]

        for i in range(1, len(chunks)):
            previous: str = chunks[i - 1]
            current: str = chunks[i]

            # Take the tail of the previous chunk.
            tail: str = previous[-overlap:] if len(previous) >= overlap else previous

            # Trim to start at a clean word boundary: skip to the first
            # space, then skip the space itself.
            space_idx: int = tail.find(" ")
            if space_idx > 0:
                tail = tail[space_idx + 1:]

            # Also trim to a clean newline boundary when one exists near
            # the start of the tail (preferred over a mid-word space).
            newline_idx: int = tail.find("\n")
            if 0 < newline_idx <= len(tail) // 2:
                # Only use the newline boundary if it falls in the first
                # half of the tail (otherwise we'd lose too much context).
                tail = tail[newline_idx + 1:]

            if tail.strip():
                result.append(tail + "\n" + current)
            else:
                result.append(current)

        return result


# ---------------------------------------------------------------------------
# __main__ – quick smoke-test (not a substitute for a proper test suite)
# ---------------------------------------------------------------------------

if __name__ == "__main__":  # pragma: no cover
    sample_text = """\
Introduction to Machine Learning

Machine learning is a branch of artificial intelligence that enables
systems to learn and improve from experience without being explicitly
programmed. The primary aim is to allow computers to learn automatically
without human intervention and adjust actions accordingly.

Types of Machine Learning

There are three main types of machine learning:

1. Supervised Learning
   In supervised learning, the algorithm is trained on labelled data.
   The model learns to map inputs to outputs based on example pairs.
   Common algorithms include linear regression, decision trees, and
   support vector machines.

2. Unsupervised Learning
   Unsupervised learning uses unlabelled data. The algorithm must find
   structure on its own. Clustering and dimensionality reduction are
   typical tasks. K-means clustering is a well-known example.

3. Reinforcement Learning
   The agent learns by interacting with an environment. It receives
   rewards or penalties based on actions taken. Over time, it learns
   a policy that maximises cumulative reward.

Applications

Machine learning is used across many industries:

• Healthcare: disease diagnosis, drug discovery
• Finance: fraud detection, algorithmic trading
• Transportation: autonomous vehicles, route optimisation
• Retail: recommendation systems, demand forecasting

A Simple Python Example

The following snippet trains a linear regression model using scikit-learn:

    from sklearn.linear_model import LinearRegression
    import numpy as np

    X = np.array([[1], [2], [3], [4], [5]])
    y = np.array([2, 4, 5, 4, 5])

    model = LinearRegression()
    model.fit(X, y)
    print(model.predict([[6]]))

Conclusion

Machine learning continues to evolve rapidly. Understanding its
fundamentals provides a solid foundation for exploring more advanced
topics such as deep learning, neural networks, and large language models.
"""

    print("=" * 60)
    print("TextChunker - smoke test")
    print("=" * 60)
    print(f"Input length : {len(sample_text)} characters")
    print()

    chunks = TextChunker.chunk(sample_text, chunk_size=400, overlap=80)

    print(f"Chunk count  : {len(chunks)}")
    print()

    for idx, ch in enumerate(chunks, start=1):
        print(f"-- Chunk {idx} ({len(ch)} chars) " + "-" * 40)
        print(ch)
        print()

    sys.exit(0)
