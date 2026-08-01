"""
ExamForge AI - Study Lifestyle API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.workspace import GoalWorkspaceDb
from app.models.user import UserDb
from app.models.lifestyle import StudyLifestyleDb
from app.services.workspace_service import WorkspaceService
from app.services.lifestyle_service import StudyLifestyleService

from app.schemas.lifestyle import (
    StudyLifestyleCreate,
    StudyLifestyleUpdate,
    StudyLifestyleResponse,
)

router = APIRouter(
    prefix="/lifestyle",
    tags=["Study Lifestyle"],
)


def get_active_workspace(db: Session) -> GoalWorkspaceDb:
    workspace = WorkspaceService.get_workspace(db, user_id=1)
    if not workspace or isinstance(workspace, dict):
        workspace = db.query(GoalWorkspaceDb).first()
    if not workspace:
        user = db.query(UserDb).first()
        user_id = user.id if user else 1
        workspace = GoalWorkspaceDb(user_id=user_id, target_exam="UPSC CSE", exam_category="Civil Services")
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
    return workspace


# --------------------------------------------------------
# Create / Upsert Lifestyle
# --------------------------------------------------------

@router.post(
    "/",
    response_model=StudyLifestyleResponse,
)
def create_lifestyle(
    lifestyle: StudyLifestyleCreate,
    db: Session = Depends(get_db),
):
    workspace = get_active_workspace(db)
    existing = StudyLifestyleService.get_lifestyle(db, workspace.id)

    if existing:
        updated = StudyLifestyleService.update_lifestyle(db, workspace.id, lifestyle)
        return updated or existing

    return StudyLifestyleService.create_lifestyle(
        db,
        workspace.id,
        lifestyle,
    )


# --------------------------------------------------------
# Get Lifestyle
# --------------------------------------------------------

@router.get(
    "/",
    response_model=StudyLifestyleResponse,
)
def get_lifestyle(
    db: Session = Depends(get_db),
):
    workspace = get_active_workspace(db)
    lifestyle = StudyLifestyleService.get_lifestyle(db, workspace.id)

    if not lifestyle:
        lifestyle = StudyLifestyleDb(
            workspace_id=workspace.id,
            preferred_device="Laptop",
            learning_environment="Home",
            internet_availability="High Speed",
            consistency_commit="High",
        )
        db.add(lifestyle)
        db.commit()
        db.refresh(lifestyle)

    return lifestyle


# --------------------------------------------------------
# Update Lifestyle
# --------------------------------------------------------

@router.put(
    "/",
    response_model=StudyLifestyleResponse,
)
def update_lifestyle(
    lifestyle: StudyLifestyleUpdate,
    db: Session = Depends(get_db),
):
    workspace = get_active_workspace(db)
    updated = StudyLifestyleService.update_lifestyle(
        db,
        workspace.id,
        lifestyle,
    )

    if not updated:
        lifestyle_obj = StudyLifestyleDb(
            workspace_id=workspace.id,
            preferred_device=lifestyle.preferred_device or "Laptop",
            learning_environment=lifestyle.learning_environment or "Home",
            internet_availability=lifestyle.internet_availability or "High Speed",
            consistency_commit=lifestyle.consistency_commit or "High",
        )
        db.add(lifestyle_obj)
        db.commit()
        db.refresh(lifestyle_obj)
        return lifestyle_obj

    return updated


# --------------------------------------------------------
# Delete Lifestyle
# --------------------------------------------------------

@router.delete("/")
def delete_lifestyle(
    db: Session = Depends(get_db),
):
    workspace = get_active_workspace(db)
    deleted = StudyLifestyleService.delete_lifestyle(
        db,
        workspace.id,
    )

    return {
        "success": True,
        "message": "Lifestyle deleted successfully"
    }

