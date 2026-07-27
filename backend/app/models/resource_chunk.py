"""
ExamForge AI - Resource Chunk Model
"""

import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class ResourceChunkDb(Base):
    __tablename__ = "resource_chunks"

    # ==========================================================
    # Primary Key
    # ==========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ==========================================================
    # Relationships
    # ==========================================================

    resource_id = Column(
        Integer,
        ForeignKey("resources.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Chunk Information
    # ==========================================================

    chunk_index = Column(
        Integer,
        nullable=False,
    )

    page_number = Column(
        Integer,
        nullable=True,
    )
    
    subject = Column(
        String(255),
        nullable=True,
    )

    chapter = Column(
        String(255),
        nullable=True,
    )

    topic = Column(
        String(255),
        nullable=True,
    )

    content = Column(
        Text,
        nullable=False,
    )

    token_count = Column(
        Integer,
        default=0,
    )

    # ==========================================================
    # AI Metadata
    # ==========================================================

    chunk_metadata = Column(
        JSON,
        nullable=True,
    )

    embedding_generated = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    qdrant_point_id = Column(
        String(100),
        unique=True,
        nullable=True,
    )

    # ==========================================================
    # Audit Fields
    # ==========================================================

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    # ==========================================================
    # SQLAlchemy Relationships
    # ==========================================================

    resource = relationship(
        "ResourceDb",
        back_populates="chunks",
    )