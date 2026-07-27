"""
ExamForge AI - Summary Service

Responsible for:
1. Retrieve relevant study material
2. Build summarization prompt
3. Generate AI summary
"""

from __future__ import annotations

import logging

from app.ai.agents.summarizer import SummarizerAgent
from app.ai.rag.rag_service import RAGService
from app.ai.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class SummaryService:
    """
    Service responsible for generating summaries
    from uploaded study resources.
    """

    @classmethod
    def generate(
        cls,
        workspace_id: int,
        question: str = "Summarize the uploaded study material.",
    ) -> str:

        logger.info(
            "Generating summary | workspace=%s",
            workspace_id,
        )

        context = RAGService.build_context(
            workspace_id=workspace_id,
            question=question,
        )

        if not context:
            raise ValueError(
                "No study material found."
            )

        agent = SummarizerAgent()

        prompt = agent.build_prompt(context)

        return LLMService.generate(prompt)