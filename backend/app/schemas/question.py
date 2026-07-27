"""
ExamForge AI - Question Schemas
"""

from pydantic import BaseModel, Field


class QuestionRequest(BaseModel):
    """
    Request schema for question generation.
    """

    workspace_id: int = Field(..., gt=0)

    question_type: str = Field(
        default="mcq",
    )

    question_count: int = Field(
        default=10,
        ge=1,
        le=100,
    )


class QuestionResponse(BaseModel):
    """
    Response schema for question generation.
    """

    success: bool = True

    questions: str