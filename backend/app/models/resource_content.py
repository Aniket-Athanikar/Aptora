"""
ExamForge AI - Resource Content Model
"""

import datetime

from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class ResourceContentDb(Base):
    __tablename__ = "resource_contents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    resource_id = Column(
        Integer,
        ForeignKey("resources.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    raw_text = Column(
        Text,
        nullable=False,
    )

    cleaned_text = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    resource = relationship(
        "ResourceDb",
        back_populates="content",
    )