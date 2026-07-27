"""
ExamForge AI - Metadata Service
"""

from pathlib import Path

import fitz


class MetadataService:
    """
    Extract metadata from uploaded documents.
    """

    @staticmethod
    def extract(file_path: str) -> dict:

        file = Path(file_path)

        document = fitz.open(file)

        metadata = document.metadata

        result = {
            "title": metadata.get("title") or file.stem,
            "author": metadata.get("author"),
            "subject": metadata.get("subject"),
            "creator": metadata.get("creator"),
            "producer": metadata.get("producer"),
            "keywords": metadata.get("keywords"),
            "page_count": document.page_count,
            "file_size": file.stat().st_size,
            "extension": file.suffix.lower(),
        }

        document.close()

        return result