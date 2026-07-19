"""
ExamForge AI - Workspace Schemas
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


# ==============================
# Create Workspace
# ==============================

class WorkspaceCreate(BaseModel):
    target_exam: str
    exam_category: str


# ==============================
# Update Workspace
# ==============================

class WorkspaceUpdate(BaseModel):
    target_exam: str
    exam_category: str


# ==============================
# Response
# ==============================

class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    target_exam: str
    exam_category: str
    created_at: datetime
    updated_at: datetime