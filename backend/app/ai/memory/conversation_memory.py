"""
ExamForge AI — Conversation Memory
====================================

Provides per-session chat history persistence using Redis.
Enables multi-turn, context-aware conversations within a
workspace study session.

Design
------
- Key format  : ``examforge:memory:{session_id}``
- Storage     : Redis list (LPUSH / LRANGE)
- TTL         : 1 hour of inactivity (reset on each access)
- Fallback    : In-process dict cache when Redis is unavailable

Message format stored per entry (JSON)
---------------------------------------
    {
        "role":    "user" | "assistant",
        "content": "<text>"
    }
"""

from __future__ import annotations

import json
import logging
from typing import Any, Final

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_KEY_PREFIX: Final[str] = "examforge:memory:"
_DEFAULT_TTL_SECONDS: Final[int] = 3600          # 1 hour
_MAX_HISTORY_TURNS: Final[int] = 20              # keep last 20 messages (10 Q+A pairs)

# In-process fallback used when Redis is unreachable.
_FALLBACK_STORE: dict[str, list[dict[str, str]]] = {}


# ---------------------------------------------------------------------------
# Helper — Redis client
# ---------------------------------------------------------------------------

def _get_redis():
    """
    Return the shared Redis client, or None if unavailable.
    """
    try:
        from app.db import redis_client
        if redis_client is not None:
            redis_client.ping()          # validate connection
            return redis_client
    except Exception as exc:
        logger.debug("[ConversationMemory] Redis unavailable: %s", exc)
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


class ConversationMemory:
    """
    Manages multi-turn conversation history for a study session.

    All methods are classmethod so no instantiation is required.

    Redis key format
    ----------------
    ``examforge:memory:<session_id>``

    Each key is a Redis list where each element is a JSON-encoded
    ``{"role": ..., "content": ...}`` dict. The list is capped to
    ``_MAX_HISTORY_TURNS`` entries and has a rolling TTL.
    """

    # -----------------------------------------------------------------------
    # Add a message
    # -----------------------------------------------------------------------

    @classmethod
    def add_message(
        cls,
        session_id: str,
        role: str,
        content: str,
    ) -> None:
        """
        Append a message to the session history.

        Parameters
        ----------
        session_id:
            Unique session identifier (UUID string recommended).
        role:
            ``"user"`` or ``"assistant"``.
        content:
            Message text.
        """
        if role not in ("user", "assistant"):
            raise ValueError(f"[ConversationMemory] Invalid role: '{role}'")

        message = json.dumps({"role": role, "content": content})
        redis = _get_redis()

        if redis:
            key = _KEY_PREFIX + session_id
            try:
                pipe = redis.pipeline()
                pipe.rpush(key, message)
                # Trim to max history length
                pipe.ltrim(key, -_MAX_HISTORY_TURNS, -1)
                # Reset TTL on every write
                pipe.expire(key, _DEFAULT_TTL_SECONDS)
                pipe.execute()
                logger.debug(
                    "[ConversationMemory] Stored message for session '%s'.", session_id
                )
                return
            except Exception as exc:
                logger.warning(
                    "[ConversationMemory] Redis write failed, using fallback: %s", exc
                )

        # Fallback: in-process dict
        history = _FALLBACK_STORE.setdefault(session_id, [])
        history.append({"role": role, "content": content})
        if len(history) > _MAX_HISTORY_TURNS:
            _FALLBACK_STORE[session_id] = history[-_MAX_HISTORY_TURNS:]

    # -----------------------------------------------------------------------
    # Get history
    # -----------------------------------------------------------------------

    @classmethod
    def get_history(
        cls,
        session_id: str,
    ) -> list[dict[str, str]]:
        """
        Retrieve the full message history for a session.

        Parameters
        ----------
        session_id:
            Unique session identifier.

        Returns
        -------
        list[dict]
            Ordered list of ``{"role": ..., "content": ...}`` dicts.
            Returns an empty list if session not found.
        """
        redis = _get_redis()

        if redis:
            key = _KEY_PREFIX + session_id
            try:
                raw_messages = redis.lrange(key, 0, -1)
                # Reset TTL on read (rolling window)
                redis.expire(key, _DEFAULT_TTL_SECONDS)
                messages = [json.loads(m) for m in raw_messages]
                logger.debug(
                    "[ConversationMemory] Loaded %d message(s) for session '%s'.",
                    len(messages),
                    session_id,
                )
                return messages
            except Exception as exc:
                logger.warning(
                    "[ConversationMemory] Redis read failed, using fallback: %s", exc
                )

        return list(_FALLBACK_STORE.get(session_id, []))

    # -----------------------------------------------------------------------
    # Clear history
    # -----------------------------------------------------------------------

    @classmethod
    def clear(cls, session_id: str) -> None:
        """
        Delete the entire conversation history for a session.

        Parameters
        ----------
        session_id:
            Unique session identifier.
        """
        redis = _get_redis()

        if redis:
            key = _KEY_PREFIX + session_id
            try:
                redis.delete(key)
                logger.info(
                    "[ConversationMemory] Cleared session '%s'.", session_id
                )
                return
            except Exception as exc:
                logger.warning(
                    "[ConversationMemory] Redis delete failed, clearing fallback: %s", exc
                )

        _FALLBACK_STORE.pop(session_id, None)

    # -----------------------------------------------------------------------
    # Check existence
    # -----------------------------------------------------------------------

    @classmethod
    def exists(cls, session_id: str) -> bool:
        """
        Return True if a session with ``session_id`` has any history.
        """
        return len(cls.get_history(session_id)) > 0

    # -----------------------------------------------------------------------
    # Format for LLM
    # -----------------------------------------------------------------------

    @classmethod
    def format_for_llm(
        cls,
        session_id: str,
    ) -> list[dict[str, str]]:
        """
        Return the history as an Ollama-compatible message list,
        ready to pass directly to the chat API.

        Returns
        -------
        list[dict]
            ``[{"role": "user"|"assistant", "content": "..."}]``
        """
        return cls.get_history(session_id)
