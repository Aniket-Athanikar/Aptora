"""Redis worker for the single, canonical document indexing pipeline."""

from __future__ import annotations

import logging
import time

from app.db import SessionLocal
from app.models.resource import ResourceDb
from app.processing.document_indexer import DocumentIndexer
from app.processing.redis_service import RedisService
from app.repositories.resource_repository import ResourceRepository

logger = logging.getLogger(__name__)


class ResourceWorker:
    RECOVERY_INTERVAL_SECONDS = 30

    @staticmethod
    def process_resource(db, resource) -> None:
        """Run the same indexer used by all ingestion entry points."""
        logger.info("Entering DocumentIndexer.index_document for resource %s.", resource.id)
        DocumentIndexer.index_document(db=db, resource=resource)

    @staticmethod
    def recover_pending() -> None:
        """Process durable queued work when a Redis message was lost or missed."""
        recovery_db = SessionLocal()
        try:
            pending = recovery_db.query(ResourceDb).filter(
                ResourceDb.status.in_(("UPLOADED", "QUEUED"))
            ).order_by(ResourceDb.created_at).all()
            logger.info("Recovering %d pending document(s).", len(pending))
            for resource in pending:
                try:
                    ResourceWorker.process_resource(recovery_db, resource)
                except Exception:
                    # DocumentIndexer already records the failed status; a
                    # single malformed file must not strand later uploads.
                    logger.exception("Recovery failed for resource %s.", resource.id)
        except Exception:
            logger.exception("Pending document recovery failed.")
        finally:
            recovery_db.close()

    @staticmethod
    def start() -> None:
        logger.info("ResourceWorker.start() executing.")
        logger.info("ExamForge resource worker started.")
        # Redis is a delivery mechanism, not the source of truth.  PostgreSQL
        # status is the durable work ledger, so recover it at startup and
        # periodically while polling.  A failed enqueue/dequeue can therefore
        # never leave a resource QUEUED forever.
        ResourceWorker.recover_pending()
        logger.info("Recovery complete; entering document queue polling loop.")
        next_recovery_at = time.monotonic() + ResourceWorker.RECOVERY_INTERVAL_SECONDS
        while True:
            db = SessionLocal()
            try:
                if time.monotonic() >= next_recovery_at:
                    ResourceWorker.recover_pending()
                    next_recovery_at = time.monotonic() + ResourceWorker.RECOVERY_INTERVAL_SECONDS
                job = RedisService.dequeue_document()
                if job:
                    logger.info("Worker received document job: %s", job)
                    resource = ResourceRepository.get_by_id(db=db, resource_id=job["resource_id"])
                    if resource and resource.status in ("UPLOADED", "QUEUED"):
                        logger.info("ResourceRepository.get_by_id found resource %s with status %s.", resource.id, resource.status)
                        ResourceWorker.process_resource(db, resource)
                    elif resource:
                        logger.info(
                            "Discarding stale queue job for resource %s; current status is %s.",
                            resource.id, resource.status,
                        )
                    else:
                        logger.warning("Queued resource %s no longer exists.", job["resource_id"])
            except Exception:
                logger.exception("Resource processing failed.")
            finally:
                db.close()
            time.sleep(1)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    ResourceWorker.start()
