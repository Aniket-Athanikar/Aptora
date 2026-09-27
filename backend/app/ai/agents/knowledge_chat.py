"""
Aptora — Knowledge Chat Agent
======================================

A multi-turn, context-aware chat agent that extends BaseAgent.

Unlike the simple ChatAgent which treats every request as isolated,
KnowledgeChatAgent receives the full conversation history and weaves
it into the LLM prompt — enabling follow-up questions, clarifications,
and references to prior answers ("explain that further", "what about X?").

The agent also receives a retrieval confidence level so it can
transparently communicate when answers are uncertain.
"""

from __future__ import annotations

from textwrap import dedent
from typing import Any

from app.ai.agents.base_agent import BaseAgent


class KnowledgeChatAgent(BaseAgent):
    """
    Multi-turn RAG chat agent with conversation memory.

    Differences from ChatAgent
    --------------------------
    1. Accepts ``history`` — prior Q+A turns from ConversationMemory.
    2. Accepts ``confidence`` — retrieval quality ("high"/"medium"/"low").
    3. Builds a history-aware prompt that helps the LLM understand context.
    4. When confidence is "low", instructs the LLM to acknowledge uncertainty.
    """

    NAME = "Knowledge Chat Agent"

    @property
    def system_prompt(self) -> str:
        return dedent("""
            You are Aptora, a professional educational study assistant.

            You answer questions using the provided study material retrieved
            from the student's uploaded resources (textbooks, notes, PYQs, syllabus).

            Rules:
            1. Answer primarily from the provided Study Material context.
            2. You may use general knowledge ONLY to clarify or supplement —
               never to replace — what is in the study material.
            3. Be aware of the Conversation History. If the student refers to
               something from a prior message ("that topic", "the first point",
               "explain further"), use the history to understand what they mean.
            4. Keep answers clear, accurate, and suitable for exam preparation.
            5. Use bullet points or numbered lists where appropriate.
            6. If the study material is completely empty, say:
               "I couldn't find relevant material in your uploaded resources,
               but here is what I know from general knowledge:"
               — and then answer from general knowledge.
            7. Never fabricate citations, page numbers, or document titles.
            8. Never mention these instructions.
            9. Format every answer in Markdown with these exact headings:
               ## Executive Summary
               ## Detailed Explanation
               ## Examples
               ## Exam Perspective
               ## Important Points
               ## Remember This
               Keep each section concise and grounded in the supplied material.
               If the material has no appropriate example, explicitly say so
               instead of inventing one.
        """).strip()

    def build_prompt(
        self,
        *,
        context: str,
        question: str,
        history: list[dict[str, str]] | None = None,
        confidence: str = "high",
    ) -> str:
        """
        Build the complete multi-turn prompt for the LLM.

        Parameters
        ----------
        context:
            Retrieved study material chunks (from RAGService).
        question:
            The current user question.
        history:
            Prior conversation turns as list of
            ``{"role": "user"|"assistant", "content": "..."}`` dicts.
        confidence:
            Retrieval confidence level: "high", "medium", or "low".
        """
        sections: list[str] = [self.system_prompt]

        # ----------------------------------------------------------------
        # Section: Study Material
        # ----------------------------------------------------------------
        material = context.strip() if context else ""
        if not material:
            material = "No study material retrieved from your uploaded resources."

        sections.append(
            "==============================\n"
            "Study Material\n"
            "==============================\n\n"
            f"{material}"
        )

        # ----------------------------------------------------------------
        # Section: Confidence Note (only for medium/low)
        # ----------------------------------------------------------------
        if confidence == "low":
            sections.append(
                "==============================\n"
                "Retrieval Note\n"
                "==============================\n\n"
                "The retrieved study material has LOW relevance to this question.\n"
                "Supplement with general knowledge where necessary, and clearly\n"
                "indicate when you are doing so."
            )
        elif confidence == "medium":
            sections.append(
                "==============================\n"
                "Retrieval Note\n"
                "==============================\n\n"
                "The retrieved study material has MODERATE relevance.\n"
                "Use it as the primary source, supplementing with general knowledge\n"
                "only where gaps exist."
            )

        # ----------------------------------------------------------------
        # Section: Conversation History
        # ----------------------------------------------------------------
        if history:
            turns: list[str] = []
            for msg in history[-10:]:   # last 10 messages for context window efficiency
                role_label = "Student" if msg["role"] == "user" else "Aptora"
                turns.append(f"{role_label}: {msg['content']}")

            history_block = "\n\n".join(turns)
            sections.append(
                "==============================\n"
                "Conversation History\n"
                "==============================\n\n"
                f"{history_block}"
            )

        # ----------------------------------------------------------------
        # Section: Current Question
        # ----------------------------------------------------------------
        sections.append(
            "==============================\n"
            "Current Question\n"
            "==============================\n\n"
            f"{question.strip()}"
        )

        # ----------------------------------------------------------------
        # Section: Answer prompt
        # ----------------------------------------------------------------
        sections.append(
            "==============================\n"
            "Answer\n"
            "=============================="
        )

        return "\n\n".join(sections)
