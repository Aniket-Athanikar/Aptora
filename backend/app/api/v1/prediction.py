"""
ExamForge AI - Prediction API
"""

import logging

from fastapi import APIRouter, HTTPException

from app.ai.services.prediction_service import PredictionService
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/predictions",
    tags=["AI Prediction"],
)


@router.post(
    "",
    response_model=PredictionResponse,
)
async def generate_predictions(
    request: PredictionRequest,
):

    try:

        predictions = PredictionService.generate(
            workspace_id=request.workspace_id,
            prediction_count=request.prediction_count,
        )

        return PredictionResponse(
            success=True,
            predictions=predictions,
        )

    except Exception as e:

        logger.exception(e)

        raise HTTPException(
            status_code=500,
            detail="Failed to generate predictions.",
        )