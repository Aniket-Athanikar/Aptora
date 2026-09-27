"""
Aptora — Study Advisor Schemas
======================================

Pydantic models for study recommendations and plans.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class ResourceStatsSummary(BaseModel):
    total_books: int = 0
    total_notes: int = 0
    total_pyqs: int = 0
    total_syllabus: int = 0


class StudyPlanResponse(BaseModel):
    success: bool = True
    workspace_id: int
    target_exam: str
    subjects: list[str] = Field(default_factory=list)
    resource_stats: ResourceStatsSummary
    study_plan: str = Field(..., description="Generated personalized study plan markdown text")
