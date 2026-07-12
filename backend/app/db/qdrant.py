"""
ExamForge AI — Qdrant Vector DB Client
Connection with local fallback.
"""
import logging
from qdrant_client import QdrantClient

from app.core.config import settings

logger = logging.getLogger("backend")

QDRANT_HOST = settings.QDRANT_HOST
QDRANT_PORT = settings.QDRANT_PORT
qdrant_client = None

try:
    qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT, timeout=2)
    # Check if Qdrant is responsive
    qdrant_client.get_collections()
    logger.info(f"Connected to Qdrant Vector DB successfully at {QDRANT_HOST}:{QDRANT_PORT}!")
except Exception as e:
    # Fallback to local 127.0.0.1 (or check external port mapping 6433)
    fallback_hosts = ["127.0.0.1", "localhost"]
    connected = False
    for host in fallback_hosts:
        if QDRANT_HOST != host:
            # Try standard port 6333
            try:
                logger.info(f"Retrying Qdrant connection locally at {host}:6333...")
                qdrant_client = QdrantClient(host=host, port=6333, timeout=2)
                qdrant_client.get_collections()
                logger.info(f"Connected to local Qdrant Vector DB successfully at {host}:6333!")
                connected = True
                break
            except:
                # Try mapped port 6433
                try:
                    logger.info(f"Retrying Qdrant connection locally at {host}:6433...")
                    qdrant_client = QdrantClient(host=host, port=6433, timeout=2)
                    qdrant_client.get_collections()
                    logger.info(f"Connected to local Qdrant Vector DB successfully at {host}:6433!")
                    connected = True
                    break
                except:
                    pass
    if not connected:
        logger.warning(f"Could not connect to Qdrant Vector DB: {e}")
        qdrant_client = None
