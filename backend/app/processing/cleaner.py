"""
Aptora - Text Cleaner
"""

import re


class CleanerService:

    @staticmethod
    def clean(text: str) -> str:
        """
        Clean extracted OCR/PDF text.
        """

        if not text:
            return ""

        # Remove multiple spaces
        text = re.sub(r"[ \t]+", " ", text)

        # Remove multiple blank lines
        text = re.sub(r"\n{2,}", "\n", text)

        # Remove page numbers (lines containing only digits)
        text = re.sub(r"^\d+\s*$", "", text, flags=re.MULTILINE)

        # Remove tabs
        text = text.replace("\t", " ")

        # Normalize line endings
        text = text.replace("\r\n", "\n")

        return text.strip()