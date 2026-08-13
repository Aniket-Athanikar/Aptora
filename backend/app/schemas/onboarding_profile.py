"""
ExamForge AI - Onboarding Profile Schemas
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


# ==============================
# Create Onboarding Profile
# ==============================

class OnboardingProfileCreate(BaseModel):
    avatar: str | None = None
    full_name: str
    age: int | None = None
    education: str | None = None
    stream: str | None = None
    city: str | None = None
    occupation: str | None = None
    gender: str | None = None
    phone: str | None = None
    syllabus_percent: int | None = None
    current_confidence: int | None = None


# ==============================
# Update Onboarding Profile
# ==============================

class OnboardingProfileUpdate(BaseModel):
    avatar: str | None = None
    full_name: str
    age: int | None = None
    education: str | None = None
    stream: str | None = None
    city: str | None = None
    occupation: str | None = None
    gender: str | None = None
    phone: str | None = None
    syllabus_percent: int | None = None
    current_confidence: int | None = None


# ==============================
# Response
# ==============================

class OnboardingProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int

    avatar: str | None = None
    full_name: str
    age: int | None = None
    education: str | None = None
    stream: str | None = None
    city: str | None = None
    occupation: str | None = None
    gender: str | None = None
    phone: str | None = None

    syllabus_percent: int | None = None
    current_confidence: int | None = None

    created_at: datetime
    updated_at: datetime