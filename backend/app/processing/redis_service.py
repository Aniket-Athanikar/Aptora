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

        except Exception as e:

            logger.error(e)

            return False

    @staticmethod
    def dequeue_document() -> Optional[dict]:
        """
        Pop next document from queue.
        """

        try:

            item = redis_client.lpop(DOCUMENT_QUEUE)

            if item is None:
                return None

            return json.loads(item)

        except Exception as e:

            logger.error(e)

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