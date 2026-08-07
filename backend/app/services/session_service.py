"""
ExamForge AI — Session Service
Manages user HTTP cookies, active device sessions, multi-device tracking,
and session revoking.
"""
from typing import List, Optional
import datetime
import logging
from fastapi import Response, Request
from sqlalchemy.orm import Session

from app.models import SessionDb
from app.repositories.session_repository import SessionRepository
from app.core.config import settings

logger = logging.getLogger("backend")


class SessionService:
    def __init__(self, db: Session):
        self.db = db
        self.session_repo = SessionRepository(db)

    def set_auth_cookies(
        self,
        response: Response,
        email: str,
        access_token: str,
        refresh_token: str
    ) -> None:
        """Sets secure HttpOnly auth and CSRF cookies on FastAPI Response object."""
        prefix = email.split("@")[0] if "@" in email else email
        csrf_val = f"ef-csrf-{prefix}"

        response.set_cookie(
            key="csrf_token",
            value=csrf_val,
            httponly=True,
            samesite="lax",
            secure=not settings.DEBUG
        )
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=not settings.DEBUG
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            samesite="lax",
            secure=not settings.DEBUG
        )

    def clear_auth_cookies(self, response: Response) -> None:
        """Clears all authentication related cookies."""
        response.delete_cookie("csrf_token")
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

    def register_session(
        self,
        user_id: int,
        refresh_token: str,
        request: Optional[Request] = None
    ) -> SessionDb:
        """Registers a new active session record in DB."""
        user_agent = request.headers.get("user-agent", "Unknown Device") if request else ""
        ip_addr = request.client.host if request and request.client else ""
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        session = self.session_repo.create_session(
            user_id=user_id,
            refresh_token=refresh_token,
            expires_at=expires_at,
            device_info=user_agent[:250],
            ip_address=ip_addr[:45]
        )
        return session

    def revoke_token_session(self, refresh_token: str) -> bool:
        session = self.session_repo.get_by_token(refresh_token)
        if session:
            self.session_repo.revoke_session(session)
            return True
        return False

    def revoke_all_sessions_for_user(self, user_id: int) -> int:
        return self.session_repo.revoke_all_user_sessions(user_id)

    def list_active_sessions(self, user_id: int) -> List[SessionDb]:
        return self.session_repo.get_user_sessions(user_id)
