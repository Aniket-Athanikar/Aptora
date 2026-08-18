import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON
from app.db.base import Base


class AuditEventDb(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(36), index=True, nullable=False)
    user_id = Column(Integer, index=True, nullable=True)
    event_type = Column(String(100), index=True, nullable=False)
    feature = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    status = Column(String(50), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
