"""
Aptora - Question Generator API
"""

import logging

from fastapi import APIRouter, HTTPException

from app.ai.services.question_service import QuestionService
from app.schemas.question import (
    QuestionRequest,
    QuestionResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/questions",
    tags=["AI Questions"],
)


@router.post(
    "",
    response_model=QuestionResponse,
)
async def generate_questions(
    request: QuestionRequest,
):

    try:

        questions = QuestionService.generate(
            workspace_id=request.workspace_id,
            question_type=request.question_type,
            question_count=request.question_count,
        )

        return QuestionResponse(
            success=True,
            questions=questions,
        )

    except Exception as e:

        logger.exception(e)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate questions.",
        )