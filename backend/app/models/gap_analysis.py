"""
Aptora - Gap Analysis Model

Stores subject-wise confidence and difficulty for a workspace.
One workspace can have multiple subjects.
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


class GapAnalysisDb(Base):
    __tablename__ = "gap_analysis"

    __table_args__ = (
        UniqueConstraint(
            "workspace_id",
            "subject",
            name="uq_workspace_subject",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(
        Integer,
        ForeignKey("goal_workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Subject Name
    subject = Column(
        String(150),
        nullable=False,
    )

    # Confidence Level (1-5)
    confidence = Column(
        Integer,
        nullable=False,
    )

    # Easy / Medium / Hard
    difficulty = Column(
        String(20),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    # Relationship
    workspace = relationship(
        "GoalWorkspaceDb",
        back_populates="gap_analysis",
    )