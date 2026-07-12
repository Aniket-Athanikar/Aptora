"""
ExamForge AI — FastAPI Dependencies
Reusable dependency injectors for database sessions and service clients.
"""
from app.db.session import SessionLocal, engine
from app.db.redis import redis_client
from app.db.qdrant import qdrant_client


def get_db():
    """Yield a database session and ensure it is closed after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
