"""
ExamForge AI - Embedding Service
==================================

Processing stage: TextChunker → EmbeddingService → QdrantService

Generates dense vector embeddings for text chunks using the Ollama
``nomic-embed-text`` model (768-dimensional cosine-similarity vectors).

All HTTP calls go directly to the Ollama REST API so this module has
zero external library dependencies beyond the Python stdlib.

Design principles
-----------------
- Pure-function interface  (all methods are @staticmethod)
- Deterministic retry with exponential back-off on transient failures
- Hard per-request timeout to prevent pipeline stalls
- Every vector is validated before being returned
- Returns clean list[float] — caller never sees raw HTTP responses
"""

from __future__ import annotations

import json
import logging
import time
import urllib.error
import urllib.request
from typing import Final

from app.core.config import (
    EMBEDDING_DIMENSION,
    EMBEDDING_MODEL,
    settings,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Ollama embeddings endpoint.
_OLLAMA_EMBED_URL: Final[str] = (
    settings.OLLAMA_HOST.rstrip("/") + "/api/embeddings"
)

# nomic-embed-text context window is 8 192 tokens.  We stay conservatively
# below that by capping input at 8 000 characters (~6 000 tokens on average).
_MAX_INPUT_CHARS: Final[int] = 8_000

# HTTP request timeout in seconds.  Ollama on CPU for a single chunk is
# typically < 1 s; 30 s gives plenty of headroom on slow hardware.
_REQUEST_TIMEOUT_SECONDS: Final[int] = 30

# Retry configuration for transient errors (connection refused, 503, etc.).
_MAX_RETRIES: Final[int] = 3
_RETRY_BASE_DELAY_SECONDS: Final[float] = 1.0   # doubles each attempt
_RETRY_MAX_DELAY_SECONDS: Final[float] = 10.0


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


class EmbeddingService:
    """
    Stateless embedding client for the Ollama ``nomic-embed-text`` model.

    Usage
    -----
    ::

        from app.ai.services.embedding_service import EmbeddingService

        vector  = EmbeddingService.embed("Introduction to algorithms")
        vectors = EmbeddingService.embed_many(["chunk 1", "chunk 2"])

    All methods are ``@staticmethod`` — no instantiation required.
    """

    MODEL_NAME: str        = EMBEDDING_MODEL       # "nomic-embed-text"
    VECTOR_DIMENSION: int  = EMBEDDING_DIMENSION   # 768

    # -----------------------------------------------------------------------
    # Public methods
    # -----------------------------------------------------------------------

    @staticmethod
    def embed(text: str) -> list[float]:
        """
        Generate a single embedding vector for *text*.

        The input is automatically truncated to ``_MAX_INPUT_CHARS``
        characters before being sent to Ollama.  Whitespace-only strings
        are rejected immediately to avoid wasting a network round-trip.

        Parameters
        ----------
        text:
            The text to embed.  Should be a cleaned, non-empty string.

        Returns
        -------
        list[float]
            768-dimensional embedding vector.

        Raises
        ------
        ValueError
            If *text* is empty or whitespace-only.
        ConnectionError
            If Ollama is unreachable after all retry attempts.
        TimeoutError
            If an individual HTTP request exceeds ``_REQUEST_TIMEOUT_SECONDS``.
        RuntimeError
            If Ollama returns an empty or malformed response.
        """
        if not text or not text.strip():
            raise ValueError(
                "[EmbeddingService] Cannot embed empty text."
            )

        # Truncate to model context window limit.
        payload_text = text[:_MAX_INPUT_CHARS]

        logger.info(
            "[EmbeddingService] Embedding text (%d chars) with model '%s'",
            len(payload_text),
            EmbeddingService.MODEL_NAME,
        )

        start = time.perf_counter()

        vector = EmbeddingService._request_embedding(payload_text)

        elapsed = time.perf_counter() - start

        logger.info(
            "[EmbeddingService] Embedding complete: %d-dim vector in %.3fs",
            len(vector),
            elapsed,
        )

        return vector

    @staticmethod
    def embed_many(chunks: list[str]) -> list[list[float]]:
        """
        Generate embedding vectors for a list of text chunks.

        Processes chunks sequentially.  Each chunk goes through the same
        validation, truncation, and retry logic as :meth:`embed`.

        Parameters
        ----------
        chunks:
            Ordered list of text segments produced by ``TextChunker``.
            Empty strings in the list raise ``ValueError``.

        Returns
        -------
        list[list[float]]
            Ordered list of 768-dimensional embedding vectors.  The i-th
            vector corresponds to ``chunks[i]``.

        Raises
        ------
        ValueError
            If *chunks* is empty, or if any individual chunk is empty.
        ConnectionError
            If Ollama is unreachable after all retry attempts on any chunk.
        TimeoutError
            If any individual HTTP request exceeds ``_REQUEST_TIMEOUT_SECONDS``.
        RuntimeError
            If Ollama returns a malformed response for any chunk.
        """
        if not chunks:
            raise ValueError(
                "[EmbeddingService] chunks list must not be empty."
            )

        total = len(chunks)

        logger.info(
            "[EmbeddingService] Starting batch embedding: %d chunk(s)",
            total,
        )

        batch_start = time.perf_counter()
        vectors: list[list[float]] = []

        for idx, chunk in enumerate(chunks, start=1):
            logger.info(
                "[EmbeddingService] Embedding chunk %d / %d (%d chars)",
                idx,
                total,
                len(chunk),
            )

            vector = EmbeddingService.embed(chunk)
            vectors.append(vector)

        batch_elapsed = time.perf_counter() - batch_start

        logger.info(
            "[EmbeddingService] Batch complete: %d vectors in %.2fs "
            "(avg %.3fs/chunk)",
            total,
            batch_elapsed,
            batch_elapsed / total,
        )

        return vectors

    # -----------------------------------------------------------------------
    # Private helpers
    # -----------------------------------------------------------------------

    @staticmethod
    def _request_embedding(text: str) -> list[float]:
        """
        Send a single embedding request to Ollama and return the vector.

        Implements exponential back-off retry on transient HTTP / connection
        errors.  Raises immediately on 4xx client errors (bad model name,
        etc.) because those will not be fixed by retrying.

        Parameters
        ----------
        text:
            Pre-truncated text ready to be embedded.

        Returns
        -------
        list[float]
            Validated embedding vector.

        Raises
        ------
        ConnectionError
            If Ollama cannot be reached after ``_MAX_RETRIES`` attempts.
        TimeoutError
            If an individual request exceeds ``_REQUEST_TIMEOUT_SECONDS``.
        RuntimeError
            For empty or malformed Ollama responses.
        """
        payload = json.dumps(
            {
                "model": EmbeddingService.MODEL_NAME,
                "prompt": text,
            }
        ).encode("utf-8")

        request = urllib.request.Request(
            url=_OLLAMA_EMBED_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        last_error: Exception | None = None

        for attempt in range(1, _MAX_RETRIES + 1):

            try:
                return EmbeddingService._execute_request(request)

            except TimeoutError:
                # Timeout is not retried — likely a stuck Ollama process.
                raise

            except urllib.error.HTTPError as exc:
                # 4xx errors are the caller's fault — do not retry.
                if 400 <= exc.code < 500:
                    raise RuntimeError(
                        f"[EmbeddingService] Ollama returned HTTP {exc.code}: "
                        f"{exc.reason}"
                    ) from exc
                # 5xx — transient server error, retry.
                last_error = exc
                logger.warning(
                    "[EmbeddingService] HTTP %d on attempt %d/%d — retrying",
                    exc.code,
                    attempt,
                    _MAX_RETRIES,
                )

            except (urllib.error.URLError, ConnectionRefusedError, OSError) as exc:
                last_error = exc
                logger.warning(
                    "[EmbeddingService] Connection error on attempt %d/%d: %s",
                    attempt,
                    _MAX_RETRIES,
                    exc,
                )

            if attempt < _MAX_RETRIES:
                delay = min(
                    _RETRY_BASE_DELAY_SECONDS * (2 ** (attempt - 1)),
                    _RETRY_MAX_DELAY_SECONDS,
                )
                logger.info(
                    "[EmbeddingService] Waiting %.1fs before retry %d/%d",
                    delay,
                    attempt + 1,
                    _MAX_RETRIES,
                )
                time.sleep(delay)

        raise ConnectionError(
            f"[EmbeddingService] Ollama unreachable at '{_OLLAMA_EMBED_URL}' "
            f"after {_MAX_RETRIES} attempt(s). Last error: {last_error}"
        ) from last_error

    @staticmethod
    def _execute_request(request: urllib.request.Request) -> list[float]:
        """
        Execute a single HTTP request to Ollama and parse the response.

        Parameters
        ----------
        request:
            Pre-built ``urllib.request.Request`` object.

        Returns
        -------
        list[float]
            Validated embedding vector from the Ollama response.

        Raises
        ------
        TimeoutError
            If the request does not complete within ``_REQUEST_TIMEOUT_SECONDS``.
        RuntimeError
            If the response body is empty, unparseable, or missing the
            ``"embedding"`` key.
        """
        try:
            with urllib.request.urlopen(
                request,
                timeout=_REQUEST_TIMEOUT_SECONDS,
            ) as response:
                raw_body = response.read()

        except TimeoutError as exc:
            raise TimeoutError(
                f"[EmbeddingService] Request timed out after "
                f"{_REQUEST_TIMEOUT_SECONDS}s. Is Ollama running?"
            ) from exc

        # Parse response body.
        if not raw_body:
            raise RuntimeError(
                "[EmbeddingService] Ollama returned an empty response body."
            )

        try:
            data = json.loads(raw_body)
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                f"[EmbeddingService] Failed to parse Ollama JSON response: {exc}"
            ) from exc

        return EmbeddingService._extract_vector(data)

    @staticmethod
    def _extract_vector(data: dict) -> list[float]:
        """
        Extract and validate the embedding vector from the parsed Ollama
        response body.

        The Ollama ``/api/embeddings`` endpoint returns:

        .. code-block:: json

            { "embedding": [0.123, -0.456, ...] }

        Parameters
        ----------
        data:
            Parsed JSON dict from Ollama.

        Returns
        -------
        list[float]
            Validated 768-dimensional embedding vector.

        Raises
        ------
        RuntimeError
            If the ``"embedding"`` key is absent, empty, or not a list of
            floats with the expected dimensionality.
        """
        embedding = data.get("embedding")

        if embedding is None:
            raise RuntimeError(
                "[EmbeddingService] Ollama response missing 'embedding' key. "
                f"Keys present: {list(data.keys())}"
            )

        if not isinstance(embedding, list) or len(embedding) == 0:
            raise RuntimeError(
                "[EmbeddingService] 'embedding' field is empty or not a list."
            )

        if len(embedding) != EmbeddingService.VECTOR_DIMENSION:
            raise RuntimeError(
                f"[EmbeddingService] Expected {EmbeddingService.VECTOR_DIMENSION}"
                f"-dim vector, got {len(embedding)}-dim. "
                f"Check that the correct model is loaded in Ollama."
            )

        # Ensure all elements are numeric (guard against partial responses).
        try:
            vector = [float(v) for v in embedding]
        except (TypeError, ValueError) as exc:
            raise RuntimeError(
                f"[EmbeddingService] Non-numeric value in embedding vector: {exc}"
            ) from exc

        return vector


# ---------------------------------------------------------------------------
# __main__ – smoke test
# ---------------------------------------------------------------------------

if __name__ == "__main__":  # pragma: no cover
    import sys

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%H:%M:%S",
    )

    test_text = "Hello World"

    print()
    print("=" * 60)
    print("EmbeddingService - smoke test")
    print("=" * 60)
    print(f"Model     : {EmbeddingService.MODEL_NAME}")
    print(f"Endpoint  : {_OLLAMA_EMBED_URL}")
    print(f"Input     : '{test_text}'")
    print()

    try:
        vector = EmbeddingService.embed(test_text)
    except ConnectionError as exc:
        print(f"CONNECTION ERROR: {exc}")
        print()
        print("Make sure Ollama is running:")
        print("  ollama serve")
        print(f"  ollama pull {EmbeddingService.MODEL_NAME}")
        sys.exit(1)
    except Exception as exc:
        print(f"ERROR: {exc}")
        sys.exit(1)

    print(f"Vector dimension  : {len(vector)}")
    print(f"First 10 values   : {[round(v, 6) for v in vector[:10]]}")
    print(f"Min value         : {min(vector):.6f}")
    print(f"Max value         : {max(vector):.6f}")
    print()

    sys.exit(0)