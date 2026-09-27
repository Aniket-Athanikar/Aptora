"""
Aptora - Learning Mode Model

Stores the user's preferred learning modes.
One workspace can have multiple learning modes.
"""

import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class LearningModeDb(Base):
    __tablename__ = "learning_modes"

    __table_args__ = (
        UniqueConstraint(
            "workspace_id",
            "learning_mode",
            name="uq_workspace_learning_mode",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(
        Integer,
        ForeignKey("goal_workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Mock Tests / PYQs / Revision Notes / Flashcards / Videos
    learning_mode = Column(
        String(100),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    # Relationship
    workspace = relationship(
        "GoalWorkspaceDb",
        back_populates="learning_modes",
    )