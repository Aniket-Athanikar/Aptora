"""
Aptora - Gap Analysis API
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.workspace import GoalWorkspaceDb
from app.models.user import UserDb
from app.services.workspace_service import WorkspaceService
from app.services.gap_analysis_service import GapAnalysisService

from app.schemas.gap_analysis import (
    GapAnalysisListRequest,
    GapAnalysisResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/gap-analysis",
    tags=["Gap Analysis"],
)


def get_active_workspace(db: Session, user_id: int) -> GoalWorkspaceDb:
    workspace = WorkspaceService.get_workspace(db, user_id=user_id)
    if not workspace or isinstance(workspace, dict):
        workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.user_id == user_id).first()
    if not workspace:
        workspace = GoalWorkspaceDb(user_id=user_id, target_exam="UPSC CSE", exam_category="Civil Services")
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
    return workspace


# ----------------------------------------------------------
# Replace Subjects
# ----------------------------------------------------------

@router.put(
    "/",
    response_model=list[GapAnalysisResponse],
)
def replace_gap_analysis(
    request: GapAnalysisListRequest,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)

    logger.info(
        f"Replacing gap analysis for workspace={workspace.id}"
    )

    subjects = GapAnalysisService.replace_subjects(
        db=db,
        workspace_id=workspace.id,
        subjects=request.subjects,
    )

    return subjects or []


# ----------------------------------------------------------
# Get Gap Analysis
# ----------------------------------------------------------

@router.get(
    "/",
    response_model=list[GapAnalysisResponse],
)
def get_gap_analysis(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)

    logger.info(
        f"Fetching gap analysis for workspace={workspace.id}"
    )

    return GapAnalysisService.get_subjects(
        db,
        workspace.id,
    ) or []


# ----------------------------------------------------------
# Delete Subject
# ----------------------------------------------------------

@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    deleted = GapAnalysisService.delete_subject(
        db,
        subject_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )

