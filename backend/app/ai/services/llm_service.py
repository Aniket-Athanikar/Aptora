"""
LLM generation service for ExamForge.

Supports:
- OpenAI text generation
- JSON structured generation
- RAG educational answer generation
- Streaming responses
"""

from __future__ import annotations

import json
import logging
from typing import Any, Generator
from openai import OpenAI
from app.core.config import LLM_MODEL, settings

logger = logging.getLogger(__name__)

_client_instance: OpenAI | None = None
_client_api_key: str | None = None


def get_openai_client() -> OpenAI:
    """
    Return cached OpenAI client.
    """
    global _client_instance, _client_api_key

    api_key = settings.OPENAI_API_KEY.strip()

    if not api_key:
        raise RuntimeError(
            "OpenAI API key is not configured. Set OPENAI_API_KEY."
        )

    if (
        _client_instance is None
        or _client_api_key != api_key
    ):
        logger.info("[LLMService] Creating OpenAI client")

        _client_instance = OpenAI(
            api_key=api_key
        )
        _client_api_key = api_key
    return _client_instance


class LLMService:
    """
    Central LLM service for ExamForge.
    """
    MODEL_NAME = LLM_MODEL

    DEFAULT_SYSTEM_PROMPT = """
You are ExamForge AI, an intelligent educational assistant.

Answer clearly and accurately.
If information is unavailable, say that you do not know.
Do not invent facts.
"""

    RAG_SYSTEM_PROMPT = """
You are an expert teacher and subject matter expert.

Your task is to answer a student's question using ONLY the provided textbook content.

Rules:

- Use only the provided context.
- Combine information from all passages.
- Remove duplicate information.
- Explain concepts in simple language.
- Introduce technical terms only when necessary.
- Do not use outside knowledge.
- Do not mention chunks, documents, or retrieved passages.
- Do not copy large parts of the source text.
- If information is missing, clearly mention that.

Return ONLY valid JSON.

Required format:

{
  "explanation": "Clear student-friendly explanation",
  "key_points": [
      "Important point 1",
      "Important point 2",
      "Important point 3"
  ],
  "example": "Example from provided material or empty string",
  "summary": "Short 2-4 sentence recap"
}
"""
    @classmethod
    def _messages(
        cls,
        prompt: str,
        system_prompt: str | None = None
    ) -> list[dict[str, str]]:

        return [
            {
                "role": "system",
                "content": (
                    system_prompt
                    or cls.DEFAULT_SYSTEM_PROMPT
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

    @classmethod
    def generate(
        cls,
        prompt: str,
        system_prompt: str | None = None
    ) -> str:
        """
        Generate normal text response.
        """

        if not prompt.strip():
            raise ValueError(
                "Prompt cannot be empty."
            )
        try:
            response = (
                get_openai_client()
                .chat.completions.create(
                    model=cls.MODEL_NAME,
                    messages=cls._messages(
                        prompt,
                        system_prompt
                    ),
                    temperature=0.2,
                )
            )

            content = (
                response
                .choices[0]
                .message
                .content
                or ""
            ).strip()

            if not content:
                raise RuntimeError(
                    "Empty response from OpenAI"
                )

            return content

        except Exception as exc:

            logger.exception(
                "[LLM Generate Failed] %s",
                exc
            )
            raise RuntimeError(
                f"LLM generation failed: {exc}"
            ) from exc

    @classmethod
    def generate_json(
        cls,
        prompt: str,
        system_prompt: str | None = None
    ) -> dict[str, Any]:
        """
        Generate structured JSON response.
        """

        if not prompt.strip():
            raise ValueError(
                "Prompt cannot be empty."
            )

        try:

            response = (
                get_openai_client()
                .chat.completions.create(
                    model=cls.MODEL_NAME,
                    messages=cls._messages(
                        prompt,
                        system_prompt
                    ),
                    temperature=0.2,
                    response_format={
                        "type": "json_object"
                    }
                )
            )

            content = (
                response
                .choices[0]
                .message
                .content
                or ""
            ).strip()

            if not content:
                raise RuntimeError(
                    "Empty JSON response"
                )

            data = json.loads(content)

            if not isinstance(data, dict):
                raise ValueError(
                    "Response must be JSON object"
                )
            return data

        except json.JSONDecodeError as exc:

            logger.exception(
                "[LLM JSON Parse Error]"
            )

            raise RuntimeError(
                "Invalid JSON returned by LLM"
            ) from exc

        except Exception as exc:

            logger.exception(
                "[LLM JSON Failed] %s",
                exc
            )
            raise RuntimeError(
                f"JSON generation failed: {exc}"
            ) from exc

    @classmethod
    def generate_rag_answer(
        cls,
        question: str,
        retrieved_chunks: str
    ) -> dict[str, Any]:
        """
        Generate educational RAG answer.
        """

        prompt = f"""
Student Question:
{question}

Retrieved Textbook Content:
{retrieved_chunks}

Answer using the provided textbook content only.
"""
        return cls.generate_json(
            prompt,
            system_prompt=cls.RAG_SYSTEM_PROMPT
        )

    @classmethod
    def stream(
        cls,
        prompt: str,
        system_prompt: str | None = None
    ) -> Generator[str, None, None]:
        """
        Stream text response.
        """

        if not prompt.strip():
            raise ValueError(
                "Prompt cannot be empty."
            )

        try:

            stream = (
                get_openai_client()
                .chat.completions.create(
                    model=cls.MODEL_NAME,
                    messages=cls._messages(
                        prompt,
                        system_prompt
                    ),
                    temperature=0.2,
                    stream=True
                )
            )

            for chunk in stream:

                if chunk.choices:

                    token = (
                        chunk
                        .choices[0]
                        .delta
                        .content
                    )

                    if token:
                        yield token

        except Exception as exc:

            logger.exception(
                "[LLM Streaming Failed] %s",
                exc
            )

            raise RuntimeError(
                f"Streaming failed: {exc}"
            ) from exc