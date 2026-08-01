"""
ExamForge AI - LLM Service

Responsible for:
1. Sending prompts to the configured generation provider (Ollama or OpenRouter)
2. Generating responses
3. Streaming responses
"""

from __future__ import annotations

import logging
from typing import Generator, Any

import requests
from ollama import Client
from openai import OpenAI

from app.core.config import LLM_MODEL, settings

logger = logging.getLogger(__name__)

# Singleton client management
_client_instance: Client | None = None
_client_host: str | None = None
_openrouter_client_instance: OpenAI | None = None
_openrouter_client_config: tuple[str, str] | None = None


def get_client() -> Client:
    """
    Return singleton Ollama Client instance bound to settings.OLLAMA_HOST.
    Re-instantiates client if OLLAMA_HOST changes dynamically.
    """
    global _client_instance, _client_host
    target_host = settings.OLLAMA_HOST.rstrip("/")
    if _client_instance is None or _client_host != target_host:
        logger.info("[LLMService] Creating singleton Ollama Client | host=%s", target_host)
        _client_instance = Client(host=target_host)
        _client_host = target_host
    return _client_instance


def get_openrouter_client() -> OpenAI:
    """Return a cached OpenRouter client for the current API configuration."""
    global _openrouter_client_instance, _openrouter_client_config

    api_key = settings.OPENROUTER_API_KEY.strip()
    base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
    if not api_key:
        raise RuntimeError("OpenRouter API key is not configured. Set OPENROUTER_API_KEY.")

    config = (api_key, base_url)
    if _openrouter_client_instance is None or _openrouter_client_config != config:
        logger.info("[LLMService] Creating OpenRouter client | base_url=%s", base_url)
        _openrouter_client_instance = OpenAI(api_key=api_key, base_url=base_url)
        _openrouter_client_config = config
    return _openrouter_client_instance


class _ClientProxy:
    """Proxy object so 'from app.ai.services.llm_service import client' delegates to get_client()."""

    def chat(self, *args: Any, **kwargs: Any) -> Any:
        return get_client().chat(*args, **kwargs)

    def generate(self, *args: Any, **kwargs: Any) -> Any:
        return get_client().generate(*args, **kwargs)

    def embeddings(self, *args: Any, **kwargs: Any) -> Any:
        return get_client().embeddings(*args, **kwargs)

    def __getattr__(self, name: str) -> Any:
        return getattr(get_client(), name)


# Exported singleton proxy for backward compatibility across backend code
client = _ClientProxy()


class LLMService:
    """
    Provider-neutral LLM generation facade. Ollama remains the default provider;
    OpenRouter is selected only when LLM_PROVIDER=openrouter.
    """

    MODEL_NAME = LLM_MODEL or "qwen3:4b"

    DEFAULT_SYSTEM_PROMPT = (
        "You are ExamForge AI, an intelligent educational assistant. "
        "Answer only from the provided context whenever possible. "
        "If the answer is not available, clearly say so instead of guessing."
    )

    @classmethod
    def get_client(cls) -> Client:
        """Helper method returning the singleton Ollama Client instance."""
        return get_client()

    @classmethod
    def _provider(cls) -> str:
        provider = settings.LLM_PROVIDER.strip().lower()
        if provider not in {"ollama", "openrouter"}:
            raise ValueError(
                f"Unsupported LLM_PROVIDER '{settings.LLM_PROVIDER}'. "
                "Use 'ollama' or 'openrouter'."
            )
        return provider

    @classmethod
    def _messages(cls, prompt: str, system_prompt: str | None) -> list[dict[str, str]]:
        return [
            {"role": "system", "content": system_prompt or cls.DEFAULT_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ]

    @classmethod
    def _verify_ollama(cls, prompt: str) -> None:
        """Fail early with connection diagnostics before an LLM request."""
        host = settings.OLLAMA_HOST.rstrip("/")
        model_name = cls.MODEL_NAME
        tags_url = f"{host}/api/tags"
        prompt_len = len(prompt)

        logger.info(
            "[Ollama Diagnostics] Preflight check | OLLAMA_HOST=%s | MODEL=%s | Prompt Length=%d | tags_url=%s",
            host,
            model_name,
            prompt_len,
            tags_url,
        )

        try:
            response = requests.get(tags_url, timeout=5)
            response.raise_for_status()
            raw_models = response.json().get("models", [])

            model_names: list[str] = []
            for item in raw_models:
                if isinstance(item, dict):
                    if item.get("name"):
                        model_names.append(item["name"])
                    if item.get("model") and item["model"] not in model_names:
                        model_names.append(item["model"])

            target_base = model_name.split(":")[0]
            target_tag = model_name.split(":")[1] if ":" in model_name else "latest"

            matched = False
            for name in model_names:
                name_base = name.split(":")[0]
                name_tag = name.split(":")[1] if ":" in name else "latest"

                if name == model_name or (
                    name_base == target_base
                    and (name_tag == target_tag or name_tag == "latest" or target_tag == "latest")
                ):
                    matched = True
                    break

            if not matched:
                err_msg = (
                    f"Ollama model '{model_name}' is unavailable at {host}. "
                    f"Available models: {model_names}"
                )
                logger.error("[Ollama Diagnostics] %s", err_msg)
                raise RuntimeError(err_msg)

            logger.info("[Ollama Diagnostics] Preflight OK | host=%s | model=%s", host, model_name)

        except Exception as exc:
            http_status = getattr(getattr(exc, "response", None), "status_code", "N/A")
            logger.exception(
                "[Ollama Diagnostics] Preflight failed | OLLAMA_HOST=%s | MODEL=%s | HTTP Status=%s | error=%r",
                host,
                model_name,
                http_status,
                exc,
            )
            raise RuntimeError(
                f"Ollama connection error | host={host} | model={model_name} | HTTP_status={http_status} | Cause: {exc}"
            ) from exc

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
        """
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        if cls._provider() == "openrouter":
            return cls._generate_openrouter(prompt, system_prompt)

        return cls._generate_ollama(prompt, system_prompt)

    @classmethod
    def _generate_ollama(cls, prompt: str, system_prompt: str | None) -> str:
        """Existing Ollama generation implementation."""
        host = settings.OLLAMA_HOST.rstrip("/")
        model_name = cls.MODEL_NAME
        prompt_len = len(prompt)

        try:
            cls._verify_ollama(prompt)

            logger.info(
                "[Ollama Diagnostics] Request | Request URL=%s/api/chat | Host=%s | Endpoint=/api/chat | Model=%s | Prompt Length=%d",
                host,
                host,
                model_name,
                prompt_len,
            )

            messages = cls._messages(prompt, system_prompt)

            response = get_client().chat(
                model=model_name,
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

            logger.info("[Ollama Chat] Response generated successfully.")
            return answer

        except Exception as exc:
            http_status = getattr(getattr(exc, "response", None), "status_code", "N/A")
            exc_str = str(exc)
            if "failed to allocate" in exc_str.lower() or "out-of-memory" in exc_str.lower():
                err_detail = (
                    f"Ollama server ran out of RAM/VRAM loading model '{model_name}'. "
                    f"Please free up host memory or restart Ollama ('ollama serve'). Cause: {exc_str}"
                )
            else:
                err_detail = f"Failed to connect to Ollama or generate response | host={host} | model={model_name} | HTTP_status={http_status} | Cause: {exc}"

            logger.exception(
                "[Ollama Chat] Chat failed | host=%s | model=%s | prompt_length=%d | HTTP_status=%s | error=%r",
                host,
                model_name,
                prompt_len,
                http_status,
                exc,
            )
            raise RuntimeError(err_detail) from exc

    @classmethod
    def _generate_openrouter(cls, prompt: str, system_prompt: str | None) -> str:
        """Generate a non-streaming response through OpenRouter's OpenAI API."""
        model_name = settings.OPENROUTER_MODEL
        base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
        try:
            response = get_openrouter_client().chat.completions.create(
                model=model_name,
                messages=cls._messages(prompt, system_prompt),
                temperature=0.2,
            )
            answer = (response.choices[0].message.content or "").strip()
            logger.info("[OpenRouter Chat] Response generated successfully | model=%s", model_name)
            return answer
        except Exception as exc:
            http_status = getattr(getattr(exc, "response", None), "status_code", "N/A")
            logger.exception(
                "[OpenRouter Chat] Chat failed | base_url=%s | model=%s | prompt_length=%d | HTTP_status=%s | error=%r",
                base_url, model_name, len(prompt), http_status, exc,
            )
            raise RuntimeError(
                f"OpenRouter generation failed | base_url={base_url} | model={model_name} | "
                f"HTTP_status={http_status} | Cause: {exc}"
            ) from exc

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
        """
        if not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        if cls._provider() == "openrouter":
            yield from cls._stream_openrouter(prompt, system_prompt)
            return

        yield from cls._stream_ollama(prompt, system_prompt)

    @classmethod
    def _stream_ollama(
        cls, prompt: str, system_prompt: str | None
    ) -> Generator[str, None, None]:
        """Existing Ollama streaming implementation."""
        host = settings.OLLAMA_HOST.rstrip("/")
        model_name = cls.MODEL_NAME
        prompt_len = len(prompt)

        try:
            cls._verify_ollama(prompt)

            logger.info(
                "[Ollama Diagnostics] Request Stream | Request URL=%s/api/chat | Host=%s | Endpoint=/api/chat | Model=%s | Prompt Length=%d",
                host,
                host,
                model_name,
                prompt_len,
            )

            messages = cls._messages(prompt, system_prompt)

            stream = get_client().chat(
                model=model_name,
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

            logger.info("[Ollama Stream] Streaming completed successfully.")

        except Exception as exc:
            http_status = getattr(getattr(exc, "response", None), "status_code", "N/A")
            logger.exception(
                "[Ollama Stream] Stream failed | host=%s | model=%s | prompt_length=%d | HTTP_status=%s | error=%r",
                host,
                model_name,
                prompt_len,
                http_status,
                exc,
            )
            raise RuntimeError(
                f"Failed to connect to Ollama stream | host={host} | model={model_name} | HTTP_status={http_status} | Cause: {exc}"
            ) from exc

    @classmethod
    def _stream_openrouter(
        cls, prompt: str, system_prompt: str | None
    ) -> Generator[str, None, None]:
        """Stream OpenRouter text in the same string-chunk contract as Ollama."""
        model_name = settings.OPENROUTER_MODEL
        base_url = settings.OPENROUTER_BASE_URL.rstrip("/")
        try:
            stream = get_openrouter_client().chat.completions.create(
                model=model_name,
                messages=cls._messages(prompt, system_prompt),
                temperature=0.2,
                stream=True,
            )
            for chunk in stream:
                if not chunk.choices:
                    continue
                content = chunk.choices[0].delta.content
                if content:
                    yield content
            logger.info("[OpenRouter Stream] Streaming completed successfully | model=%s", model_name)
        except Exception as exc:
            http_status = getattr(getattr(exc, "response", None), "status_code", "N/A")
            logger.exception(
                "[OpenRouter Stream] Stream failed | base_url=%s | model=%s | prompt_length=%d | HTTP_status=%s | error=%r",
                base_url, model_name, len(prompt), http_status, exc,
            )
            raise RuntimeError(
                f"OpenRouter streaming failed | base_url={base_url} | model={model_name} | "
                f"HTTP_status={http_status} | Cause: {exc}"
            ) from exc
