"""Redis worker for the single, canonical document indexing pipeline."""

from __future__ import annotations

import logging
import threading
import time
from typing import Optional

from app.db import SessionLocal
from app.models.resource import ResourceDb
from app.processing.document_indexer import DocumentIndexer
from app.processing.redis_service import RedisService
from app.repositories.resource_repository import ResourceRepository

logger = logging.getLogger(__name__)


class ResourceWorker:
    RECOVERY_INTERVAL_SECONDS = 30
    _worker_thread: Optional[threading.Thread] = None
    _stop_event: Optional[threading.Event] = None

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
            if pending:
                logger.info("Recovering %d pending document(s).", len(pending))
            for resource in pending:
                try:
                    ResourceWorker.process_resource(recovery_db, resource)
                except Exception:
                    logger.exception("Recovery failed for resource %s.", resource.id)
        except Exception:
            logger.exception("Pending document recovery failed.")
        finally:
            recovery_db.close()

    @classmethod
    def start(cls, stop_event: Optional[threading.Event] = None) -> None:
        logger.info("ResourceWorker loop started. Polling queue 'document_processing_queue'...")
        next_recovery_at = time.monotonic() + cls.RECOVERY_INTERVAL_SECONDS

        # Run an initial background recovery so startup dequeue loop is NEVER blocked
        threading.Thread(target=cls.recover_pending, daemon=True, name="ResourceWorkerRecovery").start()

        while True:
            if stop_event and stop_event.is_set():
                logger.info("ResourceWorker received stop signal. Exiting worker loop.")
                break
            db = SessionLocal()
            try:
                if time.monotonic() >= next_recovery_at:
                    threading.Thread(target=cls.recover_pending, daemon=True, name="ResourceWorkerRecovery").start()
                    next_recovery_at = time.monotonic() + cls.RECOVERY_INTERVAL_SECONDS

                job = RedisService.dequeue_document()
                if job:
                    logger.info("Worker received document job: %s", job)
                    resource = ResourceRepository.get_by_id(db=db, resource_id=job["resource_id"])
                    if resource and resource.status in ("UPLOADED", "QUEUED"):
                        logger.info("ResourceRepository.get_by_id found resource %s with status %s. Processing now...", resource.id, resource.status)
                        cls.process_resource(db, resource)
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

    @classmethod
    def start_in_background(cls) -> None:
        """Starts the worker loop in a background daemon thread."""
        if cls._worker_thread and cls._worker_thread.is_alive():
            logger.info("ResourceWorker background thread is already running.")
            return

        cls._stop_event = threading.Event()
        cls._worker_thread = threading.Thread(
            target=cls.start,
            args=(cls._stop_event,),
            name="ResourceWorkerDaemon",
            daemon=True
        )
        cls._worker_thread.start()
        logger.info("Started ResourceWorker background daemon thread successfully.")

    @classmethod
    def stop_background(cls) -> None:
        """Signals the background worker thread to stop."""
        if cls._stop_event:
            cls._stop_event.set()
        logger.info("Signaled ResourceWorker background thread to stop.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    ResourceWorker.start()
