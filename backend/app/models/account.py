import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)

from app.db.base import Base


class AccountDeletionRequestDb(Base):
    __tablename__ = "account_deletion_requests"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    email = Column(
        String(100),
        nullable=False,
    )

    reason = Column(
        Text,
        default="",
    )

    otp = Column(
        String(6),
        nullable=False,
    )

    otp_verified = Column(
        Boolean,
        default=False,
    )

    status = Column(
        String(20),
        default="pending",
    )

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )