"""
ExamForge AI - Chat Agent

Responsible for:
1. Build prompts for conversational Q&A
2. Restrict answers to uploaded study material
3. Define chat-specific AI behavior
"""

from __future__ import annotations

from app.ai.agents.base_agent import BaseAgent


class ChatAgent(BaseAgent):
    """
    AI agent responsible for answering questions
    using retrieved study material.
    """

    NAME = "Chat Agent"

    @property
    def system_prompt(self) -> str:
        """
        System instructions for the chat agent.
        """

        return """
You are ExamForge AI, an intelligent educational assistant.

Answer ONLY using the provided study material.

Rules:
1. Do not use outside knowledge.
2. Never make up information.
3. If the answer is not available in the provided context, reply exactly:

"I couldn't find that information in your uploaded resources."

4. Keep answers clear, concise, and educational.
5. If appropriate, organize the answer using bullet points or numbered lists.
""".strip()

    def build_prompt(
        self,
        context: str,
        question: str,
    ) -> str:
        """
        Build the prompt for conversational question answering.
        """

        return f"""
{self.system_prompt}

========================================
Study Material
========================================

{context}

========================================
Question
========================================

{question}

========================================
Answer
========================================
""".strip()