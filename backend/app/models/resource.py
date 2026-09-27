"""
Aptora - Resource Model
"""

import datetime
from app.core.enums import ResourceType, ResourceStatus

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    BigInteger,
    Enum,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class ResourceDb(Base):
    __tablename__ = "resources"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    workspace_id = Column(
        Integer,
        ForeignKey("goal_workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    subject_id = Column(
        Integer,
        ForeignKey("workspace_subjects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    resource_type = Column(
        Enum(
            ResourceType,
            values_callable=lambda enum: [e.value for e in enum],
            name="resourcetype",
            native_enum=True,
        ),
        nullable=False,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    original_filename = Column(
        String(255),
        nullable=False,
    )

    stored_filename = Column(
        String(255),
        nullable=False,
    )

    storage_path = Column(
        String(500),
        nullable=False,
    )

    mime_type = Column(
        String(100),
        nullable=False,
    )

    file_size = Column(
        BigInteger,
        nullable=False,
    )

    total_pages = Column(
        Integer,
        nullable=True,
    )

    language = Column(
        String(50),
        default="English",
    )

    status = Column(
        String(30),
        nullable=False,
        default=ResourceStatus.UPLOADED.value,
    )

    processed_at = Column(
        DateTime,
        nullable=True,
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

    # --------------------------------
    # Relationships
    # --------------------------------

    workspace = relationship(
        "GoalWorkspaceDb",
        back_populates="resources",
    )

    subject = relationship(
        "WorkspaceSubjectDb",
        back_populates="resources",
    )

    chunks = relationship(
        "ResourceChunkDb",
        back_populates="resource",
        cascade="all, delete-orphan",
    )

    content = relationship(
        "ResourceContentDb",
        uselist=False,
        back_populates="resource",
        cascade="all, delete-orphan",
    )

    @property
    def chunks_count(self) -> int:
        return len(self.chunks) if self.chunks else 0
