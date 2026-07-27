"""
ExamForge AI - Upload Service
"""

import os
import uuid
import shutil
from pathlib import Path

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.models.resource import ResourceDb
from app.processing.redis_service import RedisService
from app.repositories.resource_repository import ResourceRepository


UPLOAD_DIR = Path("app/uploads")


class UploadService:

    @staticmethod
    def upload_document(
        db: Session,
        workspace_id: int,
        subject_id: int,
        resource_type: str,
        file: UploadFile,
    ) -> ResourceDb:

        # -------------------------
        # Validate File
        # -------------------------

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
                detail="Unsupported file type.",
            )

        # -------------------------
        # Create Upload Folder
        # -------------------------

        UPLOAD_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        # -------------------------
        # Generate Unique Filename
        # -------------------------

        unique_filename = f"{uuid.uuid4()}{extension}"

        file_path = UPLOAD_DIR / unique_filename

        # -------------------------
        # Save File
        # -------------------------

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------
        # Create DB Record
        # -------------------------

        resource = ResourceDb(
            workspace_id=workspace_id,
            subject_id=subject_id,
            resource_type=resource_type,
            title=file.filename.rsplit(".", 1)[0],
            description=None,
            original_filename=file.filename,
            stored_filename=unique_filename,
            storage_path=str(file_path),
            mime_type=file.content_type,
            file_size=file_path.stat().st_size,
            total_pages=None,
            language="English",
            status="UPLOADED",
        )

        # -------------------------
        # Save Resource
        # -------------------------

        resource = ResourceRepository.create(
            db=db,
            resource=resource,
        )

        # -------------------------
        # Queue Document for Processing
        # -------------------------

        RedisService.enqueue_document(resource.id)

        return resource