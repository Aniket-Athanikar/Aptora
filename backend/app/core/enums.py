from enum import Enum


class ResourceType(str, Enum):
    BOOK = "book"
    NOTES = "notes"
    PYQ = "pyq"
    SYLLABUS = "syllabus"

class ResourceStatus(str, Enum):
    UPLOADED = "UPLOADED"
    QUEUED = "QUEUED"
    OCR = "OCR"
    CHUNKING = "CHUNKING"
    EMBEDDING = "EMBEDDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"