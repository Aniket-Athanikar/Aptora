"""
ExamForge AI - Search Service

Responsible for:
1. Generate query embeddings
2. Perform semantic vector search
3. Apply workspace/subject filters
4. Format retrieved chunks for the RAG pipeline
"""

from __future__ import annotations

import logging
from typing import Any

from qdrant_client.http.models import (
    Filter,
    FieldCondition,
    MatchValue,
    ScoredPoint,
)

from app.ai.services.embedding_service import EmbeddingService
from app.ai.services.qdrant_service import QdrantService

logger = logging.getLogger(__name__)


class SearchService:
    """
    Service responsible for semantic retrieval from Qdrant.
    """

    DEFAULT_LIMIT = 5

    # ==========================================================
    # Public Methods
    # ==========================================================

    @classmethod
    def search(
        cls,
        workspace_id: int,
        question: str,
        limit: int = DEFAULT_LIMIT,
    ) -> list[dict[str, Any]]:
        """
        Perform semantic search within a workspace.
        """

        logger.info(
            "Searching workspace #%s",
            workspace_id,
        )

        return cls._search(
            question=question,
            limit=limit,
            search_filter=cls._build_workspace_filter(
                workspace_id
            ),
        )

    @classmethod
    def search_by_subject(
        cls,
        workspace_id: int,
        question: str,
        subject: str,
        limit: int = DEFAULT_LIMIT,
    ) -> list[dict[str, Any]]:
        """
        Perform semantic search limited to a subject.
        """

        logger.info(
            "Searching subject '%s' in workspace #%s",
            subject,
            workspace_id,
        )

        search_filter = Filter(
            must=[
                FieldCondition(
                    key="workspace_id",
                    match=MatchValue(value=workspace_id),
                ),
                FieldCondition(
                    key="subject",
                    match=MatchValue(value=subject),
                ),
            ]
        )

        return cls._search(
            question=question,
            limit=limit,
            search_filter=search_filter,
        )

    # ==========================================================
    # Internal Search
    # ==========================================================

    @classmethod
    def _search(
        cls,
        question: str,
        limit: int,
        search_filter: Filter,
    ) -> list[dict[str, Any]]:
        """
        Internal semantic search implementation.
        """

        if not question.strip():

            logger.warning(
                "Empty search query received."
            )

            return []

        # --------------------------------------------------
        # Generate Embedding
        # --------------------------------------------------

        try:

            embedding = EmbeddingService.generate(
                question
            )

            logger.info(
                "Embedding generated (%d dimensions).",
                len(embedding),
            )

        except Exception:

            logger.exception(
                "Failed to generate embedding."
            )

            return []

        # --------------------------------------------------
        # Search Qdrant
        # --------------------------------------------------

        try:

            results = QdrantService.search(
                embedding=embedding,
                limit=limit,
                query_filter=search_filter,
            )

            logger.info(
                "Retrieved %d chunk(s).",
                len(results),
            )

        except Exception:

            logger.exception(
                "Semantic search failed."
            )

            return []

        return cls._format_results(results)

    # ==========================================================
    # Filter Builders
    # ==========================================================

    @staticmethod
    def _build_workspace_filter(
        workspace_id: int,
    ) -> Filter:
        """
        Build a workspace filter.
        """

        return Filter(
            must=[
                FieldCondition(
                    key="workspace_id",
                    match=MatchValue(
                        value=workspace_id,
                    ),
                )
            ]
        )

    # ==========================================================
    # Result Formatter
    # ==========================================================

    @staticmethod
    def _format_results(
        results: list[ScoredPoint],
    ) -> list[dict[str, Any]]:
        """
        Convert Qdrant search results into dictionaries.
        """

        formatted_results: list[dict[str, Any]] = []

        for point in results:

            payload = point.payload or {}

            formatted_results.append(
                {
                    "score": round(point.score, 4),
                    "chunk_id": payload.get("chunk_id"),
                    "resource_id": payload.get("resource_id"),
                    "chunk_index": payload.get("chunk_index"),
                    "subject": payload.get("subject"),
                    "chapter": payload.get("chapter"),
                    "topic": payload.get("topic"),
                    "page_number": payload.get("page_number"),
                    "content": payload.get("content"),
                    "document_title": payload.get("document_title"),
                }
            )

        return formatted_results