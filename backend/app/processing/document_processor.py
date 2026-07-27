"""
ExamForge AI - Document Processor
===================================

Processing stage: Upload → DocumentProcessor → (Embeddings – next stage)

Orchestrates the complete pre-embedding pipeline for every uploaded
document:

    OCRService.extract_text()
        ↓
    TextCleaner.clean()
        ↓
    TextChunker.chunk()
        ↓
    ProcessingResult (structured dict)

This module is intentionally free of database / SQLAlchemy dependencies.
Persistence, status updates, and embedding dispatch are handled by the
calling layer (worker / FastAPI endpoint) once the result is returned.

Design principles
-----------------
- Single public entry point: ``DocumentProcessor.process()``
- Each pipeline stage is isolated in a private helper method
- Descriptive exceptions are raised on any stage failure
- All stages are individually timed and logged for observability
- Returns a typed ``ProcessingResult`` TypedDict for static analysis
"""

from __future__ import annotations

import logging
import time
from pathlib import Path
from typing import TypedDict

from app.processing.ocr_service import OCRService
from app.processing.text_cleaner import TextCleaner
from app.processing.text_chunker import TextChunker

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Return-type definition
# ---------------------------------------------------------------------------


class ProcessingResult(TypedDict):
    """
    Structured result returned by ``DocumentProcessor.process()``.

    Fields
    ------
    raw_text:
        Unmodified text as returned by ``OCRService``.
    clean_text:
        Text after ``TextCleaner`` has removed OCR artefacts and normalised
        whitespace / Unicode.
    chunks:
        Ordered list of overlapping text segments produced by
        ``TextChunker``, ready for embedding.
    total_chunks:
        ``len(chunks)`` – convenience field so callers avoid recomputing it.
    character_count:
        Number of characters in ``clean_text``.
    word_count:
        Approximate word count of ``clean_text`` (whitespace-split tokens).
    """

    raw_text: str
    clean_text: str
    chunks: list[str]
    total_chunks: int
    character_count: int
    word_count: int


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


class DocumentProcessor:
    """
    Orchestrates the full document pre-processing pipeline.

    This class is stateless; all methods are static.  Instantiation is
    not required and is intentionally not part of the intended usage.

    Usage
    -----
    ::

        from app.processing.document_processor import DocumentProcessor

        result = DocumentProcessor.process("app/uploads/lecture.pdf")

        print(result["total_chunks"])   # → int
        print(result["chunks"][0])      # → first chunk string
    """

    # Default chunking parameters – can be overridden per call.
    DEFAULT_CHUNK_SIZE: int = 1000
    DEFAULT_OVERLAP: int = 200

    @staticmethod
    def process(
        file_path: str,
        chunk_size: int = DEFAULT_CHUNK_SIZE,
        overlap: int = DEFAULT_OVERLAP,
    ) -> ProcessingResult:
        """
        Run the full pre-embedding pipeline on *file_path* and return a
        structured ``ProcessingResult``.

        Pipeline
        --------
        1. Validate that the file exists and is readable.
        2. ``OCRService.extract_text()`` – extract raw text from the PDF.
        3. ``TextCleaner.clean()``       – remove OCR noise / normalise text.
        4. ``TextChunker.chunk()``       – split into overlapping segments.
        5. Compute metadata (character count, word count).

        Parameters
        ----------
        file_path:
            Absolute or relative path to the uploaded document.
            Currently supports the formats understood by ``OCRService``
            (PDF via PyMuPDF + Tesseract).
        chunk_size:
            Target maximum character length per chunk.  Forwarded to
            ``TextChunker.chunk()``.  Default: 1000.
        overlap:
            Number of characters of overlap between consecutive chunks.
            Forwarded to ``TextChunker.chunk()``.  Default: 200.

        Returns
        -------
        ProcessingResult
            A ``TypedDict`` containing raw text, clean text, chunks, and
            computed metadata.  See ``ProcessingResult`` for field docs.

        Raises
        ------
        FileNotFoundError
            If *file_path* does not exist or is not a regular file.
        RuntimeError
            If any pipeline stage (OCR / cleaner / chunker) raises an
            unexpected exception.  The original exception is chained via
            ``raise ... from`` so the full traceback is preserved.
        """
        pipeline_start: float = time.perf_counter()

        path = DocumentProcessor._validate_file(file_path)

        logger.info(
            "[DocumentProcessor] Starting pipeline for '%s'",
            path.name,
        )

        # ── Stage 1: OCR / Text Extraction ────────────────────────────────
        raw_text: str = DocumentProcessor._run_ocr(path)

        # ── Stage 2: Text Cleaning ─────────────────────────────────────────
        clean_text: str = DocumentProcessor._run_cleaner(raw_text, path.name)

        # ── Stage 3: Text Chunking ─────────────────────────────────────────
        chunks: list[str] = DocumentProcessor._run_chunker(
            clean_text,
            chunk_size=chunk_size,
            overlap=overlap,
            file_name=path.name,
        )

        # ── Stage 4: Compute metadata ──────────────────────────────────────
        character_count: int = len(clean_text)
        word_count: int = DocumentProcessor._count_words(clean_text)

        elapsed: float = time.perf_counter() - pipeline_start

        logger.info(
            "[DocumentProcessor] Finished '%s' in %.2fs — "
            "%d chars, %d words, %d chunks",
            path.name,
            elapsed,
            character_count,
            word_count,
            len(chunks),
        )

        return ProcessingResult(
            raw_text=raw_text,
            clean_text=clean_text,
            chunks=chunks,
            total_chunks=len(chunks),
            character_count=character_count,
            word_count=word_count,
        )

    # -----------------------------------------------------------------------
    # Private helpers – one per pipeline stage
    # -----------------------------------------------------------------------

    @staticmethod
    def _validate_file(file_path: str) -> Path:
        """
        Resolve *file_path* to an absolute ``Path`` and verify that it
        exists and is a regular file (not a directory or symlink to one).

        Parameters
        ----------
        file_path:
            Raw path string supplied by the caller.

        Returns
        -------
        Path
            Resolved, validated ``pathlib.Path`` object.

        Raises
        ------
        FileNotFoundError
            If the path does not exist or is not a file.
        """
        path = Path(file_path).resolve()

        if not path.exists():
            raise FileNotFoundError(
                f"[DocumentProcessor] File not found: '{file_path}'"
            )

        if not path.is_file():
            raise FileNotFoundError(
                f"[DocumentProcessor] Path is not a file: '{file_path}'"
            )

        return path

    @staticmethod
    def _run_ocr(path: Path) -> str:
        """
        Call ``OCRService.extract_text()`` and return raw extracted text.

        Parameters
        ----------
        path:
            Validated ``pathlib.Path`` to the document.

        Returns
        -------
        str
            Raw text string from OCR / PDF extraction.

        Raises
        ------
        RuntimeError
            Wraps any exception raised by ``OCRService`` with a descriptive
            message that identifies the failing file.
        """
        logger.info("[DocumentProcessor] OCR: extracting text from '%s'", path.name)
        stage_start: float = time.perf_counter()

        try:
            raw_text: str = OCRService.extract_text(str(path))
        except Exception as exc:
            raise RuntimeError(
                f"[DocumentProcessor] OCR failed for '{path.name}': {exc}"
            ) from exc

        elapsed: float = time.perf_counter() - stage_start

        logger.info(
            "[DocumentProcessor] OCR complete: %d chars extracted in %.2fs",
            len(raw_text),
            elapsed,
        )

        return raw_text

    @staticmethod
    def _run_cleaner(raw_text: str, file_name: str) -> str:
        """
        Call ``TextCleaner.clean()`` and return the cleaned string.

        Parameters
        ----------
        raw_text:
            Raw text from ``_run_ocr``.
        file_name:
            Document filename used in log messages.

        Returns
        -------
        str
            Cleaned UTF-8 text.

        Raises
        ------
        RuntimeError
            Wraps any exception raised by ``TextCleaner``.
        """
        logger.info(
            "[DocumentProcessor] Cleaner: processing %d chars from '%s'",
            len(raw_text),
            file_name,
        )
        stage_start: float = time.perf_counter()

        try:
            clean_text: str = TextCleaner.clean(raw_text)
        except Exception as exc:
            raise RuntimeError(
                f"[DocumentProcessor] TextCleaner failed for '{file_name}': {exc}"
            ) from exc

        elapsed: float = time.perf_counter() - stage_start

        logger.info(
            "[DocumentProcessor] Cleaning complete: %d chars remaining in %.2fs",
            len(clean_text),
            elapsed,
        )

        return clean_text

    @staticmethod
    def _run_chunker(
        clean_text: str,
        chunk_size: int,
        overlap: int,
        file_name: str,
    ) -> list[str]:
        """
        Call ``TextChunker.chunk()`` and return the list of text segments.

        Parameters
        ----------
        clean_text:
            Cleaned text from ``_run_cleaner``.
        chunk_size:
            Target maximum chunk length in characters.
        overlap:
            Overlap in characters between consecutive chunks.
        file_name:
            Document filename used in log messages.

        Returns
        -------
        list[str]
            Ordered list of non-empty text chunks.

        Raises
        ------
        RuntimeError
            Wraps any exception raised by ``TextChunker``.
        """
        logger.info(
            "[DocumentProcessor] Chunker: splitting '%s' "
            "(chunk_size=%d, overlap=%d)",
            file_name,
            chunk_size,
            overlap,
        )
        stage_start: float = time.perf_counter()

        try:
            chunks: list[str] = TextChunker.chunk(
                clean_text,
                chunk_size=chunk_size,
                overlap=overlap,
            )
        except Exception as exc:
            raise RuntimeError(
                f"[DocumentProcessor] TextChunker failed for '{file_name}': {exc}"
            ) from exc

        elapsed: float = time.perf_counter() - stage_start

        logger.info(
            "[DocumentProcessor] Chunking complete: %d chunks in %.2fs",
            len(chunks),
            elapsed,
        )

        return chunks

    @staticmethod
    def _count_words(text: str) -> int:
        """
        Return an approximate word count for *text*.

        Splits on any whitespace sequence; empty tokens (caused by
        leading/trailing whitespace) are not counted.  This is intentionally
        fast and simple — sufficient for metadata; it is not a linguistically
        precise word tokeniser.

        Parameters
        ----------
        text:
            Clean text string.

        Returns
        -------
        int
            Number of whitespace-delimited tokens.
        """
        return len(text.split())


# ---------------------------------------------------------------------------
# __main__ – manual smoke-test against a real file
# ---------------------------------------------------------------------------

if __name__ == "__main__":  # pragma: no cover
    import sys

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%H:%M:%S",
    )

    # Use lec1.pdf (small) as the default test target.
    # JS_Chapterwise_Notes.pdf (33 MB) would work too but is much slower.
    test_file = "app/uploads/lec1.pdf"

    if len(sys.argv) > 1:
        test_file = sys.argv[1]

    print()
    print("=" * 60)
    print("DocumentProcessor - smoke test")
    print("=" * 60)
    print(f"File : {test_file}")
    print()

    try:
        result = DocumentProcessor.process(test_file)
    except FileNotFoundError as exc:
        print(f"ERROR: {exc}")
        sys.exit(1)
    except RuntimeError as exc:
        print(f"PIPELINE ERROR: {exc}")
        sys.exit(1)

    print()
    print("-" * 60)
    print(f"Character count : {result['character_count']:,}")
    print(f"Word count      : {result['word_count']:,}")
    print(f"Chunk count     : {result['total_chunks']}")
    print()

    # Preview of the first chunk
    first_chunk = result["chunks"][0] if result["chunks"] else "(no chunks)"
    preview = first_chunk[:300] + ("..." if len(first_chunk) > 300 else "")

    print("First chunk preview:")
    print("-" * 60)
    print(preview)
    print("-" * 60)
    print()

    sys.exit(0)