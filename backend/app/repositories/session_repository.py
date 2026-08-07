"""
ExamForge AI — Session Repository
Handles DB persistence for active user sessions and refresh tokens.
Never commits transactions.
"""
from typing import List, Optional
import datetime
from sqlalchemy.orm import Session
from app.models import SessionDb


class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_session(
        self,
        user_id: int,
        refresh_token: str,
        expires_at: datetime.datetime,
        device_info: str = "",
        ip_address: str = ""
    ) -> SessionDb:
        session = SessionDb(
            user_id=user_id,
            refresh_token=refresh_token,
            device_info=device_info,
            ip_address=ip_address,
            is_revoked=False,
            expires_at=expires_at,
            created_at=datetime.datetime.utcnow()
        )
        self.db.add(session)
        return session

    def get_by_token(self, refresh_token: str) -> Optional[SessionDb]:
        return (
            self.db.query(SessionDb)
            .filter(SessionDb.refresh_token == refresh_token, SessionDb.is_revoked == False)
            .first()
        )

    def get_user_sessions(self, user_id: int) -> List[SessionDb]:
        return (
            self.db.query(SessionDb)
            .filter(SessionDb.user_id == user_id, SessionDb.is_revoked == False)
            .all()
        )

    def revoke_session(self, session: SessionDb) -> SessionDb:
        session.is_revoked = True
        self.db.add(session)
        return session

    def revoke_all_user_sessions(self, user_id: int) -> int:
        count = (
            self.db.query(SessionDb)
            .filter(SessionDb.user_id == user_id, SessionDb.is_revoked == False)
            .update({"is_revoked": True}, synchronize_session=False)
        )
        return count
