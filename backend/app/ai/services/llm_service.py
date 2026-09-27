"""
LLM generation service for Aptora.

Supports:
- OpenAI text generation
- JSON structured generation
- RAG educational answer generation
- Streaming responses
"""

from __future__ import annotations

import json
import logging
import time
from typing import Any, Generator
from openai import OpenAI
from app.core.config import LLM_MODEL, settings
from app.core.request_context import ai_request_context

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
    Central LLM service for Aptora.
    """
    MODEL_NAME = LLM_MODEL

    DEFAULT_SYSTEM_PROMPT = """
You are Aptora, an intelligent educational assistant.

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
        
        ctx = ai_request_context.get()
        max_output_tokens = ctx.get("configured_output_budget") or settings.AI_CHAT_OUTPUT_TOKENS
        start_time = time.perf_counter()

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
                    max_tokens=max_output_tokens,
                )
            )

            latency = time.perf_counter() - start_time
            cls._record_usage(response, latency)

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
            latency = time.perf_counter() - start_time
            cls._record_usage_direct(0, 0, 0, latency, "failed", error_message=str(exc))
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

        ctx = ai_request_context.get()
        max_output_tokens = ctx.get("configured_output_budget") or settings.AI_CHAT_OUTPUT_TOKENS
        start_time = time.perf_counter()

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
                    },
                    max_tokens=max_output_tokens,
                )
            )

            latency = time.perf_counter() - start_time
            cls._record_usage(response, latency)

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
            latency = time.perf_counter() - start_time
            cls._record_usage_direct(0, 0, 0, latency, "failed", error_message=f"JSON Decode Error: {exc}")
            logger.exception(
                "[LLM JSON Parse Error]"
            )
            raise RuntimeError(
                "Invalid JSON returned by LLM"
            ) from exc

        except Exception as exc:
            latency = time.perf_counter() - start_time
            cls._record_usage_direct(0, 0, 0, latency, "failed", error_message=str(exc))
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

        ctx = ai_request_context.get()
        max_output_tokens = ctx.get("configured_output_budget") or settings.AI_CHAT_OUTPUT_TOKENS
        start_time = time.perf_counter()

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
                    stream=True,
                    stream_options={"include_usage": True},
                    max_tokens=max_output_tokens,
                )
            )

            for chunk in stream:
                if hasattr(chunk, "usage") and chunk.usage is not None:
                    latency = time.perf_counter() - start_time
                    cls._record_usage_direct(
                        input_tokens=chunk.usage.prompt_tokens,
                        output_tokens=chunk.usage.completion_tokens,
                        total_tokens=chunk.usage.total_tokens,
                        latency=latency,
                        status="success"
                    )

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
            latency = time.perf_counter() - start_time
            cls._record_usage_direct(0, 0, 0, latency, "failed", error_message=str(exc))
            logger.exception(
                "[LLM Streaming Failed] %s",
                exc
            )
            raise RuntimeError(
                f"Streaming failed: {exc}"
            ) from exc

    @classmethod
    def _record_usage(cls, response, latency: float, status: str = "success", error_message: str | None = None):
        ctx = ai_request_context.get()
        if not ctx or not ctx.get("request_id"):
            return

        input_tokens = 0
        output_tokens = 0
        total_tokens = 0
        if hasattr(response, "usage") and response.usage:
            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens
            total_tokens = response.usage.total_tokens

        from app.ai.services.usage_tracker import UsageTracker
        UsageTracker.track_usage(
            request_id=ctx["request_id"],
            user_id=ctx.get("user_id"),
            feature=ctx.get("feature", "chat"),
            provider="openai",
            model=cls.MODEL_NAME,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            latency=latency,
            status=status,
            configured_context_budget=ctx.get("configured_context_budget"),
            configured_history_budget=ctx.get("configured_history_budget"),
            configured_output_budget=ctx.get("configured_output_budget"),
            actual_context_tokens=ctx.get("actual_context_tokens"),
            actual_history_tokens=ctx.get("actual_history_tokens"),
            error_message=error_message
        )

    @classmethod
    def _record_usage_direct(
        cls,
        input_tokens: int,
        output_tokens: int,
        total_tokens: int,
        latency: float,
        status: str,
        error_message: str | None = None
    ):
        ctx = ai_request_context.get()
        if not ctx or not ctx.get("request_id"):
            return

        from app.ai.services.usage_tracker import UsageTracker
        UsageTracker.track_usage(
            request_id=ctx["request_id"],
            user_id=ctx.get("user_id"),
            feature=ctx.get("feature", "chat"),
            provider="openai",
            model=cls.MODEL_NAME,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            latency=latency,
            status=status,
            configured_context_budget=ctx.get("configured_context_budget"),
            configured_history_budget=ctx.get("configured_history_budget"),
            configured_output_budget=ctx.get("configured_output_budget"),
            actual_context_tokens=ctx.get("actual_context_tokens"),
            actual_history_tokens=ctx.get("actual_history_tokens"),
            error_message=error_message
        )