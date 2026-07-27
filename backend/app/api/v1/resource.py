"""
ExamForge AI - Resource API
"""

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
)
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.resource_service import ResourceService
from app.schemas.resource import ResourceResponse
from app.core.enums import ResourceType
from app.schemas.document_status import DocumentStatusResponse
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
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return ResourceService.upload_resource(
        db=db,
        workspace_id=workspace_id,
        subject_id=subject_id,
        resource_type=resource_type,
        file=file,
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