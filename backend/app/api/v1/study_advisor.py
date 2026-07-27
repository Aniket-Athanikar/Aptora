"""
ExamForge AI — Study Advisor API Router
=========================================

Endpoints
---------
GET /workspace/{workspace_id}/study-plan — Get personalized AI study plan
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.services.study_advisor_service import StudyAdvisorService
from app.core.dependencies import get_db, get_current_user
from app.models.user import UserDb
from app.schemas.study_advisor import StudyPlanResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/workspace",
    tags=["Study Advisor"],
)


@router.get(
    "/{workspace_id}/study-plan",
    response_model=StudyPlanResponse,
    status_code=status.HTTP_200_OK,
)
def get_study_plan(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Generate an AI-driven, personalized study plan based on workspace resources and exam targets.
    """
    try:
        result = StudyAdvisorService.generate_plan(
            db=db,
            workspace_id=workspace_id,
        )

        return StudyPlanResponse(
            success=True,
            workspace_id=result["workspace_id"],
            target_exam=result["target_exam"],
            subjects=result["subjects"],
            resource_stats=result["resource_stats"],
            study_plan=result["study_plan"],
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Failed to generate study plan.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate personalized study plan.",
        )
