"""
ExamForge AI - LLM Service

Responsible for:
1. Sending prompts to Ollama
2. Generating responses
3. Streaming responses
"""

from __future__ import annotations

import logging
from typing import Generator

import ollama

from app.core.config import LLM_MODEL

logger = logging.getLogger(__name__)


class LLMService:
    """
    Wrapper around the Ollama chat API.
    """

    MODEL_NAME = LLM_MODEL

    DEFAULT_SYSTEM_PROMPT = (
        "You are ExamForge AI, an intelligent educational assistant. "
        "Answer only from the provided context whenever possible. "
        "If the answer is not available, clearly say so instead of guessing."
    )

    # ==========================================================
    # Generate Response
    # ==========================================================

    @classmethod
    def generate(
        cls,
        prompt: str,
        system_prompt: str | None = None,
    ) -> str:
        """
        Generate a complete response from the LLM.

        Parameters
        ----------
        prompt : str
            User prompt.

        system_prompt : str | None
            Optional system prompt.

        Returns
        -------
        str
            Generated response.
        """

        if not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        try:

            logger.info(
                "Generating response using model '%s'",
                cls.MODEL_NAME,
            )

            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                    or cls.DEFAULT_SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ]

            response = ollama.chat(
                model=cls.MODEL_NAME,
                messages=messages,
                options={
                    "temperature": 0.2,
                },
            )

            answer = (
                response.get("message", {})
                .get("content", "")
                .strip()
            )

            logger.info("LLM response generated successfully.")

            return answer

        except Exception:

            logger.exception("LLM generation failed.")
            raise

    # ==========================================================
    # Stream Response
    # ==========================================================

    @classmethod
    def stream(
        cls,
        prompt: str,
        system_prompt: str | None = None,
    ) -> Generator[str, None, None]:
        """
        Stream response from Ollama.

        Parameters
        ----------
        prompt : str
            User prompt.

        system_prompt : str | None
            Optional system prompt.
        """

        if not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        try:

            logger.info(
                "Streaming response using model '%s'",
                cls.MODEL_NAME,
            )

            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                    or cls.DEFAULT_SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ]

            stream = ollama.chat(
                model=cls.MODEL_NAME,
                messages=messages,
                stream=True,
                options={
                    "temperature": 0.2,
                },
            )

            for chunk in stream:

                content = (
                    chunk.get("message", {})
                    .get("content", "")
                )

                if content:
                    yield content

            logger.info("Streaming completed successfully.")

        except Exception:

            logger.exception("LLM streaming failed.")
            raise