"""
Aptora - Study Time Slot Schemas
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


# ==========================================
# Base Schema
# ==========================================

class StudyTimeSlotBase(BaseModel):
    time_slot: str


# ==========================================
# Create
# ==========================================

class StudyTimeSlotCreate(StudyTimeSlotBase):
    pass


# ==========================================
# Update
# ==========================================

class StudyTimeSlotUpdate(StudyTimeSlotBase):
    pass


# ==========================================
# Bulk Replace Request
# ==========================================

class StudyTimeSlotListRequest(BaseModel):
    study_slots: list[str]


# ==========================================
# Response
# ==========================================

class StudyTimeSlotResponse(StudyTimeSlotBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lifestyle_id: int
    created_at: datetime