"""
ExamForge AI — Knowledge Schemas
==================================

Pydantic schemas for the Knowledge Engine (multi-turn chat, session history, sources).
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional, Union
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
    subject_id: Optional[int] = Field(None, gt=0, description="Optional subject scope for vector retrieval")
    stream_format: Optional[str] = Field("plain", description="Format of streaming: 'plain' or 'sse'")


class KnowledgeChatResponse(BaseModel):
    success: bool = True
    session_id: str
    answer: str
    confidence: Union[float, str] = Field(..., description="Retrieval confidence level, or 0 when no context is found")
    sources: list[SourceItem] = Field(default_factory=list, description="Source documents attribution")
    context_found: bool = Field(..., description="Whether relevant uploaded study material was found")
    history_length: int = Field(0, description="Total messages in session memory")


class MessageItem(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")


class SessionHistoryResponse(BaseModel):
    success: bool = True
    session_id: str
    message_count: int
    messages: list[MessageItem]


class ConversationCreateRequest(BaseModel):
    workspace_id: int = Field(..., gt=0)
    subject_id: Optional[int] = Field(None, gt=0)


class ConversationRenameRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class PersistentMessageItem(MessageItem):
    sources: Optional[list[dict[str, Any]]] = None
    confidence: Optional[str] = None
    created_at: datetime


class ConversationSummary(BaseModel):
    session_id: str
    workspace_id: int
    subject_id: Optional[int]
    title: str
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime]
    pinned: bool
    last_message: Optional[str] = None
    message_count: Optional[int] = 0


class ConversationDetail(ConversationSummary):
    messages: list[PersistentMessageItem] = Field(default_factory=list)


class ChatExportResponse(BaseModel):
    id: str
    conversation_id: str
    user_id: int
    status: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

