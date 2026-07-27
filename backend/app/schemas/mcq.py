"""
ExamForge AI — MCQ Schemas
===========================

Pydantic models for structured MCQ generation.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class MCQOptions(BaseModel):
    A: str = Field(..., description="Option A text")
    B: str = Field(..., description="Option B text")
    C: str = Field(..., description="Option C text")
    D: str = Field(..., description="Option D text")


class MCQItem(BaseModel):
    question: str = Field(..., description="Question statement")
    options: MCQOptions = Field(..., description="Four options dictionary")
    correct_option: str = Field(..., description="Correct option key: A, B, C, or D")
    explanation: str = Field(..., description="Explanation for why the option is correct")


class MCQGenerateRequest(BaseModel):
    workspace_id: int = Field(..., description="Workspace ID")
    topic: Optional[str] = Field(None, description="Optional focus topic/keyword")
    count: Optional[int] = Field(5, ge=1, le=20, description="Number of questions (1-20)")
    difficulty: Optional[str] = Field("medium", description="Difficulty: easy, medium, hard")


class MCQGenerateResponse(BaseModel):
    success: bool = True
    workspace_id: int
    topic: Optional[str] = None
    count: int
    questions: list[MCQItem] = Field(default_factory=list)
