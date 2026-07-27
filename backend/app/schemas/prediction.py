"""
ExamForge AI - Prediction Schemas
"""

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """
    Request schema for exam prediction.
    """

    workspace_id: int = Field(..., gt=0)

    prediction_count: int = Field(
        default=10,
        ge=1,
        le=100,
    )


class PredictionResponse(BaseModel):
    """
    Response schema for exam prediction.
    """

    success: bool = True

    predictions: str