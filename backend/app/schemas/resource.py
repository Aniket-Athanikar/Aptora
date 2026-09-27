"""
Aptora - Resource Schemas
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ResourceBase(BaseModel):
    resource_type: str
    title: str
    description: Optional[str] = None
    language: str = "English"


class ResourceCreate(ResourceBase):
    workspace_id: int
    subject_id: int


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    status: Optional[str] = None


class ResourceResponse(ResourceBase):
    id: int

    workspace_id: int
    subject_id: int

    original_filename: str
    stored_filename: str

    storage_path: str

    mime_type: str

    file_size: int

    total_pages: Optional[int] = None

    status: str

    created_at: datetime
    updated_at: datetime
    chunks_count: int = 0

    model_config = ConfigDict(from_attributes=True)