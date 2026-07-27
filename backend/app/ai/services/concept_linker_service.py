"""
ExamForge AI — Cross-Document Concept Linker Service
======================================================

Discovers and connects related concepts across multiple uploaded resources
(Textbooks, Notes, PYQs, Syllabus).

Allows students to see how a specific concept (e.g. "Newton's Second Law",
"Thermodynamics", "Database Normalization") appears across different study materials.
"""

from __future__ import annotations

import logging
from typing import Any

from app.ai.rag.retriever import Retriever

logger = logging.getLogger(__name__)


class ConceptLinkerService:
    """
    Service for mapping concepts across all workspace documents.
    """

    @classmethod
    def generate_concept_map(
        cls,
        workspace_id: int,
        concept: str,
        limit: int = 20,
    ) -> dict[str, Any]:
        """
        Build a cross-document map of where a concept appears.

        Parameters
        ----------
        workspace_id:
            Target workspace ID.
        concept:
            Concept name or topic keyword to map across resources.
        limit:
            Number of chunks to inspect (default 20).

        Returns
        -------
        dict containing concept metadata and occurrences grouped by resource
        """
        concept = concept.strip()
        if not concept:
            raise ValueError("Concept query cannot be empty.")

        logger.info(
            "[ConceptLinkerService] Mapping concept '%s' | workspace=%d | limit=%d",
            concept,
            workspace_id,
            limit,
        )

        chunks = Retriever.retrieve(
            workspace_id=workspace_id,
            question=concept,
            limit=limit,
        )

        if not chunks:
            return {
                "workspace_id": workspace_id,
                "concept": concept,
                "total_occurrences": 0,
                "resources_covered": 0,
                "occurrences_by_resource": [],
            }

        # Group chunks by resource_id
        grouped: dict[int, dict[str, Any]] = {}

        for chunk in chunks:
            res_id = chunk.get("resource_id") or 0
            if res_id not in grouped:
                grouped[res_id] = {
                    "resource_id": res_id,
                    "document_title": chunk.get("document_title") or "Uploaded Resource",
                    "subject": chunk.get("subject") or "General",
                    "chunk_count": 0,
                    "max_similarity_score": 0.0,
                    "snippets": [],
                }

            entry = grouped[res_id]
            entry["chunk_count"] += 1
            score = round(chunk.get("score", 0.0), 4)
            if score > entry["max_similarity_score"]:
                entry["max_similarity_score"] = score

            entry["snippets"].append({
                "chunk_index": chunk.get("chunk_index"),
                "page_number": chunk.get("page_number"),
                "chapter": chunk.get("chapter"),
                "topic": chunk.get("topic"),
                "score": score,
                "content_preview": (chunk.get("content", "")[:250] + "...") if len(chunk.get("content", "")) > 250 else chunk.get("content", ""),
            })

        occurrences = list(grouped.values())
        occurrences.sort(key=lambda x: x["max_similarity_score"], reverse=True)

        return {
            "workspace_id": workspace_id,
            "concept": concept,
            "total_occurrences": len(chunks),
            "resources_covered": len(occurrences),
            "occurrences_by_resource": occurrences,
        }
