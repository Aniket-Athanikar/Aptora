"""OpenAI embedding adapter used by the existing Qdrant ingestion and search flow."""

from __future__ import annotations

import logging
import time

from app.ai.services.llm_service import get_openai_client
from app.core.config import EMBEDDING_DIMENSION, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

_MAX_INPUT_CHARS = 8_000


class EmbeddingService:
    """Generate validated OpenAI embeddings while retaining the existing public API."""

    MODEL_NAME: str = EMBEDDING_MODEL
    VECTOR_DIMENSION: int = EMBEDDING_DIMENSION

    @staticmethod
    def embed(text: str, is_query: bool = False) -> list[float]:
        if not text or not text.strip():
            raise ValueError("[EmbeddingService] Cannot embed empty text.")
        payload = text[:_MAX_INPUT_CHARS]
        start = time.perf_counter()
        try:
            response = get_openai_client().embeddings.create(
                model=EmbeddingService.MODEL_NAME,
                input=payload,
                dimensions=EmbeddingService.VECTOR_DIMENSION,
            )
            vector = response.data[0].embedding
            EmbeddingService._validate_vector(vector)
            logger.info(
                "[EmbeddingService] Generated %d-dimensional OpenAI embedding in %.3fs.",
                len(vector), time.perf_counter() - start,
            )
            return [float(value) for value in vector]
        except Exception as exc:
            logger.exception("[EmbeddingService] OpenAI embedding failed | model=%s | error=%r", EmbeddingService.MODEL_NAME, exc)
            raise RuntimeError(f"OpenAI embedding generation failed | model={EmbeddingService.MODEL_NAME} | Cause: {exc}") from exc

    @staticmethod
    def embed_many(chunks: list[str], is_query: bool = False) -> list[list[float]]:
        if not chunks:
            raise ValueError("[EmbeddingService] chunks list must not be empty.")
        if any(not chunk or not chunk.strip() for chunk in chunks):
            raise ValueError("[EmbeddingService] Cannot embed empty text.")
        try:
            response = get_openai_client().embeddings.create(
                model=EmbeddingService.MODEL_NAME,
                input=[chunk[:_MAX_INPUT_CHARS] for chunk in chunks],
                dimensions=EmbeddingService.VECTOR_DIMENSION,
            )
            vectors = [item.embedding for item in response.data]
            if len(vectors) != len(chunks):
                raise RuntimeError("OpenAI returned an unexpected number of embedding vectors.")
            for vector in vectors:
                EmbeddingService._validate_vector(vector)
            return [[float(value) for value in vector] for vector in vectors]
        except Exception as exc:
            logger.exception("[EmbeddingService] OpenAI batch embedding failed | model=%s | error=%r", EmbeddingService.MODEL_NAME, exc)
            raise RuntimeError(f"OpenAI batch embedding generation failed | model={EmbeddingService.MODEL_NAME} | Cause: {exc}") from exc

    @staticmethod
    def _validate_vector(vector: list[float]) -> None:
        if not vector or len(vector) != EmbeddingService.VECTOR_DIMENSION:
            raise RuntimeError(
                f"[EmbeddingService] Expected {EmbeddingService.VECTOR_DIMENSION}-dimensional embedding, got {len(vector) if vector else 0}."
            )
        if not all(isinstance(value, (int, float)) for value in vector):
            raise RuntimeError("[EmbeddingService] OpenAI returned a non-numeric embedding value.")
