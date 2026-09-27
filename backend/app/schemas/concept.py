"""
Aptora — Concept Linker Schemas
========================================

Pydantic models for cross-document concept mapping.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class SnippetOccurrence(BaseModel):
    chunk_index: Optional[int] = None
    page_number: Optional[int] = None
    chapter: Optional[str] = None
    topic: Optional[str] = None
    score: float
    content_preview: str


class ResourceOccurrenceGroup(BaseModel):
    resource_id: int
    document_title: str
    subject: str
    chunk_count: int
    max_similarity_score: float
    snippets: list[SnippetOccurrence] = Field(default_factory=list)


class ConceptMapRequest(BaseModel):
    workspace_id: int = Field(..., description="Target workspace ID")
    concept: str = Field(..., min_length=1, description="Concept or topic keyword to map")
    limit: Optional[int] = Field(20, ge=1, le=50, description="Max chunks to retrieve")


class ConceptMapResponse(BaseModel):
    success: bool = True
    workspace_id: int
    concept: str
    total_occurrences: int
    resources_covered: int
    occurrences_by_resource: list[ResourceOccurrenceGroup] = Field(default_factory=list)
