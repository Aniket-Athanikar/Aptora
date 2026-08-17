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
from app.processing.redis_service import RedisService

UPLOAD_DIR = Path("app/uploads")


class ResourceService:

    @staticmethod
    def upload_resource(
        db: Session,
        workspace_id: int,
        subject_id: int,
        resource_type: ResourceType,
        file: UploadFile,
        title: str | None = None,
        description: str | None = None,
    ) -> ResourceDb:
        
        print(resource_type)
        print(type(resource_type))

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

        resource_title = title.strip() if title and title.strip() else file.filename.rsplit(".", 1)[0]

        # ---------------------------------
        # Create Database Object
        # ---------------------------------

        resource = ResourceDb(
            workspace_id=workspace_id,
            subject_id=subject_id,
            resource_type=resource_type,
            title=resource_title,
            description=description,
            original_filename=file.filename,
            stored_filename=stored_filename,
            storage_path=str(storage_path),
            mime_type=file.content_type or "application/octet-stream",
            file_size=storage_path.stat().st_size,
            total_pages=None,
            language="English",
            status="UPLOADED",
        )

        created_resource = ResourceRepository.create(
            db=db,
            resource=resource,
        )

        # ---------------------------------
        # Queue Document for Background Processing
        # ---------------------------------
        if not RedisService.enqueue_document(created_resource.id):
            # A visible failed status is safer than a resource that appears
            # uploaded but can never become searchable.
            created_resource.status = "FAILED"
            db.commit()
            raise HTTPException(status_code=503, detail="Document was saved but could not be queued for indexing. Please retry reprocessing.")
        created_resource.status = "QUEUED"
        db.commit()
        db.refresh(created_resource)

        return created_resource

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
    def rename_resource(
        db: Session,
        resource_id: int,
        title: str,
        description: str | None = None,
    ) -> ResourceDb:

        resource = ResourceRepository.get_by_id(db=db, resource_id=resource_id)
        if resource is None:
            raise HTTPException(
                status_code=404,
                detail="Resource not found."
            )

        resource.title = title
        if description is not None:
            resource.description = description

        return ResourceRepository.update(db=db, resource=resource)

    @staticmethod
    def reprocess_resource(
        db: Session,
        resource_id: int,
    ) -> ResourceDb:

        resource = ResourceRepository.get_by_id(db=db, resource_id=resource_id)
        if resource is None:
            raise HTTPException(
                status_code=404,
                detail="Resource not found."
            )

        resource.status = "UPLOADED"
        updated_resource = ResourceRepository.update(db=db, resource=resource)

        if not RedisService.enqueue_document(updated_resource.id):
            updated_resource.status = "FAILED"
            db.commit()
            raise HTTPException(status_code=503, detail="Document could not be queued for reprocessing.")
        updated_resource.status = "QUEUED"
        db.commit()
        db.refresh(updated_resource)

        return updated_resource

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
            try:
                os.remove(resource.storage_path)
            except Exception as e:
                print(f"Failed to delete file: {e}")

        # Clean vector database
        try:
            from app.ai.services.qdrant_service import QdrantService
            QdrantService.delete_resource(resource_id=resource.id)
        except Exception as e:
            print(f"Failed to delete resource vectors from Qdrant: {e}")

        ResourceRepository.delete(
            db=db,
            resource=resource,
        )

        return {
            "message": "Resource deleted successfully."
        }
