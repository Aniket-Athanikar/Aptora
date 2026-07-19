from sqlalchemy.orm import Session

from app.models.onboarding_profile import UserOnboardingProfileDb
from app.services.base_service import BaseService


class OnboardingProfileService(BaseService):

    model = UserOnboardingProfileDb

    @classmethod
    def get_profile(cls, db: Session, workspace_id: int):
        return cls.get_one(
            db,
            workspace_id=workspace_id,
        )

    @classmethod
    def create_profile(
        cls,
        db: Session,
        workspace_id: int,
        profile,
    ):
        return cls.create(
            db,
            workspace_id=workspace_id,
            avatar=profile.avatar,
            full_name=profile.full_name,
            age=profile.age,
            education=profile.education,
            stream=profile.stream,
            city=profile.city,
            occupation=profile.occupation,
            syllabus_percent=profile.syllabus_percent,
            current_confidence=profile.current_confidence,
        )

    @classmethod
    def update_profile(
        cls,
        db: Session,
        workspace_id: int,
        profile,
    ):
        obj = cls.get_profile(
            db,
            workspace_id,
        )

        if not obj:
            return None

        return cls.update(
            db,
            obj,
            avatar=profile.avatar,
            full_name=profile.full_name,
            age=profile.age,
            education=profile.education,
            stream=profile.stream,
            city=profile.city,
            occupation=profile.occupation,
            syllabus_percent=profile.syllabus_percent,
            current_confidence=profile.current_confidence,
        )

    @classmethod
    def delete_profile(
        cls,
        db: Session,
        workspace_id: int,
    ):
        obj = cls.get_profile(
            db,
            workspace_id,
        )

        if not obj:
            return False

        return cls.delete(
            db,
            obj,
        )