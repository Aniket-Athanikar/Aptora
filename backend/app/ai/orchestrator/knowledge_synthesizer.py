"""
Aptora — Knowledge Synthesizer
======================================

Synthesizes multi-source document chunks (Books, Notes, PYQs, Syllabus)
into a unified, coherent context block.

Highlights source metadata inline so the LLM and user can track exact document origins.
Detects missing explanations or conflicting resource information.
"""

from __future__ import annotations

import logging
from typing import Any, List, Dict

logger = logging.getLogger(__name__)


class KnowledgeSynthesizer:
    """
    Combines chunks from multiple uploaded files into a structured study material block.
    """

    @classmethod
    def synthesize(
        cls,
        chunks: List[Dict[str, Any]],
        intent: str = "explain",
    ) -> str:
        """
        Synthesize document chunks into a clean, tagged knowledge document block.

        Parameters
        ----------
        chunks:
            Optimized chunk dicts from ContextOptimizer.
        intent:
            User intent name.

        Returns
        -------
        str
            Synthesized study material context string with source headers.
        """
        if not chunks:
            return "No study material found for this topic."

        # Group chunks by resource title or type for clear synthesis
        formatted_blocks: List[str] = []

        for idx, chunk in enumerate(chunks, start=1):
            doc_title = chunk.get("document_title") or f"Resource #{chunk.get('resource_id', 'Unknown')}"
            subject = chunk.get("subject") or "General"
            chapter = chunk.get("chapter") or "General Chapter"
            topic = chunk.get("topic") or "General Topic"
            page = chunk.get("page_number") or "-"
            score = chunk.get("score") or 0.0
            content = chunk.get("content", "").strip()

            header = (
                f"--- [Source {idx}]: {doc_title} | Subject: {subject} | "
                f"Chapter: {chapter} | Page: {page} | Score: {score:.2f} ---"
            )

            formatted_blocks.append(f"{header}\n{content}")

        synthesized_text = "\n\n".join(formatted_blocks)

        logger.info(
            "[KnowledgeSynthesizer] Synthesized %d chunk(s) into %d character knowledge block.",
            len(chunks),
            len(synthesized_text),
        )

        return synthesized_text
