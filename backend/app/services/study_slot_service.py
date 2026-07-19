"""
ExamForge AI - Study Time Slot Service

Handles CRUD operations for Study Time Slots.
"""

from sqlalchemy.orm import Session

from app.models.study_slot import StudyTimeSlotDb
from app.services.base_service import BaseService


class StudyTimeSlotService(BaseService):

    model = StudyTimeSlotDb

    @classmethod
    def get_slots(
        cls,
        db: Session,
        lifestyle_id: int,
    ):
        """
        Get all study slots for a lifestyle.
        """
        return cls.get_all(
            db,
            lifestyle_id=lifestyle_id,
        )

    @classmethod
    def create_slot(
        cls,
        db: Session,
        lifestyle_id: int,
        time_slot: str,
    ):
        """
        Create a single study slot.
        """
        return cls.create(
            db,
            lifestyle_id=lifestyle_id,
            time_slot=time_slot,
        )

    @classmethod
    def replace_slots(
        cls,
        db: Session,
        lifestyle_id: int,
        slots: list[str],
    ):
        """
        Replace all study slots for a lifestyle.
        """

        cls.delete_many(
            db,
            lifestyle_id=lifestyle_id,
        )

        for slot in slots:
            cls.create(
                db,
                lifestyle_id=lifestyle_id,
                time_slot=slot,
            )

        return cls.get_all(
            db,
            lifestyle_id=lifestyle_id,
        )

    @classmethod
    def delete_slot(
        cls,
        db: Session,
        slot_id: int,
    ):
        """
        Delete a study slot.
        """

        slot = cls.get_by_id(
            db,
            slot_id,
        )

        if not slot:
            return False

        return cls.delete(
            db,
            slot,
        )