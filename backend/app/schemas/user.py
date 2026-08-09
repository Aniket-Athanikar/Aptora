"""
ExamForge AI — User/Profile Schemas
"""

from typing import Optional

from pydantic import BaseModel


class ProfileResponse(BaseModel):
    success: bool
    profile: dict


class ProfileUpdatePayload(BaseModel):
    # User
    name: Optional[str] = None

    # Basic Profile
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None

    education: Optional[str] = None
    college: Optional[str] = None
    occupation: Optional[str] = None

    bio: Optional[str] = None
    avatar_url: Optional[str] = None

    # JSON Fields
    social_links: Optional[dict] = None
    notification_settings: Optional[dict] = None
    privacy_settings: Optional[dict] = None

    # Subscription
    plan: Optional[str] = None

    # Exam preferences & goals (from wizard/profile)
    target_exam: Optional[str] = None
    secondary_exam: Optional[str] = None
    target_score: Optional[str] = None
    target_rank: Optional[str] = None
    target_date: Optional[str] = None
    study_hours_goal: Optional[float] = None
    weak_subjects: Optional[list] = None
    strong_subjects: Optional[list] = None
    favorite_subjects: Optional[list] = None


class EventLogPayload(BaseModel):
    event_type: str
    details: Optional[dict] = None