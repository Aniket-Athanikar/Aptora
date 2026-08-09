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
from sqlalchemy.orm import relationship

from app.db.base import Base


class NotificationDb(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    type = Column(String(30), default="study", nullable=False)
    priority = Column(String(20), default="medium", nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "UserDb",
        backref="notifications",
    )
