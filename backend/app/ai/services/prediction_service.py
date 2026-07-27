"""
ExamForge AI - Prediction Service

Responsible for:
1. Retrieve relevant study material
2. Build exam prediction prompt
3. Generate AI-based exam predictions
"""

from __future__ import annotations

import logging

from app.ai.agents.prediction import PredictionAgent
from app.ai.rag.rag_service import RAGService
from app.ai.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class PredictionService:
    """
    Service responsible for generating
    exam predictions from uploaded study material.
    """

    DEFAULT_REQUEST = (
        "Predict the most important topics from the uploaded study material."
    )

    @classmethod
    def generate(
        cls,
        workspace_id: int,
        question: str = DEFAULT_REQUEST,
    ) -> str:
        """
        Generate exam predictions.
        """

        logger.info(
            "Generating predictions | workspace=%s",
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

        agent = PredictionAgent()

        prompt = agent.build_prompt(
            context=context,
        )

        predictions = LLMService.generate(
            prompt
        )

        logger.info(
            "Predictions generated successfully."
        )

        return predictions