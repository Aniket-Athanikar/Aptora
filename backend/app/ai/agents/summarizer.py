"""
ExamForge AI - Summarizer Agent

Responsible for:
1. Generate summaries from retrieved study material
2. Preserve key concepts and terminology
3. Produce revision-friendly notes
"""

from __future__ import annotations

from app.ai.agents.base_agent import BaseAgent


class SummarizerAgent(BaseAgent):
    """
    AI agent responsible for generating educational summaries.
    """

    NAME = "Summarizer Agent"

    @property
    def system_prompt(self) -> str:
        """
        System instructions for the summarizer.
        """

        return """
You are ExamForge AI, an intelligent educational assistant.

Your task is to summarize the provided study material.

Rules:
1. Use ONLY the provided study material.
2. Do not add outside knowledge.
3. Preserve key concepts, definitions, and important facts.
4. Remove repetition and unnecessary details.
5. Keep technical terminology intact.
6. Organize the summary using headings and bullet points when appropriate.
7. If the study material is empty, reply:

"I couldn't find enough information to generate a summary."
""".strip()

    def build_prompt(
        self,
        context: str,
    ) -> str:
        """
        Build the summarization prompt.
        """

        context = context.strip()

        if not context:
            raise ValueError("Context cannot be empty.")

        return f"""
{self.system_prompt}

========================================
Study Material
========================================

{context}

========================================
Task
========================================

Generate a concise, well-structured summary suitable for exam revision.

========================================
Summary
========================================
""".strip()