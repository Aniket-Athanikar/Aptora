"""
Aptora - AI Study Source Schemas
"""

import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class SelectSourcePayload(BaseModel):
    resource_id: int = Field(..., description="ID of the resource book to select as AI Study source")


class LibraryBookItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    original_filename: str
    resource_type: str
    status: str
    total_pages: Optional[int] = 0
    chunks_count: int = 0
    file_size: int = 0
    workspace_id: int
    subject_id: int
    subject: Optional[str] = None
    exam: Optional[str] = None
    ai_ready: bool = False
    is_selected: bool = False
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class LibraryBooksResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[LibraryBookItem]


class AiStudySourceItem(BaseModel):
    id: int
    user_id: int
    workspace_id: int
    resource_id: int
    is_active: bool
    selected_at: datetime.datetime
    resource: Optional[LibraryBookItem] = None

    class Config:
        from_attributes = True
