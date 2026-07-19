import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class UserOnboardingProfileDb(Base):
    __tablename__ = "user_onboarding_profiles"

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(
        Integer,
        ForeignKey("goal_workspaces.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    avatar = Column(Text, default="")

    full_name = Column(String(150), nullable=False)

    age = Column(Integer)

    education = Column(String(100))

    stream = Column(String(100))

    city = Column(String(100))

    occupation = Column(String(100))

    syllabus_percent = Column(Integer, default=0)

    current_confidence = Column(Integer, default=0)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    workspace = relationship(
        "GoalWorkspaceDb",
        back_populates="profile",
    )