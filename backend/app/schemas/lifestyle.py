"""
Aptora - Study Lifestyle Schemas
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ==========================================
# Base Schema
# ==========================================

class StudyLifestyleBase(BaseModel):
    preferred_device: str | None = None
    learning_environment: str | None = None
    internet_availability: str | None = None
    consistency_commit: str | None = None


# ==========================================
# Create
# ==========================================

class StudyLifestyleCreate(StudyLifestyleBase):
    pass


# ==========================================
# Update
# ==========================================

class StudyLifestyleUpdate(StudyLifestyleBase):
    pass


# ==========================================
# Response
# ==========================================

class StudyLifestyleResponse(StudyLifestyleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    created_at: datetime
    updated_at: datetime