from app.processing.ocr_service import OCRService

text = OCRService.extract_text(
    "app/uploads/lec1.pdf"
)

print("=" * 100)
print(text[:2000])
print("=" * 100)
print(len(text))