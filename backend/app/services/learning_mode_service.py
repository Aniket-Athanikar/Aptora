"""
ExamForge AI - Learning Mode Service

Handles CRUD operations for Learning Modes.
"""

from sqlalchemy.orm import Session

from app.models.learning_mode import LearningModeDb
from app.services.base_service import BaseService


class LearningModeService(BaseService):

    model = LearningModeDb

    @classmethod
    def get_learning_modes(
        cls,
        db: Session,
        workspace_id: int,
    ):
        """
        Get all learning modes for a workspace.
        """

        return cls.get_all(
            db,
            workspace_id=workspace_id,
        )

    @classmethod
    def create_learning_mode(
        cls,
        db: Session,
        workspace_id: int,
        learning_mode: str,
    ):
        """
        Create a single learning mode.
        """

        return cls.create(
            db,
            workspace_id=workspace_id,
            learning_mode=learning_mode,
        )

    @classmethod
    def replace_learning_modes(
        cls,
        db: Session,
        workspace_id: int,
        learning_modes: list[str],
    ):
        """
        Replace all learning modes for a workspace.
        """

        cls.delete_many(
            db,
            workspace_id=workspace_id,
        )

        for mode in learning_modes:
            cls.create(
                db,
                workspace_id=workspace_id,
                learning_mode=mode,
            )

        return cls.get_all(
            db,
            workspace_id=workspace_id,
        )

    @classmethod
    def delete_learning_mode(
        cls,
        db: Session,
        learning_mode_id: int,
    ):
        """
        Delete a learning mode.
        """

        mode = cls.get_by_id(
            db,
            learning_mode_id,
        )

        if not mode:
            return False

        return cls.delete(
            db,
            mode,
        )