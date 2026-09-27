"""
Aptora - Question Service

Responsible for:
1. Retrieve relevant study material
2. Build question generation prompt
3. Generate practice questions using the LLM
"""

from __future__ import annotations

import logging

from app.ai.agents.question_generator import QuestionGeneratorAgent
from app.ai.rag.rag_service import RAGService
from app.ai.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class QuestionService:
    """
    Service responsible for generating practice
    questions from uploaded study resources.
    """

    DEFAULT_REQUEST = (
        "Generate practice questions from the uploaded study material."
    )

    @classmethod
    def generate(
        cls,
        workspace_id: int,
        question: str = DEFAULT_REQUEST,
        question_type: str = "mcq",
        count: int = 10,
    ) -> str:
        """
        Generate practice questions.
        """

        logger.info(
            "Generating %s questions | workspace=%s | count=%s",
            question_type,
            workspace_id,
            count,
        )

        context = RAGService.build_context(
            workspace_id=workspace_id,
            question=question,
        )

        if not context:
            raise ValueError(
                "No study material found."
            )

        agent = QuestionGeneratorAgent()

        prompt = agent.build_prompt(
            context=context,
            question_type=question_type,
            count=count,
        )

        questions = LLMService.generate(prompt)

        logger.info(
            "Questions generated successfully."
        )

        return questions