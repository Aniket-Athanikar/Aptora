"""
ExamForge AI — Retrieval Planner
=================================

Determines optimal document filtering and search strategies based on intent.
Ensures vector search targets the right resource types (e.g. PYQs vs Books vs Notes).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import List, Optional

logger = logging.getLogger(__name__)


@dataclass
class RetrievalPlan:
    """
    Plan detailing search filters, target resource categories, and chunk limits.
    """
    target_resource_types: List[str]
    max_chunks_per_query: int
    total_chunk_budget: int
    subject_filter: Optional[str] = None
    use_multi_query: bool = True


class RetrievalPlanner:
    """
    Formulates retrieval strategy from IntentAnalysisResult and workspace metadata.
    """

    @classmethod
    def plan(
        cls,
        intent: str,
        confidence: float,
        preferred_resource_types: List[str],
        preferred_chunk_limit: int,
        subject: Optional[str] = None,
    ) -> RetrievalPlan:
        """
        Build an optimized RetrievalPlan.

        Parameters
        ----------
        intent:
            Detected user intent string.
        confidence:
            Intent confidence score.
        preferred_resource_types:
            Resource types suggested by IntentAnalyzer.
        preferred_chunk_limit:
            Chunk limit suggested by IntentAnalyzer.
        subject:
            Optional subject filter name.

        Returns
        -------
        RetrievalPlan
        """
        # Ensure fallback resource types if empty
        resource_types = preferred_resource_types if preferred_resource_types else ["book", "notes"]

        # Calculate chunk limits per search query (multi-query retrieval runs 3 queries)
        chunks_per_query = max(3, preferred_chunk_limit // 2)
        total_budget = preferred_chunk_limit * 2  # Total budget before context optimization

        plan = RetrievalPlan(
            target_resource_types=resource_types,
            max_chunks_per_query=chunks_per_query,
            total_chunk_budget=total_budget,
            subject_filter=subject,
            use_multi_query=True,
        )

        logger.info(
            "[RetrievalPlanner] Formulated plan | intent='%s' | targets=%s | total_budget=%d",
            intent,
            resource_types,
            total_budget,
        )

        return plan
