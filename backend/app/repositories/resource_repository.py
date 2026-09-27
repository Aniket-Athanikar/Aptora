"""
Aptora - Resource Repository
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.resource import ResourceDb
from app.core.enums import ResourceType, ResourceStatus

class ResourceRepository:

    @staticmethod
    def create(
        db: Session,
        resource: ResourceDb,
    ) -> ResourceDb:
        db.add(resource)
        db.commit()
        db.refresh(resource)
        return resource

    @staticmethod
    def get_by_id(
        db: Session,
        resource_id: int,
    ) -> Optional[ResourceDb]:
        return (
            db.query(ResourceDb)
            .filter(ResourceDb.id == resource_id)
            .first()
        )

    @staticmethod
    def get_all(
        db: Session,
    ) -> List[ResourceDb]:
        return (
            db.query(ResourceDb)
            .order_by(ResourceDb.created_at.desc())
            .all()
        )

    @staticmethod
    def get_by_workspace(
        db: Session,
        workspace_id: int,
        resource_type: Optional[ResourceType] = None,
    ) -> List[ResourceDb]:

        query = (
            db.query(ResourceDb)
            .filter(
                ResourceDb.workspace_id == workspace_id
            )
        )

        if resource_type:
            query = query.filter(
                ResourceDb.resource_type == resource_type.value
            )

        return (
            query
            .order_by(ResourceDb.created_at.desc())
            .all()
        )

    @staticmethod
    def get_by_subject(
        db: Session,
        subject_id: int,
        resource_type: Optional[ResourceType] = None,
    ) -> List[ResourceDb]:

        query = (
            db.query(ResourceDb)
            .filter(
                ResourceDb.subject_id == subject_id
            )
        )

        if resource_type:
            query = query.filter(
                ResourceDb.resource_type == resource_type
            )

        return (
            query
            .order_by(ResourceDb.created_at.desc())
            .all()
        )

    @staticmethod
    def get_ready_resources(
        db: Session,
        subject_id: int,
    ):

        return (
            db.query(ResourceDb)
            .filter(
                ResourceDb.subject_id == subject_id,
                ResourceDb.status == "READY"
            )
            .all()
        )

    @staticmethod
    def update(
        db: Session,
        resource: ResourceDb,
    ) -> ResourceDb:
        db.commit()
        db.refresh(resource)
        return resource

    @staticmethod
    def update_status(
        db: Session,
        resource: ResourceDb,
        status: str,
    ) -> ResourceDb:

        resource.status = status

        db.commit()
        db.refresh(resource)

        return resource

    @staticmethod
    def delete(
        db: Session,
        resource: ResourceDb,
    ) -> None:
        db.delete(resource)
        db.commit()

    @staticmethod
    def update_status(
        db: Session,
        resource_id: int,
        status: ResourceStatus,
    ):
        resource = (
            db.query(ResourceDb)
            .filter(ResourceDb.id == resource_id)
            .first()
        )

        if not resource:
            return None

        resource.status = status.value

        db.commit()
        db.refresh(resource)

        return resource