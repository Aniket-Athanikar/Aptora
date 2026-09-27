"""
Aptora - Workspace Subject Model
"""

import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class WorkspaceSubjectDb(Base):
    __tablename__ = "workspace_subjects"

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

    name = Column(
        String(100),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    display_order = Column(
        Integer,
        default=0,
    )

    icon = Column(
        String(50),
        nullable=True,
    )

    color = Column(
        String(20),
        nullable=True,
    )

    is_active = Column(
        Boolean,
        default=True,
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

    # -----------------------------------
    # Relationships
    # -----------------------------------

    workspace = relationship(
        "GoalWorkspaceDb",
        back_populates="subjects",
    )

    resources = relationship(
        "ResourceDb",
        back_populates="subject",
        cascade="all, delete-orphan",
    )