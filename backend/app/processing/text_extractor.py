"""
Aptora - Text Extractor

Responsibilities:
1. Extract text from uploaded documents
2. Support PDF, DOCX and TXT
3. Provide a single interface for document processing
"""

from __future__ import annotations

import logging
from pathlib import Path

import fitz  # PyMuPDF
from docx import Document
from app.processing.ocr_service import OCRService

logger = logging.getLogger(__name__)


text = OCRService.extract_text(
    "app/uploads/YOUR_FILE.pdf"
)
class TextExtractor:
    """
    Extract text from supported document formats.
    """

    SUPPORTED_TYPES = {
        ".pdf",
        ".docx",
        ".txt",
    }

    @classmethod
    def extract(
        cls,
        file_path: str,
    ) -> str:
        """
        Extract text from a document.
        """

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(path)

        extension = path.suffix.lower()

        if extension not in cls.SUPPORTED_TYPES:
            raise ValueError(
                f"Unsupported file type: {extension}"
            )

        logger.info(
            "Extracting text from %s",
            path.name,
        )

        if extension == ".pdf":
            return cls._extract_pdf(path)

        if extension == ".docx":
            return cls._extract_docx(path)

        if extension == ".txt":
            return cls._extract_txt(path)

        raise ValueError(
            f"Unsupported file type: {extension}"
        )

    @staticmethod
    def _extract_pdf(
        path: Path,
    ) -> str:
        """
        Extract text from PDF.
        """

        text = []

        document = fitz.open(path)

        try:

            for page in document:
                page_text = page.get_text()

                if page_text:
                    text.append(page_text)

        finally:
            document.close()

        return "\n".join(text).strip()

    @staticmethod
    def _extract_docx(
        path: Path,
    ) -> str:
        """
        Extract text from DOCX.
        """

        document = Document(path)

        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        ).strip()

    @staticmethod
    def _extract_txt(
        path: Path,
    ) -> str:
        """
        Extract text from TXT.
        """

        return path.read_text(
            encoding="utf-8",
            errors="ignore",
        ).strip()