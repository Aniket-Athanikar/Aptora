"""
Aptora - AI Study Source & Library API Router
=====================================================

Endpoints
---------
GET    /library/books              - Search and browse books in library with source selection status
GET    /library/books/{resource_id}- Retrieve detailed metadata for a single book
POST   /ai-study/sources           - Add/select a completed resource book to user's active AI Study scope
GET    /ai-study/sources           - List active AI Study sources for authenticated user
DELETE /ai-study/sources/{resource_id} - Remove resource from AI Study active scope (idempotent)
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import UserDb
from app.models.workspace import GoalWorkspaceDb
from app.models.workspace_subject import WorkspaceSubjectDb
from app.models.resource import ResourceDb
from app.models.ai_study_source import AiStudySourceDb
from app.core.enums import ResourceStatus
from app.schemas.ai_study_source import (
    SelectSourcePayload,
    LibraryBookItem,
    LibraryBooksResponse,
    AiStudySourceItem,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["AI Study Sources & Library"])


def _get_active_workspace(db: Session, user_id: int, workspace_id: Optional[int] = None) -> GoalWorkspaceDb:
    if workspace_id:
        workspace = db.query(GoalWorkspaceDb).filter(
            GoalWorkspaceDb.id == workspace_id,
            GoalWorkspaceDb.user_id == user_id,
        ).first()
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found for authenticated user.",
            )
        return workspace

    workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.user_id == user_id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active workspace found for user. Please set up a workspace first.",
        )
    return workspace


def _build_book_item(
    resource: ResourceDb,
    selected_resource_ids: set,
    subject_map: dict,
    exam_name: str,
) -> LibraryBookItem:
    subject_obj = subject_map.get(resource.subject_id)
    subject_name = subject_obj.name if subject_obj else "General"
    is_ready = resource.status.upper() == ResourceStatus.COMPLETED.value.upper() or resource.status.upper() == "COMPLETED"

    return LibraryBookItem(
        id=resource.id,
        title=resource.title,
        description=resource.description,
        original_filename=resource.original_filename,
        resource_type=resource.resource_type.value if hasattr(resource.resource_type, "value") else str(resource.resource_type),
        status=resource.status,
        total_pages=resource.total_pages or 0,
        chunks_count=len(resource.chunks) if resource.chunks else 0,
        file_size=resource.file_size or 0,
        workspace_id=resource.workspace_id,
        subject_id=resource.subject_id,
        subject=subject_name,
        exam=exam_name,
        ai_ready=is_ready,
        is_selected=resource.id in selected_resource_ids,
        created_at=resource.created_at,
    )


@router.get("/library/books", response_model=LibraryBooksResponse)
def browse_library_books(
    workspace_id: Optional[int] = Query(None),
    subject_id: Optional[int] = Query(None),
    exam: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    only_selected: Optional[bool] = Query(False, alias="selected"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = _get_active_workspace(db, current_user.id, workspace_id)

    # Active user sources
    active_sources = db.query(AiStudySourceDb).filter(
        AiStudySourceDb.user_id == current_user.id,
        AiStudySourceDb.workspace_id == workspace.id,
        AiStudySourceDb.is_active == True,
    ).all()
    selected_resource_ids = {s.resource_id for s in active_sources}

    # Query resources
    query = db.query(ResourceDb).filter(ResourceDb.workspace_id == workspace.id)

    if subject_id:
        query = query.filter(ResourceDb.subject_id == subject_id)

    if resource_type:
        query = query.filter(ResourceDb.resource_type == resource_type)

    if status_filter:
        query = query.filter(ResourceDb.status == status_filter.upper())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                ResourceDb.title.ilike(term),
                ResourceDb.description.ilike(term),
                ResourceDb.original_filename.ilike(term),
            )
        )

    if only_selected:
        if not selected_resource_ids:
            return LibraryBooksResponse(total=0, page=page, limit=limit, items=[])
        query = query.filter(ResourceDb.id.in_(selected_resource_ids))

    total = query.count()
    resources = query.order_by(ResourceDb.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    # Prefetch subject objects
    subjects = db.query(WorkspaceSubjectDb).filter(WorkspaceSubjectDb.workspace_id == workspace.id).all()
    subject_map = {s.id: s for s in subjects}
    exam_name = workspace.target_exam or "Competitive Exam"

    items = [
        _build_book_item(r, selected_resource_ids, subject_map, exam_name)
        for r in resources
    ]

    return LibraryBooksResponse(
        total=total,
        page=page,
        limit=limit,
        items=items,
    )


@router.get("/library/books/{resource_id}", response_model=LibraryBookItem)
def get_library_book_detail(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    resource = db.query(ResourceDb).filter(ResourceDb.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book resource not found.")

    workspace = _get_active_workspace(db, current_user.id, resource.workspace_id)

    active_source = db.query(AiStudySourceDb).filter(
        AiStudySourceDb.user_id == current_user.id,
        AiStudySourceDb.resource_id == resource.id,
        AiStudySourceDb.is_active == True,
    ).first()
    selected_ids = {resource.id} if active_source else set()

    subject_obj = db.query(WorkspaceSubjectDb).filter(WorkspaceSubjectDb.id == resource.subject_id).first()
    subject_map = {resource.subject_id: subject_obj} if subject_obj else {}

    return _build_book_item(resource, selected_ids, subject_map, workspace.target_exam or "Exam")


@router.post("/ai-study/sources", response_model=AiStudySourceItem, status_code=status.HTTP_201_CREATED)
def select_ai_study_source(
    payload: SelectSourcePayload,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    resource = db.query(ResourceDb).filter(ResourceDb.id == payload.resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource book not found.")

    workspace = _get_active_workspace(db, current_user.id, resource.workspace_id)

    # Status check: only COMPLETED books are AI-ready
    status_str = resource.status.upper()
    if status_str != ResourceStatus.COMPLETED.value.upper() and status_str != "COMPLETED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Resource '{resource.title}' is currently '{resource.status}'. Only completed resources can be selected for AI Study.",
        )

    # Idempotent select
    source = db.query(AiStudySourceDb).filter(
        AiStudySourceDb.user_id == current_user.id,
        AiStudySourceDb.resource_id == resource.id,
    ).first()

    if source:
        source.is_active = True
        db.commit()
        db.refresh(source)
    else:
        source = AiStudySourceDb(
            user_id=current_user.id,
            workspace_id=workspace.id,
            resource_id=resource.id,
            is_active=True,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

    subject_obj = db.query(WorkspaceSubjectDb).filter(WorkspaceSubjectDb.id == resource.subject_id).first()
    subject_map = {resource.subject_id: subject_obj} if subject_obj else {}
    book_item = _build_book_item(resource, {resource.id}, subject_map, workspace.target_exam or "Exam")

    return AiStudySourceItem(
        id=source.id,
        user_id=source.user_id,
        workspace_id=source.workspace_id,
        resource_id=source.resource_id,
        is_active=source.is_active,
        selected_at=source.selected_at,
        resource=book_item,
    )


@router.get("/ai-study/sources", response_model=List[AiStudySourceItem])
def get_ai_study_sources(
    workspace_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = _get_active_workspace(db, current_user.id, workspace_id)

    sources = db.query(AiStudySourceDb).options(
        joinedload(AiStudySourceDb.resource)
    ).filter(
        AiStudySourceDb.user_id == current_user.id,
        AiStudySourceDb.workspace_id == workspace.id,
        AiStudySourceDb.is_active == True,
    ).order_by(AiStudySourceDb.selected_at.desc()).all()

    subjects = db.query(WorkspaceSubjectDb).filter(WorkspaceSubjectDb.workspace_id == workspace.id).all()
    subject_map = {s.id: s for s in subjects}
    selected_ids = {s.resource_id for s in sources}

    results = []
    for s in sources:
        book_item = None
        if s.resource:
            book_item = _build_book_item(s.resource, selected_ids, subject_map, workspace.target_exam or "Exam")

        results.append(
            AiStudySourceItem(
                id=s.id,
                user_id=s.user_id,
                workspace_id=s.workspace_id,
                resource_id=s.resource_id,
                is_active=s.is_active,
                selected_at=s.selected_at,
                resource=book_item,
            )
        )

    return results


@router.delete("/ai-study/sources/{resource_id}", status_code=status.HTTP_200_OK)
def remove_ai_study_source(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    source = db.query(AiStudySourceDb).filter(
        AiStudySourceDb.user_id == current_user.id,
        AiStudySourceDb.resource_id == resource_id,
    ).first()

    if source:
        db.delete(source)
        db.commit()

    return {
        "success": True,
        "message": f"Resource #{resource_id} removed from user's AI Study sources.",
    }
