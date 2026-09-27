"""
Aptora — Contact Model
"""
import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.db.base import Base


class ContactDb(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
