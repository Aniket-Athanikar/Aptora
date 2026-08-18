import datetime
from sqlalchemy import Column, String, Integer, DateTime, Float, Text
from app.db.base import Base


class LlmUsageDb(Base):
    __tablename__ = "llm_usage"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(36), index=True, nullable=False)
    user_id = Column(Integer, index=True, nullable=True)
    feature = Column(String(100), index=True, nullable=False)
    provider = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False)
    input_tokens = Column(Integer, nullable=False)
    output_tokens = Column(Integer, nullable=False)
    total_tokens = Column(Integer, nullable=False)
    configured_context_budget = Column(Integer, nullable=True)
    configured_history_budget = Column(Integer, nullable=True)
    configured_output_budget = Column(Integer, nullable=True)
    actual_context_tokens = Column(Integer, nullable=True)
    actual_history_tokens = Column(Integer, nullable=True)
    latency = Column(Float, nullable=False)
    status = Column(String(50), nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
