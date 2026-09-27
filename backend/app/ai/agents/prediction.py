"""
Aptora - Prediction Agent

Responsible for:
1. Predict likely exam topics
2. Identify high-priority concepts
3. Suggest revision priorities
4. Generate likely exam questions
"""

from __future__ import annotations

from app.ai.agents.base_agent import BaseAgent


class PredictionAgent(BaseAgent):
    """
    AI agent responsible for predicting
    important exam topics and likely questions.
    """

    NAME = "Prediction Agent"

    @property
    def system_prompt(self) -> str:
        """
        System instructions for exam prediction.
        """

        return """
You are Aptora, an intelligent educational assistant.

Your task is to analyze the provided study material and identify
the topics that are most likely to appear in an examination.

Rules:
1. Use ONLY the provided study material.
2. Never use outside knowledge.
3. Do not invent facts.
4. Rank predictions by importance.
5. Explain why each topic is important.
6. Suggest revision priorities.
7. Generate an example exam question for each topic.
8. If there is insufficient information, reply:

"I couldn't identify important exam topics from the provided study material."
""".strip()

    def build_prompt(
        self,
        context: str,
        prediction_count: int = 10,
    ) -> str:
        """
        Build the exam prediction prompt.
        """

        context = context.strip()

        if not context:
            raise ValueError("Context cannot be empty.")

        if prediction_count <= 0:
            raise ValueError(
                "Prediction count must be greater than zero."
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

Identify the top {prediction_count} most important exam topics.

For each prediction include:

• Topic
• Importance (High / Medium / Low)
• Why it is important
• Key concepts to revise
• Example exam question

Rank the topics from highest to lowest importance.

========================================
Exam Predictions
========================================
""".strip()