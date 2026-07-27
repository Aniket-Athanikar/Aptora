"""
ExamForge AI - Gap Analysis API
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db

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
        f"Replacing gap analysis for workspace={workspace.id}"
    )

    subjects = GapAnalysisService.replace_subjects(
        db=db,
        workspace_id=workspace.id,
        subjects=request.subjects,
    )

    logger.info(
        "Gap analysis updated successfully."
    )

    return subjects


# ----------------------------------------------------------
# Get Gap Analysis
# ----------------------------------------------------------

@router.get(
    "/",
    response_model=list[GapAnalysisResponse],
)
def get_gap_analysis(
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
        f"Fetching gap analysis for workspace={workspace.id}"
    )

    return GapAnalysisService.get_subjects(
        db,
        workspace.id,
    )


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
):

    deleted = GapAnalysisService.delete_subject(
        db,
        subject_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
