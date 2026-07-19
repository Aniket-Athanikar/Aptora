"""
ExamForge AI - Study Lifestyle Model

Stores the user's study lifestyle preferences.
One lifestyle record per workspace.
"""

import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class StudyLifestyleDb(Base):
    __tablename__ = "study_lifestyles"

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(
        Integer,
        ForeignKey("goal_workspaces.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # Preferred Learning Device
    preferred_device = Column(
        String(100),
        nullable=False,
    )

    # Home / Library / Coaching etc.
    learning_environment = Column(
        String(100),
        nullable=False,
    )

    # Full Access / Limited / Offline
    internet_availability = Column(
        String(100),
        nullable=False,
    )

    # Everyday / Weekdays Only / Weekends Intensive
    consistency_commit = Column(
        String(100),
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

    # Relationships

    workspace = relationship(
        "GoalWorkspaceDb",
        back_populates="lifestyle",
    )

    study_slots = relationship(
        "StudyTimeSlotDb",
        back_populates="lifestyle",
        cascade="all, delete-orphan",
    )