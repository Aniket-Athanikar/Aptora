"""Canonical semantic retrieval contract for ExamForge RAG."""

from __future__ import annotations

import logging
import re
from typing import Any

from qdrant_client.http.models import Filter, FieldCondition, MatchAny, MatchValue, ScoredPoint

from app.ai.services.embedding_service import EmbeddingService
from app.ai.services.qdrant_service import QdrantService

logger = logging.getLogger(__name__)


class RetrievalUnavailable(RuntimeError):
    """Raised when embedding or vector search infrastructure is unavailable."""


class SearchService:
    # Wide semantic candidate pool fetched from Qdrant before local reranking.
    # This stays large so the reranker has enough material to choose from.
    CANDIDATE_LIMIT = 12

    # Final number of chunks handed to the LLM after reranking + filtering.
    DEFAULT_LIMIT = 5

    # Blended score floor (vector + keyword + metadata). Chunks below this
    # are treated as noise, not context -- forwarding them as "study
    # material" is what causes a small model to correctly refuse, since the
    # material genuinely doesn't answer the question.
    MIN_RELEVANCE_SCORE = 0.20

    @classmethod
    def search(
        cls, workspace_id: int, question: str, limit: int = DEFAULT_LIMIT,
        subject_id: int | None = None, resource_types: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        if not question or not question.strip():
            return []
        query_filter = cls._build_filter(workspace_id, subject_id, resource_types)
        logger.info(
            "[SearchService] query=%r workspace_id=%s subject_id=%s resource_types=%s filter=%s",
            question[:200], workspace_id, subject_id, resource_types, query_filter,
        )
        try:
            embedding = EmbeddingService.embed(question, is_query=True)
            logger.info("[SearchService] Generated %d-dimensional query embedding using %s.", len(embedding), EmbeddingService.MODEL_NAME)
            candidate_limit = max(cls.CANDIDATE_LIMIT, limit * 2)
            results = QdrantService.search(embedding=embedding, limit=candidate_limit, query_filter=query_filter)

            # Progressive filter relaxation if 0 results returned with strict resource_types filter
            if not results and resource_types:
                logger.warning(
                    "[SearchService] 0 results with strict resource_types=%s. Retrying without resource_types filter...",
                    resource_types,
                )
                relaxed_filter = cls._build_filter(workspace_id, subject_id, resource_types=None)
                results = QdrantService.search(embedding=embedding, limit=candidate_limit, query_filter=relaxed_filter)

            # Second fallback: if subject_id filter also caused 0 results, retry with workspace_id only
            if not results and subject_id is not None:
                logger.warning(
                    "[SearchService] 0 results with subject_id=%s. Retrying with workspace_id=%s only...",
                    subject_id, workspace_id,
                )
                workspace_filter = cls._build_filter(workspace_id, subject_id=None, resource_types=None)
                results = QdrantService.search(embedding=embedding, limit=candidate_limit, query_filter=workspace_filter)

            if not results:
                cls._log_retrieval_diagnostics(workspace_id, subject_id, resource_types)

        except Exception as exc:
            logger.exception("[SearchService] Semantic search failed.")
            raise RetrievalUnavailable("Embedding or vector search is unavailable.") from exc

        reranked = cls._rerank(cls._format_results(results), question, subject_id, resource_types)
        formatted = cls._select_relevant(reranked, limit)

        logger.info("[SearchService] Top %d selected chunks: %s", len(formatted), [
            {"document": item["document_title"], "type": item["resource_type"], "score": item["score"], "page": item["page_number"]}
            for item in formatted
        ])
        return formatted

    @classmethod
    def _log_retrieval_diagnostics(cls, workspace_id: int, subject_id: int | None, resource_types: list[str] | None) -> None:
        """Run diagnostics to explain why 0 chunks were retrieved."""
        try:
            client = QdrantService.get_client()
            col = QdrantService.COLLECTION_NAME
            total_cnt = client.count(collection_name=col, exact=True).count
            if total_cnt == 0:
                logger.error("[SearchService Diagnostic] ZERO CHUNKS: Collection '%s' has 0 vectors indexed!", col)
                return

            ws_cnt = client.count(
                collection_name=col,
                count_filter=Filter(must=[FieldCondition(key="workspace_id", match=MatchValue(value=workspace_id))]),
                exact=True,
            ).count
            if ws_cnt == 0:
                logger.error("[SearchService Diagnostic] ZERO CHUNKS: Workspace mismatch! workspace_id=%s has 0 vectors in Qdrant (Total vectors: %d).", workspace_id, total_cnt)
                return

            if subject_id is not None:
                subj_cnt = client.count(
                    collection_name=col,
                    count_filter=Filter(must=[
                        FieldCondition(key="workspace_id", match=MatchValue(value=workspace_id)),
                        FieldCondition(key="subject_id", match=MatchValue(value=subject_id)),
                    ]),
                    exact=True,
                ).count
                if subj_cnt == 0:
                    logger.error("[SearchService Diagnostic] ZERO CHUNKS: Subject mismatch! workspace_id=%s, subject_id=%s has 0 vectors in Qdrant.", workspace_id, subject_id)
                    return

            logger.error(
                "[SearchService Diagnostic] ZERO CHUNKS: Query embedding had low similarity score across all %d matching workspace vectors.",
                ws_cnt,
            )
        except Exception as diag_err:
            logger.debug("[SearchService Diagnostic] Error running diagnostics: %s", diag_err)

    @classmethod
    def search_by_subject(cls, workspace_id: int, question: str, subject: str, limit: int = DEFAULT_LIMIT) -> list[dict[str, Any]]:
        # Kept for compatibility. Names were never stored consistently; callers
        # should use integer subject_id through search().
        logger.warning("[SearchService] search_by_subject(name=%r) is legacy; applying workspace-only retrieval.", subject)
        return cls.search(workspace_id, question, limit)

    @staticmethod
    def _build_filter(workspace_id: int, subject_id: int | None, resource_types: list[str] | None) -> Filter:
        must = [FieldCondition(key="workspace_id", match=MatchValue(value=workspace_id))]
        if subject_id is not None:
            must.append(FieldCondition(key="subject_id", match=MatchValue(value=subject_id)))
        if resource_types:
            must.append(FieldCondition(key="resource_type", match=MatchAny(any=resource_types)))
        return Filter(must=must)

    @staticmethod
    def _format_results(results: list[ScoredPoint]) -> list[dict[str, Any]]:
        return [
            {
                "score": round(point.score, 4),
                "chunk_id": payload.get("chunk_id") or str(point.id),
                "resource_id": payload.get("resource_id"),
                "chunk_index": payload.get("chunk_index"),
                "subject_id": payload.get("subject_id"),
                "subject": payload.get("subject"),
                "chapter": payload.get("chapter"),
                "topic": payload.get("topic"),
                "page_number": payload.get("page_number"),
                # New points store content; old points used chunk_text.
                "content": payload.get("content") or payload.get("chunk_text", ""),
                "document_title": payload.get("document_title") or "Uploaded Resource",
                "resource_type": payload.get("resource_type"),
            }
            for point in results
            for payload in [point.payload or {}]
        ]

    @staticmethod
    def _rerank(
        chunks: list[dict[str, Any]], question: str, subject_id: int | None,
        resource_types: list[str] | None,
    ) -> list[dict[str, Any]]:
        """Blend vector similarity with inexpensive lexical and metadata signals."""
        query_terms = set(re.findall(r"[a-z0-9]+", question.lower()))
        query_terms.difference_update({"what", "which", "with", "from", "about", "explain", "describe", "tell", "please"})
        for chunk in chunks:
            searchable = " ".join(str(chunk.get(field) or "") for field in (
                "content", "document_title", "chapter", "topic", "subject"
            )).lower()
            terms = set(re.findall(r"[a-z0-9]+", searchable))
            keyword_score = len(query_terms & terms) / max(1, len(query_terms))
            metadata_bonus = 0.0
            if subject_id is not None and chunk.get("subject_id") == subject_id:
                metadata_bonus += 0.05
            if resource_types and chunk.get("resource_type") in resource_types:
                metadata_bonus += 0.03
            if chunk.get("document_title") and chunk.get("page_number") is not None:
                metadata_bonus += 0.02
            vector_score = float(chunk.get("score") or 0.0)
            chunk["vector_score"] = round(vector_score, 4)
            chunk["keyword_score"] = round(keyword_score, 4)
            chunk["score"] = round((0.65 * vector_score) + (0.30 * keyword_score) + metadata_bonus, 4)
        return sorted(chunks, key=lambda item: item["score"], reverse=True)

    @classmethod
    def _select_relevant(cls, chunks: list[dict[str, Any]], limit: int) -> list[dict[str, Any]]:
        """Cut the reranked pool down to chunks actually worth showing the LLM.

        A chunk can win the vector-similarity race against 11 other candidates
        while still having nothing to do with the question (e.g. matching a
        query term against an unrelated chapter on embedding proximity
        alone). Forwarding those as "context" is what makes a small model
        refuse to answer -- it's reading material that doesn't cover the
        question and correctly says so. Filtering here means the LLM only
        ever sees chunks that cleared both a similarity bar and a
        keyword-overlap bar.
        """
        if not chunks:
            return []

        relevant = [c for c in chunks if c["score"] >= cls.MIN_RELEVANCE_SCORE]
        if not relevant:
            logger.info(
                "[SearchService] All %d candidates fell below MIN_RELEVANCE_SCORE=%.2f; "
                "treating as no relevant material found.",
                len(chunks), cls.MIN_RELEVANCE_SCORE,
            )
            return []

        # Guard against a lucky top-1 dragging in a long, weak tail of
        # candidates that only barely cleared the floor.
        top_score = relevant[0]["score"]
        relevant = [c for c in relevant if c["score"] >= top_score * 0.5]

        final_count = max(1, min(limit or cls.DEFAULT_LIMIT, 5))
        return relevant[:final_count]
