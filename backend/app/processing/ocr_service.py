"""
Aptora - OCR Service
"""

import os
import shutil
import fitz
import pytesseract
from pathlib import Path
from pdf2image import convert_from_path
import pytesseract

# Do not hard-code Windows executables.  Containers use PATH; local Windows
# installs may optionally supply an explicit executable through this variable.
_tesseract_cmd = os.getenv("TESSERACT_CMD")
if _tesseract_cmd and Path(_tesseract_cmd).exists():
    pytesseract.pytesseract.tesseract_cmd = _tesseract_cmd

class OCRService:

    @staticmethod
    def extract_text(file_path: str) -> str:

        file_path = Path(file_path)

        text = ""

        print("Trying direct PDF extraction...")

        document = fitz.open(file_path)

        for page in document:
            text += page.get_text()

        document.close()

        print(f"Direct extraction length: {len(text.strip())}")

        # Digitally generated PDFs should never require external OCR tools.
        # The old forced-OCR path made otherwise valid documents fail in the
        # Linux worker because it referenced a Windows Poppler installation.
        if len(text.strip()) >= 40:
            return text

        if not shutil.which("pdftoppm") or not shutil.which("tesseract"):
            raise RuntimeError("Scanned PDF needs Poppler and Tesseract, but they are unavailable in this runtime.")

        print("Running OCR for scanned PDF...")

        pages = convert_from_path(
            str(file_path),
        )

        ocr_text = ""

        for i, page in enumerate(pages, start=1):
            print(f"OCR Page {i}")

            ocr_text += pytesseract.image_to_string(
                page,
                lang="eng",
                config="--oem 3 --psm 6",
            )

        return ocr_text
