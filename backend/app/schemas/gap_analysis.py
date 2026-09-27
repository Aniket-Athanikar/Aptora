"""
Aptora - Gap Analysis Schemas
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ==========================================
# Base Schema
# ==========================================

class GapAnalysisBase(BaseModel):
    subject: str
    confidence: int
    difficulty: str


# ==========================================
# Create
# ==========================================

class GapAnalysisCreate(GapAnalysisBase):
    pass


# ==========================================
# Update
# ==========================================

class GapAnalysisUpdate(GapAnalysisBase):
    pass


# ==========================================
# Bulk Replace Request
# ==========================================

class GapAnalysisListRequest(BaseModel):
    subjects: list[GapAnalysisCreate]


# ==========================================
# Response
# ==========================================

class GapAnalysisResponse(GapAnalysisBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    created_at: datetime