"""
ExamForge AI — MCQ API Router
==============================

Endpoints
---------
POST /mcq/generate — Generate structured MCQs from workspace resources
"""

import logging
from fastapi import APIRouter, HTTPException, status

from app.ai.services.mcq_service import MCQService
from app.schemas.mcq import MCQGenerateRequest, MCQGenerateResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/mcq",
    tags=["MCQ Quiz Engine"],
)


@router.post(
    "/generate",
    response_model=MCQGenerateResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_mcqs(request: MCQGenerateRequest):
    """
    Generate structured Multiple Choice Questions (MCQs) with options, answers, and explanations.
    """
    try:
        result = MCQService.generate(
            workspace_id=request.workspace_id,
            topic=request.topic,
            count=request.count or 5,
            difficulty=request.difficulty or "medium",
        )

        return MCQGenerateResponse(
            success=True,
            workspace_id=result["workspace_id"],
            topic=result["topic"],
            count=result["count"],
            questions=result["questions"],
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Failed to generate MCQs.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate MCQ quiz.",
        )
