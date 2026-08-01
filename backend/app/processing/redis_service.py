"""
ExamForge AI - Redis Queue Service
"""

import json
import logging
from typing import Optional

from app.db import redis_client

logger = logging.getLogger(__name__)


DOCUMENT_QUEUE = "document_processing_queue"


class RedisService:
    """
    Handles document processing queue.
    """

    @staticmethod
    def enqueue_document(resource_id: int) -> bool:
        """
        Add document to Redis queue.
        """

        try:
            if redis_client is None:
                logger.error("Redis is unavailable; document %s was not queued.", resource_id)
                return False

            payload = {
                "resource_id": resource_id,
            }

            redis_client.rpush(
                DOCUMENT_QUEUE,
                json.dumps(payload),
            )

            logger.info(
                f"Document {resource_id} added to queue."
            )

            return True

        except Exception:
            logger.exception("Failed to enqueue document %s on queue %s.", resource_id, DOCUMENT_QUEUE)

            return False

    @staticmethod
    def dequeue_document() -> Optional[dict]:
        """
        Pop next document from queue.
        """

        try:
            if redis_client is None:
                return None

            item = redis_client.lpop(DOCUMENT_QUEUE)

            if item is None:
                logger.debug("No job available on Redis queue %s.", DOCUMENT_QUEUE)
                return None

            job = json.loads(item)
            logger.info("Dequeued document job from %s: %s", DOCUMENT_QUEUE, job)
            return job

        except Exception:
            # LPOP removes a job.  The full traceback is essential to
            # distinguish a Redis/JSON failure from an empty queue.
            logger.exception("Failed to dequeue a document job from queue %s.", DOCUMENT_QUEUE)

            return None

    @staticmethod
    def queue_size() -> int:

        try:
            return redis_client.llen(DOCUMENT_QUEUE)

        except Exception:
            return 0

    @staticmethod
    def clear_queue():

        redis_client.delete(DOCUMENT_QUEUE)
