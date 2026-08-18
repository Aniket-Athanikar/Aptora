"""
ExamForge AI - Chat Service

Responsibilities:
1. Validate user requests
2. Retrieve relevant study context
3. Delegate response generation to the ChatAgent
4. Support standard and streaming responses
"""

from __future__ import annotations

import logging
from typing import Generator

from app.ai.agents.chat import ChatAgent
from app.ai.orchestrator.reasoning_pipeline import ReasoningPipeline

logger = logging.getLogger(__name__)


class ChatService:
    """
    High-level service responsible for handling AI chat requests.
    Powered by ReasoningPipeline for professional AI tutor responses.
    """

    _agent = ChatAgent()

    @classmethod
    def ask(
        cls,
        workspace_id: int,
        question: str,
        user_id: int | None = None,
        request_id: str | None = None,
    ) -> str:
        """
        Generate a response using the AI Reasoning Pipeline.
        """

        question = question.strip()

        if not question:
            raise ValueError("Question cannot be empty.")

        logger.info(
            "Chat request | workspace=%s | request_id=%s",
            workspace_id,
            request_id,
        )

        try:

            pipeline_result = ReasoningPipeline.run(
                workspace_id=workspace_id,
                question=question,
                user_id=user_id,
                request_id=request_id,
            )

            answer = pipeline_result["answer"]

            logger.info(
                "Chat response generated successfully via ReasoningPipeline."
            )

            return answer

        except Exception:

            logger.exception(
                "Chat generation failed."
            )

            raise

    @classmethod
    def stream(
        cls,
        workspace_id: int,
        question: str,
        stream_format: str = "plain",
        user_id: int | None = None,
        request_id: str | None = None,
    ) -> Generator[str, None, None]:
        """
        Stream a response using the AI Reasoning Pipeline.
        """

        question = question.strip()

        if not question:
            raise ValueError("Question cannot be empty.")

        logger.info(
            "Streaming chat | workspace=%s | request_id=%s",
            workspace_id,
            request_id,
        )

        try:

            yield from ReasoningPipeline.run_stream(
                workspace_id=workspace_id,
                question=question,
                stream_format=stream_format,
                user_id=user_id,
                request_id=request_id,
            )

            logger.info(
                "Streaming completed via ReasoningPipeline."
            )

        except Exception:

            logger.exception(
                "Streaming chat failed."
            )

            raise
