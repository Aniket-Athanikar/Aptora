"""
Aptora - Workspace Schemas
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.schemas.resource import ResourceResponse


# ==============================
# Create Workspace
# ==============================

class WorkspaceCreate(BaseModel):
    target_exam: str
    exam_category: str


# ==============================
# Update Workspace
# ==============================

class WorkspaceUpdate(BaseModel):
    target_exam: str
    exam_category: str


# ==============================
# Response
# ==============================

class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    target_exam: str
    exam_category: str
    created_at: datetime
    updated_at: datetime


class WorkspaceInfoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    target_exam: str
    exam_name: str
    exam_category: str
    description: str
    created_at: datetime
    updated_at: datetime
    progress: float


class WorkspaceStatisticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    subjects: int
    documents: int
    books: int
    notes: int
    pyqs: int
    syllabus: int
    chunks: int
    embeddings: int


class SubjectDocumentsGroup(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    subject_id: int
    subject_name: str
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    books: list[ResourceResponse] = []
    notes: list[ResourceResponse] = []
    pyqs: list[ResourceResponse] = []
    syllabus: list[ResourceResponse] = []


class SubjectLibraryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    subject_id: int
    subject: str
    description: str | None = None
    icon: str | None = None
    color: str | None = None
    books: list[ResourceResponse] = []
    notes: list[ResourceResponse] = []
    pyqs: list[ResourceResponse] = []
    syllabus: list[ResourceResponse] = []


class LibrarySearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total: int
    limit: int
    offset: int
    items: list[ResourceResponse] = []
