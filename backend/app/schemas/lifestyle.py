"""
ExamForge AI - Study Lifestyle Schemas
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ==========================================
# Base Schema
# ==========================================

class StudyLifestyleBase(BaseModel):
    preferred_device: str
    learning_environment: str
    internet_availability: str
    consistency_commit: str


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