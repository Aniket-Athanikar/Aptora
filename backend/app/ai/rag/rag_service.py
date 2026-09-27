"""
Aptora - RAG Service

High-level orchestration for the Retrieval-Augmented
Generation (RAG) pipeline.

Responsibilities:
1. Retrieve relevant chunks
2. Build context
3. Build final LLM prompt
"""

import logging

from app.ai.rag.context_builder import ContextBuilder
from app.ai.rag.prompt_builder import PromptBuilder
from app.ai.rag.retriever import Retriever

logger = logging.getLogger(__name__)


class RAGService:
    """
    Coordinates the complete RAG pipeline.
    """

    @classmethod
    def build_context(
        cls,
        workspace_id: int,
        question: str,
    ) -> str:
        """
        Retrieve document chunks and build the
        formatted context supplied to the LLM.
        """

        logger.info(
            "Building context | workspace=%s",
            workspace_id,
        )

        chunks = Retriever.retrieve(
            workspace_id=workspace_id,
            question=question,
        )

        return ContextBuilder.build(chunks)

    @classmethod
    def build_prompt(
        cls,
        workspace_id: int,
        question: str,
    ) -> str:
        """
        Build the final prompt for the language model.
        """

        context = cls.build_context(
            workspace_id=workspace_id,
            question=question,
        )

        prompt = PromptBuilder.build(
            question=question,
            context=context,
        )

        logger.info(
            "RAG prompt generated successfully."
        )

        return prompt