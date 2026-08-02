"""
ExamForge AI - User Profile Model

Stores the user's profile and account preferences.
"""

import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    JSON,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.db.base import Base


class UserProfileDb(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Basic Information
    phone = Column(String(20), default="")
    dob = Column(String(20), default="")
    gender = Column(String(20), default="")
    location = Column(String(150), default="")
    timezone = Column(String(50), default="Asia/Kolkata")

    education = Column(String(100), default="")
    college = Column(String(150), default="")
    occupation = Column(String(100), default="")
    bio = Column(Text, default="")
    avatar_url = Column(Text, default="")

    # Exam preferences
    target_exam = Column(String(100), default="")
    secondary_exam = Column(String(100), default="")
    target_score = Column(String(20), default="")
    target_rank = Column(String(20), default="")
    target_date = Column(String(30), default="")
    study_hours_goal = Column(Float, default=4.0)
    weak_subjects = Column(JSON, default=list)
    strong_subjects = Column(JSON, default=list)
    favorite_subjects = Column(JSON, default=list)

    # Gamification
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak = Column(Integer, default=0)

    # Performance
    accuracy = Column(Float, default=0.0)
    mock_average = Column(Float, default=0.0)
    questions_solved = Column(Integer, default=0)
    study_hours_total = Column(Float, default=0.0)
    completion_pct = Column(Float, default=0.0)

    bookmarks_count = Column(Integer, default=0)
    certificates_count = Column(Integer, default=0)

    # Social
    social_links = Column(JSON, default=dict)
    achievements = Column(JSON, default=list)
    connected_devices = Column(JSON, default=list)

    notification_settings = Column(JSON, default=dict)
    privacy_settings = Column(JSON, default=dict)

    security_score = Column(Integer, default=50)

    # Subscription
    plan = Column(String(30), default="Free")
    plan_renewal = Column(String(30), default="")
    ai_credits = Column(Integer, default=50)
    storage_used_mb = Column(Float, default=0.0)

    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )

    # Relationship with User
    user = relationship(
        "UserDb",
        backref="profile",
    )