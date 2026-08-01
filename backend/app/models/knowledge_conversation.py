"""Persistent, user-owned Knowledge Chat conversations."""

import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class KnowledgeConversationDb(Base):
    __tablename__ = "knowledge_conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    workspace_id = Column(Integer, ForeignKey("goal_workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("workspace_subjects.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False, default="New study session")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
    last_message_at = Column(DateTime, nullable=True, index=True)
    pinned = Column(Boolean, default=False, nullable=False, index=True)

    messages = relationship("KnowledgeMessageDb", back_populates="conversation", cascade="all, delete-orphan", order_by="KnowledgeMessageDb.created_at")


class KnowledgeMessageDb(Base):
    __tablename__ = "knowledge_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(36), ForeignKey("knowledge_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)
    confidence = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)

    conversation = relationship("KnowledgeConversationDb", back_populates="messages")
