"""
ExamForge AI — Redis Client
Connection with dynamic resolution and local fallback.
"""
import logging
import redis

from app.core.config import settings

logger = logging.getLogger("backend")

REDIS_HOST = settings.REDIS_HOST
REDIS_PORT = settings.REDIS_PORT
redis_client = None


def init_redis_client():
    global redis_client
    if redis_client is not None:
        try:
            redis_client.ping()
            return redis_client
        except Exception:
            redis_client = None

    # Attempt to connect to configured REDIS_HOST first
    try:
        client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, socket_connect_timeout=2, protocol=2)
        client.ping()
        redis_client = client
        logger.info(f"Connected to Redis successfully at {REDIS_HOST}:{REDIS_PORT}!")
        return redis_client
    except Exception as e:
        # If it fails and we are not on localhost, retry locally
        if REDIS_HOST != "127.0.0.1":
            try:
                client = redis.Redis(host="127.0.0.1", port=6379, decode_responses=True, socket_connect_timeout=2, protocol=2)
                client.ping()
                redis_client = client
                logger.info("Connected to local Redis successfully at 127.0.0.1:6379!")
                return redis_client
            except Exception:
                redis_client = None
        else:
            redis_client = None
    return redis_client


def get_redis_client():
    """Returns an active Redis client or attempts reconnection if disconnected."""
    return init_redis_client()


# Initial connection attempt on module import
init_redis_client()
