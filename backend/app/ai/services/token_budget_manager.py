"""
Aptora — Token Budget Manager
====================================
Centralized utility to manage token budgets, count tokens using tiktoken,
and slice retrieved RAG context and conversation history to budget thresholds.
"""

from __future__ import annotations
import logging
try:
    import tiktoken
except ImportError:
    tiktoken = None

logger = logging.getLogger(__name__)


class TokenBudgetManager:
    _encoder = None

    @classmethod
    def get_encoder(cls):
        if cls._encoder is not None:
            return cls._encoder
        if tiktoken is None:
            return None
        try:
            model = settings.OPENAI_MODEL
            try:
                cls._encoder = tiktoken.encoding_for_model(model)
            except Exception:
                cls._encoder = tiktoken.get_encoding("cl100k_base")
        except Exception as e:
            logger.warning("[TokenBudgetManager] Failed to load tiktoken encoder: %s", e)
            cls._encoder = None
        return cls._encoder

    @classmethod
    def count_tokens(cls, text: str) -> int:
        if not text:
            return 0
        encoder = cls.get_encoder()
        if encoder:
            try:
                return len(encoder.encode(text))
            except Exception:
                pass
        return len(text) // 4

    @classmethod
    def count_messages_tokens(cls, messages: list[dict[str, str]]) -> int:
        total = 0
        for m in messages:
            total += 4
            total += cls.count_tokens(m.get("content", ""))
            total += cls.count_tokens(m.get("role", ""))
        return total

    @classmethod
    def slice_context_to_budget(cls, chunks: list[dict], max_tokens: int = 1000) -> list[dict]:
        """
        Select chunks that fit within the context token budget.
        """
        selected_chunks = []
        current_tokens = 0
        for chunk in chunks:
            content = chunk.get("content", "")
            chunk_tokens = cls.count_tokens(content)
            if current_tokens + chunk_tokens <= max_tokens:
                selected_chunks.append(chunk)
                current_tokens += chunk_tokens
            else:
                break
        return selected_chunks

    @classmethod
    def slice_history_to_budget(cls, history: list[dict[str, str]], max_tokens: int = 200) -> list[dict[str, str]]:
        """
        Select the most recent history turns that fit within the history token budget.
        """
        if not history:
            return []
        selected_history = []
        current_tokens = 0
        for msg in reversed(history):
            msg_tokens = cls.count_messages_tokens([msg])
            if current_tokens + msg_tokens <= max_tokens:
                selected_history.insert(0, msg)
                current_tokens += msg_tokens
            else:
                break
        return selected_history
