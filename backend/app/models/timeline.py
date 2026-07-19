"""
ExamForge AI - Goal Timeline Model

Stores exam timeline information for a workspace.
"""

import datetime

from sqlalchemy import (
    Column,
    Integer,
    Date,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class GoalTimelineDb(Base):
    __tablename__ = "goal_timelines"

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(
        Integer,
        ForeignKey("goal_workspaces.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # Page 2
    exam_date = Column(Date, nullable=False)

    daily_study_hours = Column(Integer, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    # Relationship

    workspace = relationship(
        "GoalWorkspaceDb",
        back_populates="timeline",
    )