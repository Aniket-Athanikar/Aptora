"""
Aptora - AI Study Source Model
"""

import datetime
from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


class AiStudySourceDb(Base):
    __tablename__ = "ai_study_sources"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    workspace_id = Column(
        Integer,
        ForeignKey("goal_workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    resource_id = Column(
        Integer,
        ForeignKey("resources.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    selected_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("user_id", "resource_id", name="uq_user_resource_source"),
    )

    user = relationship("UserDb", backref="ai_study_sources")
    workspace = relationship("GoalWorkspaceDb", backref="ai_study_sources")
    resource = relationship("ResourceDb", backref="ai_study_sources")
