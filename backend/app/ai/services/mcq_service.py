"""
ExamForge AI — MCQ Service
============================

Orchestrates structured MCQ generation:
1. Retrieves document context via RAG
2. Invokes MCQAgent with prompt
3. Parses JSON into structured dictionaries
4. Validates and returns structured quiz data
"""

from __future__ import annotations

import logging
from typing import Any

from app.ai.agents.mcq_agent import MCQAgent
from app.ai.rag.context_builder import ContextBuilder
from app.ai.rag.retriever import Retriever

logger = logging.getLogger(__name__)

_agent = MCQAgent()


class MCQService:
    """
    High-level service for generating interactive MCQs.
    """

    @classmethod
    def generate(
        cls,
        workspace_id: int,
        topic: str | None = None,
        count: int = 5,
        difficulty: str = "medium",
    ) -> dict[str, Any]:
        """
        Generate structured MCQs for a workspace.

        Parameters
        ----------
        workspace_id:
            Target workspace ID.
        topic:
            Optional focus topic or search query.
        count:
            Number of MCQs requested.
        difficulty:
            "easy", "medium", or "hard".

        Returns
        -------
        dict with keys: ``questions`` (list of dicts), ``count``, ``workspace_id``
        """
        query = topic if topic and topic.strip() else "key concepts, definitions, formulas, and principles"

        logger.info(
            "[MCQService] Generating %d MCQs | workspace=%d | topic='%s' | difficulty=%s",
            count,
            workspace_id,
            query,
            difficulty,
        )

        chunks = Retriever.retrieve(
            workspace_id=workspace_id,
            question=query,
            limit=10,
        )

        if not chunks:
            logger.warning("[MCQService] No chunks retrieved for workspace %d", workspace_id)
            return {
                "workspace_id": workspace_id,
                "topic": topic,
                "count": 0,
                "questions": [],
            }

        context = ContextBuilder.build(chunks)

        raw_llm_response = _agent.generate(
            context=context,
            count=count,
            difficulty=difficulty,
        )

        mcqs = MCQAgent.parse_mcq_json(raw_llm_response)

        logger.info(
            "[MCQService] Successfully parsed %d valid MCQ(s) from LLM output.",
            len(mcqs),
        )

        return {
            "workspace_id": workspace_id,
            "topic": topic,
            "count": len(mcqs),
            "questions": mcqs,
        }
