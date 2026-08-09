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
    db: Session = Depends(get_db),
) -> UserDb:
    """
    Get current authenticated user using JWT access token.
    """
    from app.services.jwt_service import JWTService

    token = None
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    if not token:
        token = request.cookies.get("access_token")

    user = None
    if token:
        payload = JWTService.verify_access_token(token)
        if payload:
            email = payload.get("email")
            if email:
                user = db.query(UserDb).filter(UserDb.email == email).first()

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
