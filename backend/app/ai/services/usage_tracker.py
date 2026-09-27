"""
Aptora — Usage Tracker
============================
Saves LLM token usage and latency metrics to the database.
"""

from __future__ import annotations
import logging
from app.database import SessionLocal
from app.models.llm_usage import LlmUsageDb

logger = logging.getLogger(__name__)


class UsageTracker:
    @classmethod
    def track_usage(
        cls,
        request_id: str,
        user_id: int | None,
        feature: str,
        provider: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        total_tokens: int,
        latency: float,
        status: str,
        configured_context_budget: int | None = None,
        configured_history_budget: int | None = None,
        configured_output_budget: int | None = None,
        actual_context_tokens: int | None = None,
        actual_history_tokens: int | None = None,
        error_message: str | None = None,
    ) -> None:
        db = SessionLocal()
        try:
            usage_rec = LlmUsageDb(
                request_id=request_id,
                user_id=user_id,
                feature=feature,
                provider=provider,
                model=model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
                latency=latency,
                status=status,
                configured_context_budget=configured_context_budget,
                configured_history_budget=configured_history_budget,
                configured_output_budget=configured_output_budget,
                actual_context_tokens=actual_context_tokens,
                actual_history_tokens=actual_history_tokens,
                error_message=error_message,
            )
            db.add(usage_rec)
            db.commit()
            logger.info("[UsageTracker] Saved LLM usage for request_id: %s", request_id)
        except Exception as e:
            db.rollback()
            logger.error("[UsageTracker] Failed to save LLM usage: %s", e)
        finally:
            db.close()
