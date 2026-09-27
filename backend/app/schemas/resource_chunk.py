"""
Aptora - Resource Chunk Schemas
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ResourceChunkBase(BaseModel):
    chunk_index: int
    page_number: Optional[int] = None
    chapter: Optional[str] = None
    topic: Optional[str] = None
    content: str


class ResourceChunkCreate(ResourceChunkBase):
    resource_id: int


class ResourceChunkUpdate(BaseModel):
    chapter: Optional[str] = None
    topic: Optional[str] = None
    embedding_generated: Optional[bool] = None


class ResourceChunkResponse(ResourceChunkBase):
    id: int

    resource_id: int

    embedding_generated: bool

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)