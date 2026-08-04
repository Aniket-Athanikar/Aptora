"""
ExamForge AI - Onboarding Profile API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.workspace import GoalWorkspaceDb
from app.models.user import UserDb
from app.models.onboarding_profile import UserOnboardingProfileDb
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


# --------------------------------------------------------
# Create / Upsert Profile
# --------------------------------------------------------

@router.post(
    "/",
    response_model=OnboardingProfileResponse,
)
def create_profile(
    profile: OnboardingProfileCreate,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    existing = OnboardingProfileService.get_profile(db, workspace.id)

    if existing:
        updated = OnboardingProfileService.update_profile(db, workspace.id, profile)
        return updated or existing

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
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    profile = OnboardingProfileService.get_profile(db, workspace.id)

    if not profile:
        profile = UserOnboardingProfileDb(
            workspace_id=workspace.id,
            full_name="Student",
            age=20,
            education="Graduate",
            stream="General",
            city="City",
            occupation="Student",
            syllabus_percent=0.0,
            current_confidence=50.0,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

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
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    updated = OnboardingProfileService.update_profile(
        db,
        workspace.id,
        profile,
    )

    if not updated:
        profile_obj = UserOnboardingProfileDb(
            workspace_id=workspace.id,
            full_name=profile.full_name or "Student",
            age=profile.age or 20,
            education=profile.education or "Graduate",
            stream=profile.stream or "General",
            city=profile.city or "City",
            occupation=profile.occupation or "Student",
            syllabus_percent=profile.syllabus_percent or 0.0,
            current_confidence=profile.current_confidence or 50.0,
        )
        db.add(profile_obj)
        db.commit()
        db.refresh(profile_obj)
        return profile_obj

    return updated


# --------------------------------------------------------
# Delete Profile
# --------------------------------------------------------

@router.delete("/")
def delete_profile(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = get_active_workspace(db, current_user.id)
    deleted = OnboardingProfileService.delete_profile(
        db,
        workspace.id,
    )

    return {
        "success": True,
        "message": "Profile deleted successfully"
    }

