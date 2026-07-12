"""
ExamForge AI — Billing Models
Order/transaction model.
"""
import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from app.db.base import Base


class OrderDb(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_name = Column(String(50), nullable=False)
    cycle = Column(String(50), nullable=False)
    amount = Column(String(50), nullable=False)
    txn_id = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
