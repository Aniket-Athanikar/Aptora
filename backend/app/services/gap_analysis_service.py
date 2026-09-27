"""
Aptora - Gap Analysis Service

Handles CRUD operations for Gap Analysis.
"""

from sqlalchemy.orm import Session

from app.models.gap_analysis import GapAnalysisDb
from app.schemas.gap_analysis import GapAnalysisCreate
from app.services.base_service import BaseService


class GapAnalysisService(BaseService):

    model = GapAnalysisDb

    @classmethod
    def get_subjects(
        cls,
        db: Session,
        workspace_id: int,
    ):
        """
        Get all subjects for a workspace.
        """

        return (
            db.query(cls.model)
            .filter(
                cls.model.workspace_id == workspace_id
            )
            .order_by(cls.model.id)
            .all()
        )

    @classmethod
    def create_subject(
        cls,
        db: Session,
        workspace_id: int,
        subject: GapAnalysisCreate,
    ):
        """
        Create a new subject.
        """

        return cls.create(
            db,
            workspace_id=workspace_id,
            subject=subject.subject,
            confidence=subject.confidence,
            difficulty=subject.difficulty,
        )

    @classmethod
    def replace_subjects(
        cls,
        db: Session,
        workspace_id: int,
        subjects: list[GapAnalysisCreate],
    ):
        """
        Replace all subjects for a workspace.
        """

        cls.delete_many(
            db,
            workspace_id=workspace_id,
        )

        for item in subjects:
            cls.create(
                db,
                workspace_id=workspace_id,
                subject=item.subject,
                confidence=item.confidence,
                difficulty=item.difficulty,
            )

        return (
            db.query(cls.model)
            .filter(
                cls.model.workspace_id == workspace_id
            )
            .order_by(cls.model.id)
            .all()
        )

    @classmethod
    def delete_subject(
        cls,
        db: Session,
        subject_id: int,
    ):
        """
        Delete a subject.
        """

        subject = cls.get_by_id(
            db,
            subject_id,
        )

        if not subject:
            return False

        return cls.delete(
            db,
            subject,
        )