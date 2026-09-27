"""
Aptora — Request Context
==============================
Context variables to track request-scoped metadata like request_id and user_id.
"""

from __future__ import annotations
from contextvars import ContextVar
from typing import Any

# Default request context keys:
# - request_id: str
# - user_id: int | None
# - feature: str
# - configured_context_budget: int | None
# - configured_history_budget: int | None
# - configured_output_budget: int | None
# - actual_context_tokens: int | None
# - actual_history_tokens: int | None
ai_request_context: ContextVar[dict[str, Any]] = ContextVar("ai_request_context", default={})
