"""
ExamForge AI - Timeline Schemas
"""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


# ==========================================
# Base Schema
# ==========================================

class TimelineBase(BaseModel):
    exam_date: date
    daily_study_hours: int


# ==========================================
# Create
# ==========================================

class TimelineCreate(TimelineBase):
    pass


# ==========================================
# Update
# ==========================================

class TimelineUpdate(TimelineBase):
    pass


# ==========================================
# Response
# ==========================================

class TimelineResponse(TimelineBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    created_at: datetime
    updated_at: datetime