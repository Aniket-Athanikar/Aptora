"""
ExamForge AI - Flashcard API
"""

import logging

from fastapi import APIRouter, HTTPException

from app.ai.services.flashcard_service import FlashcardService
from app.schemas.flashcard import (
    FlashcardRequest,
    FlashcardResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/flashcards",
    tags=["AI Flashcards"],
)


@router.post(
    "",
    response_model=FlashcardResponse,
)
async def generate_flashcards(
    request: FlashcardRequest,
):

    try:

        flashcards = FlashcardService.generate(
            workspace_id=request.workspace_id,
            flashcard_count=request.flashcard_count,
        )

        return FlashcardResponse(
            success=True,
            flashcards=flashcards,
        )

    except Exception as e:

        logger.exception(e)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate flashcards.",
        )