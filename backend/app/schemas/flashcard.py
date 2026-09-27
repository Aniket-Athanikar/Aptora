"""
Aptora - Flashcard Schemas
"""

from pydantic import BaseModel, Field


class FlashcardRequest(BaseModel):
    """
    Request schema for flashcard generation.
    """

    workspace_id: int = Field(..., gt=0)
    flashcard_count: int = Field(
        default=10,
        ge=1,
        le=100,
    )


class FlashcardResponse(BaseModel):
    """
    Response schema for flashcard generation.
    """

    success: bool = True

    flashcards: str