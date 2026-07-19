from sqlalchemy.orm import Session

from app.models.workspace import GoalWorkspaceDb
from app.services.base_service import BaseService


class WorkspaceService(BaseService):

    model = GoalWorkspaceDb

    @classmethod
    def get_workspace(
        cls,
        db: Session,
        user_id: int,
    ):
        return cls.get_one(
            db,
            user_id=user_id,
        )

    @classmethod
    def create_workspace(
        cls,
        db: Session,
        user_id: int,
        workspace,
    ):
        return cls.create(
            db,
            user_id=user_id,
            target_exam=workspace.target_exam,
            exam_category=workspace.exam_category,
        )

    @classmethod
    def update_workspace(
        cls,
        db: Session,
        user_id: int,
        workspace,
    ):
        obj = cls.get_workspace(
            db,
            user_id,
        )

        if not obj:
            return None

        return cls.update(
            db,
            obj,
            target_exam=workspace.target_exam,
            exam_category=workspace.exam_category,
        )

    @classmethod
    def delete_workspace(
        cls,
        db: Session,
        user_id: int,
    ):
        obj = cls.get_workspace(
            db,
            user_id,
        )

        if not obj:
            return False

        return cls.delete(
            db,
            obj,
        )