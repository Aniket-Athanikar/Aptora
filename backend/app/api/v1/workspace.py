"""
ExamForge AI - Workspace Router

Provides REST API endpoints for workspace management, workspace statistics,
grouped document retrieval, recent documents, subject libraries, and search.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import UserDb
from app.schemas.resource import ResourceResponse
from app.schemas.workspace import (
    LibrarySearchResponse,
    SubjectDocumentsGroup,
    SubjectLibraryResponse,
    WorkspaceCreate,
    WorkspaceInfoResponse,
    WorkspaceResponse,
    WorkspaceStatisticsResponse,
    WorkspaceUpdate,
)
from app.services.workspace_service import WorkspaceService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/workspace",
    tags=["Workspace"],
)


# ==========================================================
# Create Current User Workspace
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
    Create a workspace for the authenticated user.
    """
    logger.info(f"User #{current_user.id} requesting workspace creation")
    workspace = WorkspaceService.get_workspace(
        db,
        user_id=current_user.id,
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
# Get Current User Workspace
# ==========================================================

@router.get(
    "",
    response_model=Optional[WorkspaceResponse],
)
def get_user_workspace(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Get current authenticated user's workspace.
    """
    workspace = WorkspaceService.get_workspace(
        db,
        user_id=current_user.id,
    )
    return workspace


# ==========================================================
# Update Current User Workspace
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
    Update current authenticated user's workspace.
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
# Delete Current User Workspace
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
    Delete current authenticated user's workspace.
    """
    deleted = WorkspaceService.delete_workspace(
        db,
        user_id=current_user.id,
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


# ==========================================================
# Get Workspace Info by ID
# ==========================================================

@router.get(
    "/{workspace_id}",
    response_model=WorkspaceInfoResponse,
)
def get_workspace_by_id(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Load all workspace-related info:
    Workspace information, Exam name, Description, Created date, Progress.
    """
    logger.info(f"Fetching workspace info for workspace #{workspace_id}")
    workspace_info = WorkspaceService.get_workspace(
        db,
        workspace_id=workspace_id,
    )

    if workspace_info is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace #{workspace_id} not found.",
        )

    return workspace_info


# ==========================================================
# Get Workspace Grouped Documents
# ==========================================================

@router.get(
    "/{workspace_id}/documents",
    response_model=List[SubjectDocumentsGroup],
)
def get_workspace_documents(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Return all uploaded resources grouped by Subject -> Books, Notes, PYQs, Syllabus.
    """
    logger.info(f"Fetching workspace documents for workspace #{workspace_id}")
    workspace_info = WorkspaceService.get_workspace(db, workspace_id=workspace_id)
    if workspace_info is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace #{workspace_id} not found.",
        )

    return WorkspaceService.get_workspace_documents(
        db,
        workspace_id=workspace_id,
    )


# ==========================================================
# Get Workspace Subjects
# ==========================================================

@router.get(
    "/{workspace_id}/subjects",
)
def get_workspace_subjects(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Return all subjects configured for a workspace.
    """
    logger.info(f"Fetching workspace subjects for workspace #{workspace_id}")
    workspace_info = WorkspaceService.get_workspace(db, workspace_id=workspace_id)
    if workspace_info is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace #{workspace_id} not found.",
        )

    return WorkspaceService.get_workspace_subjects(
        db,
        workspace_id=workspace_id,
    )



# ==========================================================
# Get Workspace Statistics
# ==========================================================

@router.get(
    "/{workspace_id}/statistics",
    response_model=WorkspaceStatisticsResponse,
)
def get_workspace_statistics(
    workspace_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Return counts for subjects, documents, books, notes, pyqs, syllabus, chunks, embeddings.
    """
    logger.info(f"Fetching statistics for workspace #{workspace_id}")
    workspace_info = WorkspaceService.get_workspace(db, workspace_id=workspace_id)
    if workspace_info is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace #{workspace_id} not found.",
        )

    return WorkspaceService.get_workspace_statistics(
        db,
        workspace_id=workspace_id,
    )


# ==========================================================
# Get Recent Documents
# ==========================================================

@router.get(
    "/{workspace_id}/recent",
    response_model=List[ResourceResponse],
)
def get_recent_documents(
    workspace_id: int,
    limit: int = Query(10, ge=1, le=100, description="Maximum number of documents to return"),
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Return last uploaded documents for workspace.
    """
    logger.info(f"Fetching recent documents for workspace #{workspace_id} (limit={limit})")
    workspace_info = WorkspaceService.get_workspace(db, workspace_id=workspace_id)
    if workspace_info is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace #{workspace_id} not found.",
        )

    return WorkspaceService.get_recent_documents(
        db,
        workspace_id=workspace_id,
        limit=limit,
    )


# ==========================================================
# Get Subject Library
# ==========================================================

@router.get(
    "/{workspace_id}/subject/{subject_id}",
    response_model=SubjectLibraryResponse,
)
def get_subject_library(
    workspace_id: int,
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Return subject library resources grouped by books, notes, pyqs, syllabus.
    """
    logger.info(
        f"Fetching subject library for subject #{subject_id} in workspace #{workspace_id}"
    )
    library_data = WorkspaceService.get_subject_library(
        db,
        workspace_id=workspace_id,
        subject_id=subject_id,
    )

    if library_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject #{subject_id} not found in workspace #{workspace_id}.",
        )

    return library_data


# ==========================================================
# Search Workspace Library
# ==========================================================

@router.get(
    "/{workspace_id}/library/search",
    response_model=LibrarySearchResponse,
)
def search_library(
    workspace_id: int,
    keyword: str = Query("", description="Keyword to search in document titles, metadata, topics, chapters"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type: book, notes, pyq, syllabus"),
    subject_id: Optional[int] = Query(None, description="Filter by subject ID"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    sort_by: str = Query("created_at_desc", description="Sort order: created_at_desc, created_at_asc, title_asc, title_desc"),
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    """
    Search document titles, metadata, topics, chapters with filtering, sorting, and pagination.
    """
    logger.info(
        f"Searching library in workspace #{workspace_id} "
        f"keyword='{keyword}' resource_type={resource_type} subject_id={subject_id}"
    )
    workspace_info = WorkspaceService.get_workspace(db, workspace_id=workspace_id)
    if workspace_info is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workspace #{workspace_id} not found.",
        )

    return WorkspaceService.search_library(
        db,
        workspace_id=workspace_id,
        keyword=keyword,
        resource_type=resource_type,
        subject_id=subject_id,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
    )