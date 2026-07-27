"""
ExamForge AI - Study Lifestyle API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

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


# --------------------------------------------------------
# Create Lifestyle
# --------------------------------------------------------

@router.post(
    "/",
    response_model=StudyLifestyleResponse,
)
def create_lifestyle(
    lifestyle: StudyLifestyleCreate,
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

    existing = StudyLifestyleService.get_lifestyle(
        db,
        workspace.id,
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Lifestyle already exists",
        )

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

    lifestyle = StudyLifestyleService.get_lifestyle(
        db,
        workspace.id,
    )

    if not lifestyle:
        raise HTTPException(
            status_code=404,
            detail="Lifestyle not found",
        )

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

    updated = StudyLifestyleService.update_lifestyle(
        db,
        workspace.id,
        lifestyle,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Lifestyle not found",
        )

    return updated


# --------------------------------------------------------
# Delete Lifestyle
# --------------------------------------------------------

@router.delete("/")
def delete_lifestyle(
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

    deleted = StudyLifestyleService.delete_lifestyle(
        db,
        workspace.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Lifestyle not found",
        )

    return {
        "message": "Lifestyle deleted successfully"
    }
