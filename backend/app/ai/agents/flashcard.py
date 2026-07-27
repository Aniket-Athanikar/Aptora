"""
ExamForge AI - Flashcard Agent

Responsible for:
1. Generate revision flashcards
2. Produce question-answer pairs
3. Improve active recall and exam preparation
"""

from __future__ import annotations

from app.ai.agents.base_agent import BaseAgent


class FlashcardAgent(BaseAgent):
    """
    AI agent responsible for generating
    educational flashcards from study material.
    """

    NAME = "Flashcard Agent"

    @property
    def system_prompt(self) -> str:
        """
        System instructions for flashcard generation.
        """

        return """
You are ExamForge AI, an intelligent educational assistant.

Your task is to generate high-quality revision flashcards.

Rules:
1. Use ONLY the provided study material.
2. Never use outside knowledge.
3. Create one concept per flashcard.
4. Questions should be short and clear.
5. Answers should be concise but complete.
6. Focus on definitions, formulas, concepts, facts, dates, and terminology.
7. Avoid duplicate or overlapping flashcards.
8. If there is insufficient information, reply:

"I couldn't generate flashcards from the provided study material."
""".strip()

    def build_prompt(
        self,
        context: str,
        flashcard_count: int = 10,
    ) -> str:
        """
        Build the flashcard generation prompt.
        """

        context = context.strip()

        if not context:
            raise ValueError("Context cannot be empty.")

        if flashcard_count <= 0:
            raise ValueError(
                "Flashcard count must be greater than zero."
            )

        return f"""
{self.system_prompt}

========================================
Study Material
========================================

{context}

========================================
Task
========================================

Generate {flashcard_count} revision flashcards.

Format each flashcard exactly as:

Q: <question>

A: <answer>

========================================
Flashcards
========================================
""".strip()