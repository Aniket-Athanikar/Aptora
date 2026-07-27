"""
ExamForge AI - Resource Chunk Repository

Handles all database operations related to resource chunks.
"""

import logging
from typing import List

from sqlalchemy.orm import Session

from app.models.resource_chunk import ResourceChunkDb

logger = logging.getLogger(__name__)


class ResourceChunkRepository:

    @staticmethod
    def create_many(
        db: Session,
        resource_id: int,
        chunks: List[str],
    ) -> list[ResourceChunkDb]:
        """
        Store multiple chunks for a resource.
        """

        try:

            chunk_objects = []

            for index, content in enumerate(chunks):

                chunk = ResourceChunkDb(
                    resource_id=resource_id,
                    chunk_index=index,
                    content=content,
                    token_count=0,
                    page_number=None,
                    subject=None,
                    chapter=None,
                    topic=None,
                    chunk_metadata={},
                    embedding_generated=False,
                    qdrant_point_id=None,
                )

                db.add(chunk)
                chunk_objects.append(chunk)

            db.commit()

            for chunk in chunk_objects:
                db.refresh(chunk)

            logger.info(
                f"Stored {len(chunk_objects)} chunk(s) "
                f"for Resource #{resource_id}."
            )

            return chunk_objects

        except Exception as e:

            db.rollback()

            logger.exception(
                f"Failed to store chunks for Resource "
                f"#{resource_id}: {e}"
            )

            raise

    @staticmethod
    def get_by_resource_id(
        db: Session,
        resource_id: int,
    ) -> list[ResourceChunkDb]:
        """
        Retrieve all chunks belonging to a resource.
        """

        return (
            db.query(ResourceChunkDb)
            .filter(
                ResourceChunkDb.resource_id == resource_id
            )
            .order_by(
                ResourceChunkDb.chunk_index.asc()
            )
            .all()
        )

    @staticmethod
    def update_analysis(
        db: Session,
        chunk: ResourceChunkDb,
        subject: str | None,
        chapter: str | None,
        topic: str | None,
        metadata: dict,
    ) -> ResourceChunkDb:
        """
        Update AI-generated analysis for a chunk.
        """

        try:

            chunk.subject = subject
            chunk.chapter = chapter
            chunk.topic = topic
            chunk.chunk_metadata = metadata

            db.commit()
            db.refresh(chunk)

            logger.info(
                f"Updated analysis for Chunk #{chunk.id}."
            )

            return chunk

        except Exception as e:

            db.rollback()

            logger.exception(
                f"Failed to update analysis for "
                f"Chunk #{chunk.id}: {e}"
            )

            raise

    @staticmethod
    def update_embedding(
        db: Session,
        chunk: ResourceChunkDb,
        qdrant_point_id: str,
    ) -> ResourceChunkDb:
        """
        Mark a chunk as embedded and store its Qdrant point ID.
        """

        try:

            chunk.embedding_generated = True
            chunk.qdrant_point_id = qdrant_point_id

            db.commit()
            db.refresh(chunk)

            logger.info(
                f"Stored embedding for Chunk #{chunk.id}."
            )

            return chunk

        except Exception as e:

            db.rollback()

            logger.exception(
                f"Failed to update embedding for "
                f"Chunk #{chunk.id}: {e}"
            )

            raise

    @staticmethod
    def delete_by_resource_id(
        db: Session,
        resource_id: int,
    ) -> int:
        """
        Delete all chunks belonging to a resource.

        Returns:
            Number of deleted chunks.
        """

        try:

            deleted = (
                db.query(ResourceChunkDb)
                .filter(
                    ResourceChunkDb.resource_id == resource_id
                )
                .delete(
                    synchronize_session=False
                )
            )

            db.commit()

            logger.info(
                f"Deleted {deleted} chunk(s) "
                f"for Resource #{resource_id}."
            )

            return deleted

        except Exception as e:

            db.rollback()

            logger.exception(
                f"Failed to delete chunks for "
                f"Resource #{resource_id}: {e}"
            )

            raise