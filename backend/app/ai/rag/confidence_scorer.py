"""
Aptora — Retrieval Confidence Scorer
============================================

Analyses Qdrant search results to produce a confidence level
and source attribution metadata.

Confidence Levels
-----------------
- ``"high"``   — avg score ≥ 0.70  (strong match from study material)
- ``"medium"`` — avg score ≥ 0.45  (partial match)
- ``"low"``    — avg score < 0.45  (weak match; LLM may need to generalise)
- ``"none"``   — no chunks retrieved at all

This module has Phase 4E scope but is created early because
KnowledgeChatService depends on it.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


# ---------------------------------------------------------------------------
# Thresholds
# ---------------------------------------------------------------------------

_THRESHOLD_HIGH: float   = 0.70
_THRESHOLD_MEDIUM: float = 0.45


# ---------------------------------------------------------------------------
# Result dataclass
# ---------------------------------------------------------------------------


@dataclass
class ConfidenceResult:
    """
    Output of ``ConfidenceScorer.score()``.

    Attributes
    ----------
    level:
        "high" | "medium" | "low" | "none"
    avg_score:
        Mean similarity score across all retrieved chunks.
        0.0 when no chunks are retrieved.
    sources:
        List of source metadata dicts for the frontend to display
        (document title, page, score).
    """

    level: str
    avg_score: float
    sources: list[dict[str, Any]] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Scorer
# ---------------------------------------------------------------------------


class ConfidenceScorer:
    """
    Scores the quality of a retrieval result and extracts source metadata.

    Usage
    -----
    ::

        result = ConfidenceScorer.score(chunks)
        # result.level    → "high" | "medium" | "low" | "none"
        # result.sources  → [{title, page, score, subject, resource_id}]
    """

    @classmethod
    def score(
        cls,
        chunks: list[dict[str, Any]],
    ) -> ConfidenceResult:
        """
        Compute the confidence level from a list of formatted chunk dicts.

        Parameters
        ----------
        chunks:
            The output of ``SearchService._format_results()`` — dicts
            with keys: ``score``, ``resource_id``, ``content``,
            ``document_title``, ``subject``, ``chapter``, ``page_number``.

        Returns
        -------
        ConfidenceResult
        """
        if not chunks:
            return ConfidenceResult(level="none", avg_score=0.0, sources=[])

        scores = [c.get("score", 0.0) for c in chunks]
        avg_score = sum(scores) / len(scores)

        if avg_score >= _THRESHOLD_HIGH:
            level = "high"
        elif avg_score >= _THRESHOLD_MEDIUM:
            level = "medium"
        else:
            level = "low"

        sources = [
            {
                "resource_id":     c.get("resource_id"),
                "document_title":  c.get("document_title") or "Uploaded Resource",
                "subject":         c.get("subject") or "Unknown",
                "chapter":         c.get("chapter"),
                "page_number":     c.get("page_number"),
                "score":           round(c.get("score", 0.0), 4),
            }
            for c in chunks
        ]

        return ConfidenceResult(
            level=level,
            avg_score=round(avg_score, 4),
            sources=sources,
        )
