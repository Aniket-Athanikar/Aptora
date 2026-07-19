"""
ExamForge AI - Workspace Router
"""

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_db,
    get_current_user,
)

from app.models.user import UserDb

from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceResponse,
)

from app.services.workspace_service import WorkspaceService


router = APIRouter(
    prefix="/workspace",
    tags=["Workspace"],
)


# ==========================================================
# Create Workspace
# ==========================================================

@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workspace(
    payload: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Create a workspace for current user.
    """

    workspace = WorkspaceService.get_workspace(
        db,
        current_user.id,
    )

    if workspace:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workspace already exists.",
        )

    return WorkspaceService.create_workspace(
        db=db,
        user_id=current_user.id,
        workspace=payload,
    )


# ==========================================================
# Get Workspace
# ==========================================================

@router.get(
    "",
    response_model=WorkspaceResponse,
)
def get_workspace(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Get current user's workspace.
    """

    workspace = WorkspaceService.get_workspace(
        db,
        current_user.id,
    )

    if workspace is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found.",
        )

    return workspace


# ==========================================================
# Update Workspace
# ==========================================================

@router.put(
    "",
    response_model=WorkspaceResponse,
)
def update_workspace(
    payload: WorkspaceUpdate,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Update current user's workspace.
    """

    workspace = WorkspaceService.update_workspace(
        db=db,
        user_id=current_user.id,
        workspace=payload,
    )

    if workspace is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found.",
        )

    return workspace


# ==========================================================
# Delete Workspace
# ==========================================================

@router.delete(
    "",
    status_code=status.HTTP_200_OK,
)
def delete_workspace(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Delete current user's workspace.
    """

    deleted = WorkspaceService.delete_workspace(
        db,
        current_user.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found.",
        )

    return {
        "success": True,
        "message": "Workspace deleted successfully.",
    }