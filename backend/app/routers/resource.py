"""
ExamForge AI - Resource Router
"""

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.resource_service import ResourceService

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post("/upload")
def upload_document(
    workspace_id: int = Form(...),
    subject_id: int = Form(...),
    resource_type: str = Form(...),
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


@router.get("/{resource_id}")
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
    db: Session = Depends(get_db),
):
    return ResourceService.get_subject_resources(
        db=db,
        subject_id=subject_id,
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