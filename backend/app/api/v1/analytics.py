"""
Aptora — Analytics API Router
===================================
Endpoints to retrieve token usage, latency, and audit analytics.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db
from app.models.user import UserDb
from app.models.llm_usage import LlmUsageDb

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/request/{request_id}")
def get_request_analytics(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user)
):
    usage = db.query(LlmUsageDb).filter(LlmUsageDb.request_id == request_id).first()
    if not usage:
        raise HTTPException(status_code=404, detail="Request analytics not found")
    return {
        "request_id": usage.request_id,
        "model": usage.model,
        "input_tokens": usage.input_tokens,
        "output_tokens": usage.output_tokens,
        "total_tokens": usage.total_tokens,
        "latency": usage.latency,
        "status": usage.status,
        "configured_context_budget": usage.configured_context_budget,
        "configured_history_budget": usage.configured_history_budget,
        "configured_output_budget": usage.configured_output_budget,
        "actual_context_tokens": usage.actual_context_tokens,
        "actual_history_tokens": usage.actual_history_tokens,
    }
