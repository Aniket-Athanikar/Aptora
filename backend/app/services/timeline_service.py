from sqlalchemy.orm import Session

from app.models.timeline import GoalTimelineDb
from app.services.base_service import BaseService


class TimelineService(BaseService):

    model = GoalTimelineDb

    @classmethod
    def get_timeline(
        cls,
        db: Session,
        workspace_id: int,
    ):
        return cls.get_one(
            db,
            workspace_id=workspace_id,
        )

    @classmethod
    def create_timeline(
        cls,
        db: Session,
        workspace_id: int,
        timeline,
    ):
        return cls.create(
            db,
            workspace_id=workspace_id,
            exam_date=timeline.exam_date,
            daily_study_hours=timeline.daily_study_hours,
        )

    @classmethod
    def update_timeline(
        cls,
        db: Session,
        workspace_id: int,
        timeline,
    ):
        obj = cls.get_timeline(
            db,
            workspace_id,
        )

        if not obj:
            return None

        return cls.update(
            db,
            obj,
            exam_date=timeline.exam_date,
            daily_study_hours=timeline.daily_study_hours,
        )

    @classmethod
    def delete_timeline(
        cls,
        db: Session,
        workspace_id: int,
    ):
        obj = cls.get_timeline(
            db,
            workspace_id,
        )

        if not obj:
            return False

        return cls.delete(
            db,
            obj,
        )