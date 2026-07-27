"""
ExamForge AI - Question Generator Agent

Responsible for:
1. Generate exam-style questions
2. Support multiple question formats
3. Produce educational assessments
"""

from __future__ import annotations

from app.ai.agents.base_agent import BaseAgent


class QuestionGeneratorAgent(BaseAgent):
    """
    AI agent responsible for generating
    exam-style assessment questions.
    """

    NAME = "Question Generator Agent"

    @property
    def system_prompt(self) -> str:
        """
        System instructions for question generation.
        """

        return """
You are ExamForge AI, an intelligent educational assistant.

Your task is to generate exam-style questions from the provided study material.

Rules:
1. Use ONLY the provided study material.
2. Never use outside knowledge.
3. Do not invent facts.
4. Generate clear, educational, and non-duplicate questions.
5. Cover different concepts from the study material.
6. Include the correct answer for every question.
7. If there is insufficient information, reply:

"I couldn't generate questions from the provided study material."
""".strip()

    def build_prompt(
        self,
        context: str,
        question_type: str = "mcq",
        question_count: int = 10,
    ) -> str:
        """
        Build the question generation prompt.
        """

        context = context.strip()

        if not context:
            raise ValueError("Context cannot be empty.")

        if question_count <= 0:
            raise ValueError(
                "Question count must be greater than zero."
            )

        question_type = question_type.lower()

        supported_types = {
            "mcq",
            "true_false",
            "short_answer",
            "long_answer",
            "fill_blank",
            "mixed",
        }

        if question_type not in supported_types:
            raise ValueError(
                f"Unsupported question type: {question_type}"
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

Generate {question_count} {question_type} question(s).

Requirements:

• Use only the provided study material.
• Cover different concepts.
• Avoid duplicate questions.
• Include the correct answer.

For MCQs:
- Four options (A, B, C, D)
- Exactly one correct option
- Brief explanation of the correct answer

For True/False:
- Include the correct answer.

For Short/Long Answer:
- Include a model answer.

For Fill in the Blank:
- Indicate the missing word or phrase.

========================================
Questions
========================================
""".strip()