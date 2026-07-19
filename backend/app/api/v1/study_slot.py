"""
ExamForge AI - Study Time Slot API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

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

    lifestyle = StudyLifestyleService.get_lifestyle(
        db,
        workspace.id,
    )

    if not lifestyle:
        raise HTTPException(
            status_code=404,
            detail="Lifestyle not found",
        )

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

    lifestyle = StudyLifestyleService.get_lifestyle(
        db,
        workspace.id,
    )

    if not lifestyle:
        raise HTTPException(
            status_code=404,
            detail="Lifestyle not found",
        )

    return StudyTimeSlotService.get_slots(
        db,
        lifestyle.id,
    )


# ----------------------------------------------------------
# Delete One Slot
# ----------------------------------------------------------

@router.delete("/{slot_id}")
def delete_study_slot(
    slot_id: int,
    db: Session = Depends(get_db),
):

    deleted = StudyTimeSlotService.delete_slot(
        db,
        slot_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Study slot not found",
        )

    return {
        "message": "Study slot deleted successfully"
    }