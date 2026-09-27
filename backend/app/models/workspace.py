"""
Aptora - Goal Workspace Model
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


class GoalWorkspaceDb(Base):
    __tablename__ = "goal_workspaces"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    # Page 1
    target_exam = Column(
        String(150),
        nullable=False,
    )

    exam_category = Column(
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

    profile = relationship(
        "UserOnboardingProfileDb",
        uselist=False,
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

    timeline = relationship(
        "GoalTimelineDb",
        uselist=False,
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

    lifestyle = relationship(
        "StudyLifestyleDb",
        uselist=False,
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

    learning_modes = relationship(
        "LearningModeDb",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

    gap_analysis = relationship(
        "GapAnalysisDb",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

     # -----------------------
    # Phase 2
    # -----------------------

    subjects = relationship(
        "WorkspaceSubjectDb",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

    resources = relationship(
        "ResourceDb",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

    # -----------------------

    user = relationship(
        "UserDb",
        back_populates="workspace",
    )