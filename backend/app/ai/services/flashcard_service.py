"""
Aptora - Flashcard Service

Responsible for:
1. Retrieve relevant study material
2. Build flashcard generation prompt
3. Generate flashcards using the LLM
"""

from __future__ import annotations

import logging

from app.ai.agents.flashcard import FlashcardAgent
from app.ai.rag.rag_service import RAGService
from app.ai.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class FlashcardService:
    """
    Service responsible for generating flashcards
    from uploaded study resources.
    """

    DEFAULT_REQUEST = (
        "Generate flashcards from the uploaded study material."
    )

    @classmethod
    def generate(
        cls,
        workspace_id: int,
        question: str = DEFAULT_REQUEST,
    ) -> str:
        """
        Generate flashcards from the most relevant study material.
        """

        logger.info(
            "Generating flashcards | workspace=%s",
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

        agent = FlashcardAgent()

        prompt = agent.build_prompt(context)

        flashcards = LLMService.generate(prompt)

        logger.info(
            "Flashcards generated successfully."
        )

        return flashcards