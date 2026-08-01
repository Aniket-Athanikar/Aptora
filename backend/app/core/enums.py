from enum import Enum


class ResourceType(str, Enum):
    BOOK = "book"
    NOTES = "notes"
    PYQ = "pyq"
    SYLLABUS = "syllabus"

class ResourceStatus(str, Enum):
    UPLOADED = "UPLOADED"
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    OCR = "OCR"
    CHUNKING = "CHUNKING"
    EMBEDDING = "EMBEDDING"
    INDEXING = "INDEXING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
