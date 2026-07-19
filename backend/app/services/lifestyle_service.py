from sqlalchemy.orm import Session

from app.models.lifestyle import StudyLifestyleDb
from app.services.base_service import BaseService


class StudyLifestyleService(BaseService):

    model = StudyLifestyleDb

    @classmethod
    def get_lifestyle(
        cls,
        db: Session,
        workspace_id: int,
    ):
        return cls.get_one(
            db,
            workspace_id=workspace_id,
        )

    @classmethod
    def create_lifestyle(
        cls,
        db: Session,
        workspace_id: int,
        lifestyle,
    ):
        return cls.create(
            db,
            workspace_id=workspace_id,
            preferred_device=lifestyle.preferred_device,
            learning_environment=lifestyle.learning_environment,
            internet_availability=lifestyle.internet_availability,
            consistency_commit=lifestyle.consistency_commit,
        )

    @classmethod
    def update_lifestyle(
        cls,
        db: Session,
        workspace_id: int,
        lifestyle,
    ):
        obj = cls.get_lifestyle(
            db,
            workspace_id,
        )

        if not obj:
            return None

        return cls.update(
            db,
            obj,
            preferred_device=lifestyle.preferred_device,
            learning_environment=lifestyle.learning_environment,
            internet_availability=lifestyle.internet_availability,
            consistency_commit=lifestyle.consistency_commit,
        )

    @classmethod
    def delete_lifestyle(
        cls,
        db: Session,
        workspace_id: int,
    ):
        obj = cls.get_lifestyle(
            db,
            workspace_id,
        )

        if not obj:
            return False

        return cls.delete(
            db,
            obj,
        )