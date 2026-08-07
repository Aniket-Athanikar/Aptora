import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    Boolean,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserDb(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    password = Column(String(255), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    # One User -> One Workspace
    workspace = relationship(
        "GoalWorkspaceDb",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class OtpDb(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(100), nullable=False)

    otp = Column(String(6), nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    is_used = Column(Boolean, default=False)


class SessionDb(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)

    refresh_token = Column(String(500), unique=True, nullable=False)

    device_info = Column(String(255), default="")

    ip_address = Column(String(50), default="")

    is_revoked = Column(Boolean, default=False)

    expires_at = Column(DateTime, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )