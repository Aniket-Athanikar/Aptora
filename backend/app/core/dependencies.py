"""
ExamForge AI - FastAPI Dependencies

Reusable dependency injectors for:
- Database Session
- Current Authenticated User
- Redis
- Qdrant
"""

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.redis import redis_client
from app.db.qdrant import qdrant_client
from app.models.user import UserDb

# ==========================================================
# OAuth2 Scheme
# ==========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    auto_error=False,
)


# ==========================================================
# Database Dependency
# ==========================================================

def get_db():
    """
    Yield a database session and ensure it is closed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================================
# Current User Dependency
# ==========================================================

def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> UserDb:
    """
    Temporary authentication.

    TODO:
    Replace this with JWT token verification.
    """

    # Until JWT verification is introduced, the verified-login HTTP-only cookie
    # is the session identity used by the frontend API client.
    email = request.cookies.get("ef_user_email")
    user = db.query(UserDb).filter(UserDb.email == email).first() if email else None

    # Preserve the development bearer-token path used by the existing API.
    if user is None and token:
        user = db.query(UserDb).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated.",
        )

    return user


# ==========================================================
# External Clients
# ==========================================================

def get_redis():
    return redis_client


def get_qdrant():
    return qdrant_client
