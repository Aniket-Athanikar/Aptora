"""
ExamForge AI - Retriever

Responsible for:
1. Retrieving relevant chunks from the vector database
2. Delegating semantic search to SearchService
3. Returning ranked chunks for the RAG pipeline
"""

from __future__ import annotations

import logging
from typing import Any

from app.ai.services.search_service import SearchService

logger = logging.getLogger(__name__)


class Retriever:
    """
    Retrieves the most relevant document chunks for a query.
    """

    DEFAULT_LIMIT = 12

    @classmethod
    def retrieve(
        cls,
        workspace_id: int,
        question: str,
        limit: int | None = None,
        subject_id: int | None = None,
        resource_types: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """
        Retrieve relevant chunks for a user question.

        Args:
            workspace_id: Workspace to search within.
            question: User's query.
            limit: Maximum number of chunks to retrieve.

        Returns:
            Ranked list of document chunks.
        """

        if not question or not question.strip():
            raise ValueError("Question cannot be empty.")

        top_k = limit or cls.DEFAULT_LIMIT

        logger.info(
            "Retrieving chunks | workspace=%s | top_k=%s",
            workspace_id,
            top_k,
        )

        chunks = SearchService.search(
            workspace_id=workspace_id,
            question=question,
            limit=top_k,
            subject_id=subject_id,
            resource_types=resource_types,
        )

        logger.info(
            "Retrieved %d chunk(s).",
            len(chunks),
        )

        return chunks

    @classmethod
    def retrieve_by_subject(
        cls,
        workspace_id: int,
        question: str,
        subject: str,
        limit: int | None = None,
    ) -> list[dict[str, Any]]:
        """
        Retrieve chunks restricted to a subject.
        """

        if not question or not question.strip():
            raise ValueError("Question cannot be empty.")

        top_k = limit or cls.DEFAULT_LIMIT

        logger.info(
            "Retrieving subject chunks | workspace=%s | subject=%s",
            workspace_id,
            subject,
        )

        chunks = SearchService.search_by_subject(
            workspace_id=workspace_id,
            question=question,
            subject=subject,
            limit=top_k,
        )

        logger.info(
            "Retrieved %d subject chunk(s).",
            len(chunks),
        )

        return chunks

    @classmethod
    def retrieve_with_confidence(
        cls,
        workspace_id: int,
        question: str,
        limit: int | None = None,
    ) -> tuple[list[dict[str, Any]], Any]:
        """
        Retrieve chunks and return confidence scoring metadata.

        Returns:
            tuple: (chunks, ConfidenceResult)
        """
        from app.ai.rag.confidence_scorer import ConfidenceScorer

        chunks = cls.retrieve(
            workspace_id=workspace_id,
            question=question,
            limit=limit,
        )

        confidence_result = ConfidenceScorer.score(chunks)
        return chunks, confidence_result
