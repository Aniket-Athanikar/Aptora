"""
ExamForge AI - Resource API
"""

import os
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.resource_service import ResourceService
from app.schemas.resource import ResourceResponse
from app.core.enums import ResourceType
from app.schemas.document_status import DocumentStatusResponse
from app.core.dependencies import get_current_user
from app.models.user import UserDb
from app.models.workspace import GoalWorkspaceDb
from app.models.workspace_subject import WorkspaceSubjectDb
from app.ai.services.qdrant_service import QdrantService
router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/upload",
    response_model=ResourceResponse,
)
def upload_document(
    workspace_id: int = Form(...),
    subject_id: int = Form(...),
    resource_type: ResourceType = Form(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = db.query(GoalWorkspaceDb).filter(
        GoalWorkspaceDb.id == workspace_id,
        GoalWorkspaceDb.user_id == current_user.id,
    ).first()
    if workspace is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found for the authenticated user.",
        )

    subject = db.query(WorkspaceSubjectDb).filter(
        WorkspaceSubjectDb.id == subject_id,
        WorkspaceSubjectDb.workspace_id == workspace_id,
    ).first()
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The selected subject does not belong to this workspace.",
        )

    return ResourceService.upload_resource(
        db=db,
        workspace_id=workspace_id,
        subject_id=subject_id,
        resource_type=resource_type,
        file=file,
        title=title,
        description=description,
    )

@router.patch(
    "/{resource_id}",
    response_model=ResourceResponse,
)
def rename_document(
    resource_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    return ResourceService.rename_resource(
        db=db,
        resource_id=resource_id,
        title=title,
        description=description,
    )

@router.post(
    "/{resource_id}/reprocess",
    response_model=ResourceResponse,
)
def reprocess_document(
    resource_id: int,
    db: Session = Depends(get_db),
):
    return ResourceService.reprocess_resource(
        db=db,
        resource_id=resource_id,
    )

@router.get(
    "/{resource_id}/status",
    response_model=DocumentStatusResponse,
)
def get_document_status(
    resource_id: int,
    db: Session = Depends(get_db),
):
    resource = ResourceService.get_resource(
        db=db,
        resource_id=resource_id,
    )

    return DocumentStatusResponse(
        resource_id=resource.id,
        status=resource.status,
    )

@router.get(
    "/{resource_id}",
    response_model=ResourceResponse,
)
def get_document(
    resource_id: int,
    db: Session = Depends(get_db),
):
    return ResourceService.get_resource(
        db=db,
        resource_id=resource_id,
    )


@router.get("/workspace/{workspace_id}")
def get_workspace_documents(
    workspace_id: int,
    db: Session = Depends(get_db),
):
    return ResourceService.get_workspace_resources(
        db=db,
        workspace_id=workspace_id,
    )


@router.get("/subject/{subject_id}")
def get_subject_documents(
    subject_id: int,
    resource_type: Optional[ResourceType] = None,
    db: Session = Depends(get_db),
):
    return ResourceService.get_subject_resources(
        db=db,
        subject_id=subject_id,
        resource_type=resource_type,
    )


@router.delete("/{resource_id}")
def delete_document(
    resource_id: int,
    db: Session = Depends(get_db),
):
    return ResourceService.delete_resource(
        db=db,
        resource_id=resource_id,
    )


@router.get("/{resource_id}/index-diagnostics")
def get_document_index_diagnostics(resource_id: int, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    resource = ResourceService.get_resource(db=db, resource_id=resource_id)
    workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.id == resource.workspace_id, GoalWorkspaceDb.user_id == current_user.id).first()
    if workspace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")
    details = QdrantService.diagnostics(workspace_id=resource.workspace_id, resource_id=resource.id)
    return {"resource_id": resource.id, "resource_status": resource.status, "chunk_records": len(resource.chunks), **details}


@router.get("/{resource_id}/preview")
def get_document_preview(resource_id: int, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    resource = ResourceService.get_resource(db=db, resource_id=resource_id)
    workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.id == resource.workspace_id, GoalWorkspaceDb.user_id == current_user.id).first()
    if workspace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")
    chunks = sorted(resource.chunks, key=lambda c: c.chunk_index)
    return {
        "resource_id": resource.id,
        "title": resource.title,
        "chunks": [{"index": c.chunk_index, "content": c.content} for c in chunks]
    }


@router.get("/{resource_id}/file")
def get_document_file(resource_id: int, db: Session = Depends(get_db)):
    resource = ResourceService.get_resource(db=db, resource_id=resource_id)
    if not resource or not resource.storage_path or not os.path.exists(resource.storage_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Original document file not found.")
    return FileResponse(
        path=resource.storage_path,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "inline",
            "Access-Control-Allow-Origin": "*",
        }
    )
