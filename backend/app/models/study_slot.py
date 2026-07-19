"""
ExamForge AI - Study Time Slot Model

Stores the preferred study time slots selected by the user.
A lifestyle can have multiple study slots.
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


class StudyTimeSlotDb(Base):
    __tablename__ = "study_time_slots"

    __table_args__ = (
        UniqueConstraint(
            "lifestyle_id",
            "time_slot",
            name="uq_lifestyle_time_slot",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    lifestyle_id = Column(
        Integer,
        ForeignKey("study_lifestyles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Morning / Afternoon / Evening / Night / Weekend
    time_slot = Column(
        String(50),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    # Relationship
    lifestyle = relationship(
        "StudyLifestyleDb",
        back_populates="study_slots",
    )