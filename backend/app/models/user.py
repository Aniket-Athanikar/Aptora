"""
ExamForge AI — User Models
User, UserProfile, OTP, and AccountDeletionRequest models.
"""
import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey
from app.db.base import Base


class UserDb(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class OtpDb(Base):
    __tablename__ = "otps"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False)
    otp = Column(String(6), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_used = Column(Boolean, default=False)


class UserProfileDb(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
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
    # Gamification
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak = Column(Integer, default=0)
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
    # Performance
    accuracy = Column(Float, default=0.0)
    mock_average = Column(Float, default=0.0)
    questions_solved = Column(Integer, default=0)
    study_hours_total = Column(Float, default=0.0)
    completion_pct = Column(Float, default=0.0)
    bookmarks_count = Column(Integer, default=0)
    certificates_count = Column(Integer, default=0)
    # Social & Meta
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
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AccountDeletionRequestDb(Base):
    __tablename__ = "account_deletion_requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    email = Column(String(100), nullable=False)
    reason = Column(Text, default="")
    otp = Column(String(6), nullable=False)
    otp_verified = Column(Boolean, default=False)
    status = Column(String(20), default="pending")  # pending, confirmed, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
