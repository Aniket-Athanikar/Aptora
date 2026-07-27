"""
ExamForge AI - OCR Service
"""

import fitz
import pytesseract

from pathlib import Path
from pdf2image import convert_from_path
import pytesseract

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

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

        # ----------------------------
        # Force OCR for now
        # ----------------------------

        print("Running OCR...")

        pages = convert_from_path(
            file_path,
            poppler_path=r"C:\poppler\poppler-26.02.0\Library\bin",
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