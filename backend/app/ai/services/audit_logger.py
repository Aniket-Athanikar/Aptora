"""
ExamForge AI — Audit Logger
===========================
Writes structured audit events to the database.
"""

from __future__ import annotations
import logging
from app.database import SessionLocal
from app.models.audit_event import AuditEventDb

logger = logging.getLogger(__name__)


class AuditLogger:
    @classmethod
    def log_event(
        cls,
        request_id: str,
        user_id: int | None,
        event_type: str,
        feature: str | None = None,
        model: str | None = None,
        status: str | None = None,
        metadata: dict | None = None,
    ) -> None:
        db = SessionLocal()
        try:
            event_rec = AuditEventDb(
                request_id=request_id,
                user_id=user_id,
                event_type=event_type,
                feature=feature,
                model=model,
                status=status,
                metadata_json=metadata or {},
            )
            db.add(event_rec)
            db.commit()
            logger.info("[AuditLogger] Logged event %s for request_id: %s", event_type, request_id)
        except Exception as e:
            db.rollback()
            logger.error("[AuditLogger] Failed to write audit event: %s", e)
        finally:
            db.close()
