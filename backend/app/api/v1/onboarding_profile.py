"""
ExamForge AI - Onboarding Profile API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.services.workspace_service import WorkspaceService
from app.services.onboarding_profile_service import OnboardingProfileService

from app.schemas.onboarding_profile import (
    OnboardingProfileCreate,
    OnboardingProfileUpdate,
    OnboardingProfileResponse,
)

router = APIRouter(
    prefix="/profile",
    tags=["Onboarding Profile"],
)


# --------------------------------------------------------
# Create Profile
# --------------------------------------------------------

@router.post(
    "/",
    response_model=OnboardingProfileResponse,
)
def create_profile(
    profile: OnboardingProfileCreate,
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
            detail="Workspace not found"
        )

    existing = OnboardingProfileService.get_profile(
        db,
        workspace.id,
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    return OnboardingProfileService.create_profile(
        db,
        workspace.id,
        profile,
    )


# --------------------------------------------------------
# Get Profile
# --------------------------------------------------------

@router.get(
    "/",
    response_model=OnboardingProfileResponse,
)
def get_profile(
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
            detail="Workspace not found"
        )

    profile = OnboardingProfileService.get_profile(
        db,
        workspace.id,
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile


# --------------------------------------------------------
# Update Profile
# --------------------------------------------------------

@router.put(
    "/",
    response_model=OnboardingProfileResponse,
)
def update_profile(
    profile: OnboardingProfileUpdate,
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
            detail="Workspace not found"
        )

    updated = OnboardingProfileService.update_profile(
        db,
        workspace.id,
        profile,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return updated


# --------------------------------------------------------
# Delete Profile
# --------------------------------------------------------

@router.delete("/")
def delete_profile(
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
            detail="Workspace not found"
        )

    deleted = OnboardingProfileService.delete_profile(
        db,
        workspace.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return {
        "message": "Profile deleted successfully"
    }