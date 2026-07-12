"""
ExamForge AI — Redis Client
Connection with local fallback.
"""
import logging
import redis

from app.core.config import settings

logger = logging.getLogger("backend")

REDIS_HOST = settings.REDIS_HOST
REDIS_PORT = settings.REDIS_PORT
redis_client = None

# Attempt to connect to configured REDIS_HOST first
try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, socket_connect_timeout=2, protocol=2)
    redis_client.ping()
    logger.info(f"Connected to Redis successfully at {REDIS_HOST}:{REDIS_PORT}!")
except Exception as e:
    # If it fails and we are not on localhost, retry locally
    if REDIS_HOST != "127.0.0.1":
        logger.warning(f"Could not connect to Redis at {REDIS_HOST}:{REDIS_PORT} ({e}). Retrying locally at 127.0.0.1:6379...")
        try:
            redis_client = redis.Redis(host="127.0.0.1", port=6379, decode_responses=True, socket_connect_timeout=2, protocol=2)
            redis_client.ping()
            logger.info("Connected to local Redis successfully at 127.0.0.1:6379!")
        except Exception as local_err:
            logger.warning(f"Could not connect to Redis locally: {local_err}")
            redis_client = None
    else:
        logger.warning(f"Could not connect to Redis: {e}")
        redis_client = None
