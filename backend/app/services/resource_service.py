"""
ExamForge AI - Resource Service
"""

import os
import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.resource import ResourceDb
from app.repositories.resource_repository import ResourceRepository
from app.core.enums import ResourceType

UPLOAD_DIR = Path("app/uploads")


class ResourceService:

    @staticmethod
    def upload_resource(
        db: Session,
        workspace_id: int,
        subject_id: int,
        resource_type: ResourceType,
        file: UploadFile,
    ) -> ResourceDb:

        # ---------------------------------
        # Validate File
        # ---------------------------------

        if file is None:
            raise HTTPException(
                status_code=400,
                detail="No file uploaded."
            )

        allowed_extensions = {
            ".pdf",
            ".doc",
            ".docx",
            ".txt",
        }

        extension = os.path.splitext(file.filename)[1].lower()

        if extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type."
            )

        # ---------------------------------
        # Create Upload Directory
        # ---------------------------------

        UPLOAD_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        # ---------------------------------
        # Generate Filename
        # ---------------------------------

        stored_filename = f"{uuid.uuid4()}{extension}"

        storage_path = UPLOAD_DIR / stored_filename

        # ---------------------------------
        # Save File
        # ---------------------------------

        with open(storage_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ---------------------------------
        # Create Database Object
        # ---------------------------------

        resource = ResourceDb(
            workspace_id=workspace_id,
            subject_id=subject_id,
            resource_type=resource_type,
            title=file.filename.rsplit(".", 1)[0],
            description=None,
            original_filename=file.filename,
            stored_filename=stored_filename,
            storage_path=str(storage_path),
            mime_type=file.content_type,
            file_size=storage_path.stat().st_size,
            total_pages=None,
            language="English",
            status="UPLOADED",
        )

        return ResourceRepository.create(
            db=db,
            resource=resource,
        )

    @staticmethod
    def get_resource(
        db: Session,
        resource_id: int,
    ) -> ResourceDb:

        resource = ResourceRepository.get_by_id(
            db=db,
            resource_id=resource_id,
        )

        if resource is None:
            raise HTTPException(
                status_code=404,
                detail="Resource not found."
            )

        return resource

    @staticmethod
    def get_workspace_resources(
        db: Session,
        workspace_id: int,
        resource_type: ResourceType | None = None,
    ):

        return ResourceRepository.get_by_workspace(
            db=db,
            workspace_id=workspace_id,
            resource_type=resource_type,
        )

    @staticmethod
    def get_subject_resources(
        db: Session,
        subject_id: int,
        resource_type: ResourceType | None = None,
    ):

        return ResourceRepository.get_by_subject(
            db=db,
            subject_id=subject_id,
            resource_type=resource_type,
        )

    @staticmethod
    def delete_resource(
        db: Session,
        resource_id: int,
    ):

        resource = ResourceRepository.get_by_id(
            db=db,
            resource_id=resource_id,
        )

        if resource is None:
            raise HTTPException(
                status_code=404,
                detail="Resource not found."
            )

        if os.path.exists(resource.storage_path):
            os.remove(resource.storage_path)

        ResourceRepository.delete(
            db=db,
            resource=resource,
        )

        return {
            "message": "Resource deleted successfully."
        }