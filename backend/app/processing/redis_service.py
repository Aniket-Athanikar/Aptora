"""
ExamForge AI - Redis Queue Service
"""

import json
import logging
from typing import Optional

from app.db.redis import get_redis_client

logger = logging.getLogger(__name__)

DOCUMENT_QUEUE = "document_processing_queue"


class RedisService:
    """
    Handles document processing queue using dynamic Redis client lookup.
    """

    @staticmethod
    def enqueue_document(resource_id: int) -> bool:
        """
        Push document resource ID onto queue.
        """
        try:
            client = get_redis_client()
            if client is None:
                logger.error("Redis client is None. Cannot enqueue document %s", resource_id)
                return False

            job = json.dumps({"resource_id": resource_id})
            client.rpush(DOCUMENT_QUEUE, job)
            logger.info("Enqueued document job for resource %s on queue '%s'", resource_id, DOCUMENT_QUEUE)
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
            client = get_redis_client()
            if client is None:
                return None

            queue_size = client.llen(DOCUMENT_QUEUE)
            if queue_size > 0:
                logger.info(
                    "Queue '%s' size before dequeue = %s",
                    DOCUMENT_QUEUE,
                    queue_size,
                )

            item = client.lpop(DOCUMENT_QUEUE)

            if item is None:
                return None

            job = json.loads(item)
            logger.info("Dequeued document job: %s from queue '%s'", job, DOCUMENT_QUEUE)
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
            client = get_redis_client()
            if client is None:
                return 0

            return client.llen(DOCUMENT_QUEUE)

        except Exception:
            logger.exception("Failed to get queue size.")
            return 0

    @staticmethod
    def clear_queue() -> None:
        """
        Clear the processing queue.
        """
        try:
            client = get_redis_client()
            if client is None:
                return

            client.delete(DOCUMENT_QUEUE)
            logger.info("Queue '%s' cleared.", DOCUMENT_QUEUE)

        except Exception:
            logger.exception("Failed to clear queue.")