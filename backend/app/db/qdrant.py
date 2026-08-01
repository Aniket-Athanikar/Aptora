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

def _try_qdrant(host: str, port: int) -> QdrantClient | None:
    try:
        c = QdrantClient(host=host, port=port, timeout=2)
        c.get_collections()
        return c
    except Exception:
        return None

# Try ports: if host is local, test 6433 first or prefer port with vectors
candidate_ports = [QDRANT_PORT]
if QDRANT_HOST in ("127.0.0.1", "localhost") and 6433 not in candidate_ports:
    candidate_ports = [6433, 6333]

for port in candidate_ports:
    client = _try_qdrant(QDRANT_HOST, port)
    if client:
        try:
            cnt = client.count("examforge_documents", exact=True).count
            if cnt > 0:
                qdrant_client = client
                logger.info(f"Connected to Qdrant Vector DB at {QDRANT_HOST}:{port} ({cnt} vectors found)!")
                break
        except Exception:
            pass
        if not qdrant_client:
            qdrant_client = client

if not qdrant_client:
    logger.warning("Could not connect to Qdrant Vector DB.")
