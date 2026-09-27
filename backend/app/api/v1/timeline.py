"""
Aptora - Timeline API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.workspace import GoalWorkspaceDb
from app.models.user import UserDb
from app.models.timeline import GoalTimelineDb
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
# Create / Upsert Timeline
# ----------------------------------------------------------

@router.post(
    "/",
    response_model=TimelineResponse,
)
def create_timeline(
    timeline: TimelineCreate,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    existing = TimelineService.get_timeline(db, workspace.id)

    if existing:
        updated = TimelineService.update_timeline(db, workspace.id, timeline)
        return updated or existing

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
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    timeline = TimelineService.get_timeline(db, workspace.id)

    if not timeline:
        timeline = GoalTimelineDb(
            workspace_id=workspace.id,
            exam_date="2026-12-31",
            daily_study_hours=4.0,
        )
        db.add(timeline)
        db.commit()
        db.refresh(timeline)

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
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    updated = TimelineService.update_timeline(
        db,
        workspace.id,
        timeline,
    )

    if not updated:
        timeline_obj = GoalTimelineDb(
            workspace_id=workspace.id,
            exam_date=timeline.exam_date or "2026-12-31",
            daily_study_hours=timeline.daily_study_hours or 4.0,
        )
        db.add(timeline_obj)
        db.commit()
        db.refresh(timeline_obj)
        return timeline_obj

    return updated


# ----------------------------------------------------------
# Delete Timeline
# ----------------------------------------------------------

@router.delete("/")
def delete_timeline(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    deleted = TimelineService.delete_timeline(
        db,
        workspace.id,
    )

    return {
        "success": True,
        "message": "Timeline deleted successfully"
    }

