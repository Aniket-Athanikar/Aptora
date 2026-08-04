"""
ExamForge AI - Learning Mode API
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.workspace import GoalWorkspaceDb
from app.models.user import UserDb
from app.services.workspace_service import WorkspaceService
from app.services.learning_mode_service import LearningModeService

from app.schemas.learning_mode import (
    LearningModeListRequest,
    LearningModeResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/learning-modes",
    tags=["Learning Modes"],
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
# Replace Learning Modes
# ----------------------------------------------------------

@router.put(
    "/",
    response_model=list[LearningModeResponse],
)
def replace_learning_modes(
    request: LearningModeListRequest,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)

    logger.info(
        f"Replacing learning modes for workspace={workspace.id}"
    )

    modes = LearningModeService.replace_learning_modes(
        db=db,
        workspace_id=workspace.id,
        learning_modes=request.learning_modes,
    )

    return modes or []


# ----------------------------------------------------------
# Get Learning Modes
# ----------------------------------------------------------

@router.get(
    "/",
    response_model=list[LearningModeResponse],
)
def get_learning_modes(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)

    logger.info(
        f"Fetching learning modes for workspace={workspace.id}"
    )

    return LearningModeService.get_learning_modes(
        db,
        workspace.id,
    ) or []


# ----------------------------------------------------------
# Delete Learning Mode
# ----------------------------------------------------------

@router.delete(
    "/{learning_mode_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_learning_mode(
    learning_mode_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    deleted = LearningModeService.delete_learning_mode(
        db,
        learning_mode_id,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )

