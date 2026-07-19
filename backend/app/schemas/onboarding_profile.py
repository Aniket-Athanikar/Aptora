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
    age: int
    education: str
    stream: str
    city: str
    occupation: str
    syllabus_percent: int
    current_confidence: int


# ==============================
# Update Onboarding Profile
# ==============================

class OnboardingProfileUpdate(BaseModel):
    avatar: str | None = None
    full_name: str
    age: int
    education: str
    stream: str
    city: str
    occupation: str
    syllabus_percent: int
    current_confidence: int


# ==============================
# Response
# ==============================

class OnboardingProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int

    avatar: str | None = None
    full_name: str
    age: int
    education: str
    stream: str
    city: str
    occupation: str

    syllabus_percent: int
    current_confidence: int

    created_at: datetime
    updated_at: datetime