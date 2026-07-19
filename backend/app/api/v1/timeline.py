"""
ExamForge AI - Timeline API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.services.workspace_service import WorkspaceService
from app.services.timeline_service import TimelineService

from app.schemas.timeline import (
    TimelineCreate,
    TimelineUpdate,
    TimelineResponse,
)

router = APIRouter(
    prefix="/timeline",
    tags=["Timeline"],
)


# ----------------------------------------------------------
# Create Timeline
# ----------------------------------------------------------

@router.post(
    "/",
    response_model=TimelineResponse,
)
def create_timeline(
    timeline: TimelineCreate,
    db: Session = Depends(get_db),
):

    user_id = 1

    workspace = WorkspaceService.get_workspace(
        db,
        user_id,
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    existing = TimelineService.get_timeline(
        db,
        workspace.id,
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Timeline already exists",
        )

    return TimelineService.create_timeline(
        db,
        workspace.id,
        timeline,
    )


# ----------------------------------------------------------
# Get Timeline
# ----------------------------------------------------------

@router.get(
    "/",
    response_model=TimelineResponse,
)
def get_timeline(
    db: Session = Depends(get_db),
):

    user_id = 1

    workspace = WorkspaceService.get_workspace(
        db,
        user_id,
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    timeline = TimelineService.get_timeline(
        db,
        workspace.id,
    )

    if not timeline:
        raise HTTPException(
            status_code=404,
            detail="Timeline not found",
        )

    return timeline


# ----------------------------------------------------------
# Update Timeline
# ----------------------------------------------------------

@router.put(
    "/",
    response_model=TimelineResponse,
)
def update_timeline(
    timeline: TimelineUpdate,
    db: Session = Depends(get_db),
):

    user_id = 1

    workspace = WorkspaceService.get_workspace(
        db,
        user_id,
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    updated = TimelineService.update_timeline(
        db,
        workspace.id,
        timeline,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Timeline not found",
        )

    return updated


# ----------------------------------------------------------
# Delete Timeline
# ----------------------------------------------------------

@router.delete("/")
def delete_timeline(
    db: Session = Depends(get_db),
):

    user_id = 1

    workspace = WorkspaceService.get_workspace(
        db,
        user_id,
    )

    if not workspace:
        raise HTTPException(
            status_code=404,
            detail="Workspace not found",
        )

    deleted = TimelineService.delete_timeline(
        db,
        workspace.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Timeline not found",
        )

    return {
        "message": "Timeline deleted successfully"
    }