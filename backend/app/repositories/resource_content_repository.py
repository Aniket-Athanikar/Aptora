"""
Aptora - Resource Content Repository
"""

from sqlalchemy.orm import Session

from app.models.resource_content import ResourceContentDb


class ResourceContentRepository:

    @staticmethod
    def create(
        db: Session,
        resource_id: int,
        raw_text: str,
        cleaned_text: str,
    ) -> ResourceContentDb:

        content = ResourceContentDb(
            resource_id=resource_id,
            raw_text=raw_text,
            cleaned_text=cleaned_text,
        )

        db.add(content)
        db.commit()
        db.refresh(content)

        return content

    @staticmethod
    def get_by_resource_id(
        db: Session,
        resource_id: int,
    ) -> ResourceContentDb | None:

        return (
            db.query(ResourceContentDb)
            .filter(
                ResourceContentDb.resource_id == resource_id
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        content: ResourceContentDb,
        raw_text: str,
        cleaned_text: str,
    ) -> ResourceContentDb:

        content.raw_text = raw_text
        content.cleaned_text = cleaned_text

        db.commit()
        db.refresh(content)

        return content