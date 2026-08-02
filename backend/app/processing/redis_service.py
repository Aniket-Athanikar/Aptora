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
        Push document resource ID onto queue.
        """
        try:
            if redis_client is None:
                logger.error("Redis client is None.")
                return False

            job = json.dumps({"resource_id": resource_id})
            redis_client.rpush(DOCUMENT_QUEUE, job)
            logger.info("Enqueued document job for resource %s", resource_id)
            return True

        except Exception:
            logger.exception("Failed to enqueue document %s", resource_id)
            return False

    @staticmethod
    def dequeue_document() -> Optional[dict]:
        """
        Pop next document from queue.
        """
        try:
            if redis_client is None:
                logger.error("Redis client is None.")
                return None

            queue_size = redis_client.llen(DOCUMENT_QUEUE)
            logger.info(
                "Queue '%s' size before dequeue = %s",
                DOCUMENT_QUEUE,
                queue_size,
            )

            item = redis_client.lpop(DOCUMENT_QUEUE)

            logger.info(
                "Queue '%s' raw item = %s",
                DOCUMENT_QUEUE,
                item,
            )

            if item is None:
                logger.info("No job available in queue.")
                return None

            job = json.loads(item)

            logger.info("Dequeued document job: %s", job)

            return job

        except Exception:
            logger.exception(
                "Failed to dequeue a document job from queue %s.",
                DOCUMENT_QUEUE,
            )
            return None

    @staticmethod
    def queue_size() -> int:
        """
        Return current queue size.
        """
        try:
            if redis_client is None:
                return 0

            return redis_client.llen(DOCUMENT_QUEUE)

        except Exception:
            logger.exception("Failed to get queue size.")
            return 0

    @staticmethod
    def clear_queue() -> None:
        """
        Clear the processing queue.
        """
        try:
            if redis_client is None:
                return

            redis_client.delete(DOCUMENT_QUEUE)
            logger.info("Queue '%s' cleared.", DOCUMENT_QUEUE)

        except Exception:
            logger.exception("Failed to clear queue.")