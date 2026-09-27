"""
Aptora — Newsletter Model
"""
import datetime
from sqlalchemy import Column, String, Integer, DateTime
from app.db.base import Base


class NewsletterDb(Base):
    __tablename__ = "newsletter_subscribers"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
