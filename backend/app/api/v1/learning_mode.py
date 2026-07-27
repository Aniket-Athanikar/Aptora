"""
ExamForge AI - Learning Mode API
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db

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
):

    user_id = 1

    workspace = WorkspaceService.get_workspace(
        db,
        user_id=user_id,
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    logger.info(
        f"Replacing learning modes for workspace={workspace.id}"
    )

    logger.info(request.learning_modes)

    modes = LearningModeService.replace_learning_modes(
        db=db,
        workspace_id=workspace.id,
        learning_modes=request.learning_modes,
    )

    logger.info("Learning modes updated successfully.")

    return modes


# ----------------------------------------------------------
# Get Learning Modes
# ----------------------------------------------------------

@router.get(
    "/",
    response_model=list[LearningModeResponse],
)
def get_learning_modes(
    db: Session = Depends(get_db),
):

    user_id = 1

    workspace = WorkspaceService.get_workspace(
        db,
        user_id=user_id,
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    logger.info(
        f"Fetching learning modes for workspace={workspace.id}"
    )

    return LearningModeService.get_learning_modes(
        db,
        workspace.id,
    )


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
):

    deleted = LearningModeService.delete_learning_mode(
        db,
        learning_mode_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Learning mode not found",
        )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
