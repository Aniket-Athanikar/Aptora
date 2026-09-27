"""
Aptora - Study Time Slot API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.workspace import GoalWorkspaceDb
from app.models.user import UserDb
from app.models.lifestyle import StudyLifestyleDb
from app.services.workspace_service import WorkspaceService
from app.services.lifestyle_service import StudyLifestyleService
from app.services.study_slot_service import StudyTimeSlotService

from app.schemas.study_slot import (
    StudyTimeSlotListRequest,
    StudyTimeSlotResponse,
)

router = APIRouter(
    prefix="/study-slots",
    tags=["Study Time Slots"],
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


def get_active_lifestyle(db: Session, workspace_id: int) -> StudyLifestyleDb:
    lifestyle = StudyLifestyleService.get_lifestyle(db, workspace_id)
    if not lifestyle:
        lifestyle = StudyLifestyleDb(
            workspace_id=workspace_id,
            preferred_device="Laptop",
            learning_environment="Home",
            internet_availability="High Speed",
            consistency_commit="High",
        )
        db.add(lifestyle)
        db.commit()
        db.refresh(lifestyle)
    return lifestyle


# ----------------------------------------------------------
# Replace Study Slots
# ----------------------------------------------------------

@router.put(
    "/",
    response_model=list[StudyTimeSlotResponse],
)
def replace_study_slots(
    request: StudyTimeSlotListRequest,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    lifestyle = get_active_lifestyle(db, workspace.id)

    return StudyTimeSlotService.replace_slots(
        db=db,
        lifestyle_id=lifestyle.id,
        slots=request.study_slots,
    )


# ----------------------------------------------------------
# Get Study Slots
# ----------------------------------------------------------

@router.get(
    "/",
    response_model=list[StudyTimeSlotResponse],
)
def get_study_slots(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    lifestyle = get_active_lifestyle(db, workspace.id)

    return StudyTimeSlotService.get_slots(
        db,
        lifestyle.id,
    ) or []


# ----------------------------------------------------------
# Delete One Slot
# ----------------------------------------------------------

@router.delete("/{slot_id}")
def delete_study_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    deleted = StudyTimeSlotService.delete_slot(
        db,
        slot_id,
    )

    return {
        "success": True,
        "message": "Study slot deleted successfully"
    }

