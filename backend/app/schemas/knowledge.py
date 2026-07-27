"""
ExamForge AI — Knowledge Schemas
==================================

Pydantic schemas for the Knowledge Engine (multi-turn chat, session history, sources).
"""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, Field


class SourceItem(BaseModel):
    resource_id: Optional[int] = Field(None, description="Resource ID")
    document_title: str = Field("Uploaded Resource", description="Title of the source document")
    subject: str = Field("Unknown", description="Subject name")
    chapter: Optional[str] = Field(None, description="Chapter name if available")
    page_number: Optional[int] = Field(None, description="Page number if available")
    score: float = Field(0.0, description="Similarity score from vector search")


class KnowledgeChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique session ID for conversation memory tracking")
    workspace_id: int = Field(..., description="Workspace ID to search resources within")
    question: str = Field(..., min_length=1, description="Student question")
    limit: Optional[int] = Field(8, ge=1, le=20, description="Max chunks to retrieve")


class KnowledgeChatResponse(BaseModel):
    success: bool = True
    session_id: str
    answer: str
    confidence: str = Field(..., description="Retrieval confidence: 'high', 'medium', 'low', or 'none'")
    sources: list[SourceItem] = Field(default_factory=list, description="Source documents attribution")
    history_length: int = Field(0, description="Total messages in session memory")


class MessageItem(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")


class SessionHistoryResponse(BaseModel):
    success: bool = True
    session_id: str
    message_count: int
    messages: list[MessageItem]
