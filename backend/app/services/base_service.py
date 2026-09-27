"""
Aptora - Base Service

Provides reusable CRUD operations for all services.
"""

from typing import Type

from sqlalchemy.orm import Session


class BaseService:

    model: Type = None

    @classmethod
    def get_by_id(
        cls,
        db: Session,
        record_id: int,
    ):
        return (
            db.query(cls.model)
            .filter(cls.model.id == record_id)
            .first()
        )

    @classmethod
    def get_one(
        cls,
        db: Session,
        **filters,
    ):
        return (
            db.query(cls.model)
            .filter_by(**filters)
            .first()
        )

    @classmethod
    def get_all(
        cls,
        db: Session,
        **filters,
    ):
        return (
            db.query(cls.model)
            .filter_by(**filters)
            .all()
        )

    @classmethod
    def create(
        cls,
        db: Session,
        **kwargs,
    ):
        obj = cls.model(**kwargs)

        db.add(obj)
        db.commit()
        db.refresh(obj)

        return obj

    @classmethod
    def update(
        cls,
        db: Session,
        obj,
        **kwargs,
    ):
        for key, value in kwargs.items():
            setattr(obj, key, value)

        db.commit()
        db.refresh(obj)

        return obj

    @classmethod
    def delete(
        cls,
        db: Session,
        obj,
    ):
        db.delete(obj)
        db.commit()

        return True

    @classmethod
    def delete_many(
        cls,
        db: Session,
        **filters,
    ):
        (
            db.query(cls.model)
            .filter_by(**filters)
            .delete()
        )

        db.commit()