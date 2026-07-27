"""
ExamForge AI — Knowledge Chat Service
========================================

High-level orchestrator for the multi-turn Knowledge Chat pipeline.

Pipeline
--------
1. Load session conversation history (ConversationMemory)
2. Retrieve relevant chunks from Qdrant (RAGService)
3. Score retrieval confidence (ConfidenceScorer)
4. Build context block (ContextBuilder)
5. Build history-aware prompt and generate answer (KnowledgeChatAgent)
6. Persist user question + AI answer to memory
7. Return answer with sources and confidence metadata

This service is stateful per ``session_id``.
"""

from __future__ import annotations

import logging
from typing import Any, Generator

from app.ai.memory.conversation_memory import ConversationMemory
from app.ai.orchestrator.reasoning_pipeline import ReasoningPipeline

logger = logging.getLogger(__name__)


class KnowledgeChatService:
    """
    Orchestrates multi-turn Knowledge Chat powered by ReasoningPipeline.

    Usage
    -----
    ::

        result = KnowledgeChatService.ask(
            session_id="abc-123",
            workspace_id=5,
            question="What is Newton's second law?",
        )
        # result["answer"] → str
        # result["confidence"] → "high" | "medium" | "low"
        # result["sources"] → list of source metadata dicts
        # result["history_length"] → int
    """

    DEFAULT_RETRIEVAL_LIMIT = 8

    # -----------------------------------------------------------------------
    # Non-streaming
    # -----------------------------------------------------------------------

    @classmethod
    def ask(
        cls,
        session_id: str,
        workspace_id: int,
        question: str,
        limit: int = DEFAULT_RETRIEVAL_LIMIT,
    ) -> dict[str, Any]:
        """
        Generate a complete multi-turn response via ReasoningPipeline.
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        logger.info(
            "[KnowledgeChatService] ask | session=%s | workspace=%d",
            session_id,
            workspace_id,
        )

        # 1. Load conversation history
        history = ConversationMemory.get_history(session_id)
        logger.info(
            "[KnowledgeChatService] History loaded: %d message(s).",
            len(history),
        )

        # 2. Run Reasoning Pipeline with history
        pipeline_result = ReasoningPipeline.run(
            workspace_id=workspace_id,
            question=question,
            history=history,
        )

        answer = pipeline_result["answer"]
        confidence = pipeline_result["confidence"]
        sources = pipeline_result["sources"]

        # 3. Persist to memory
        ConversationMemory.add_message(session_id, "user", question)
        ConversationMemory.add_message(session_id, "assistant", answer)

        logger.info("[KnowledgeChatService] Answer generated and stored via ReasoningPipeline.")

        return {
            "session_id": session_id,
            "answer": answer,
            "confidence": confidence,
            "sources": sources,
            "history_length": len(history) + 2,   # +2 for messages just added
        }

    # -----------------------------------------------------------------------
    # Streaming
    # -----------------------------------------------------------------------

    @classmethod
    def stream(
        cls,
        session_id: str,
        workspace_id: int,
        question: str,
        limit: int = DEFAULT_RETRIEVAL_LIMIT,
    ) -> Generator[str, None, None]:
        """
        Stream a multi-turn response token by token via ReasoningPipeline.
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        logger.info(
            "[KnowledgeChatService] stream | session=%s | workspace=%d",
            session_id,
            workspace_id,
        )

        # 1. Load history
        history = ConversationMemory.get_history(session_id)

        # 2. Store user message before streaming
        ConversationMemory.add_message(session_id, "user", question)

        # 3. Stream through reasoning pipeline
        accumulated: list[str] = []

        for token in ReasoningPipeline.run_stream(
            workspace_id=workspace_id,
            question=question,
            history=history,
        ):
            accumulated.append(token)
            yield token

        # 4. Store assistant response after stream completes
        full_answer = "".join(accumulated)
        ConversationMemory.add_message(session_id, "assistant", full_answer)

        logger.info("[KnowledgeChatService] Streaming completed and stored via ReasoningPipeline.")
