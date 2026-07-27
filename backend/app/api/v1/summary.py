"""
ExamForge AI - Summary API
"""

import logging

from fastapi import APIRouter, HTTPException

from app.ai.services.summary_service import SummaryService
from app.schemas.summary import (
    SummaryRequest,
    SummaryResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/summary",
    tags=["AI Summary"],
)


@router.post(
    "",
    response_model=SummaryResponse,
)
async def generate_summary(
    request: SummaryRequest,
):

    try:

        summary = SummaryService.generate(
            workspace_id=request.workspace_id,
        )

        return SummaryResponse(
            success=True,
            summary=summary,
        )

    except Exception as e:

        logger.exception(e)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate summary.",
        )