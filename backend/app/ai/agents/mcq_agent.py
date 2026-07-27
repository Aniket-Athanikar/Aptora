"""
ExamForge AI — MCQ Agent
==========================

Generates structured Multiple Choice Questions (MCQs) from retrieved study context.

Enforces strict JSON formatting so the response can be parsed reliably by the backend
and rendered as an interactive quiz in the user interface.
"""

from __future__ import annotations

import json
import logging
import re
from textwrap import dedent
from typing import Any

from app.ai.agents.base_agent import BaseAgent

logger = logging.getLogger(__name__)


class MCQAgent(BaseAgent):
    """
    AI agent for generating structured Multiple Choice Questions.
    """

    NAME = "MCQ Agent"

    @property
    def system_prompt(self) -> str:
        return dedent("""
            You are ExamForge AI, a specialized educational quiz generator.

            Your task is to generate high-quality Multiple Choice Questions (MCQs) based strictly
            on the provided Study Material.

            Rules:
            1. Use ONLY information present in the Study Material.
            2. Do not use outside knowledge.
            3. Each question MUST have exactly 4 distinct options labeled "A", "B", "C", and "D".
            4. Exactly ONE option must be the correct answer.
            5. Include a brief, clear explanation for why the correct option is right.
            6. Output MUST be ONLY valid JSON matching the exact schema below.
            7. Do NOT include markdown code blocks, intro text, or conversational comments.

            JSON Schema format:
            [
              {
                "question": "What is ...?",
                "options": {
                  "A": "Option 1",
                  "B": "Option 2",
                  "C": "Option 3",
                  "D": "Option 4"
                },
                "correct_option": "A",
                "explanation": "Brief explanation..."
              }
            ]
        """).strip()

    def build_prompt(
        self,
        *,
        context: str,
        count: int = 5,
        difficulty: str = "medium",
    ) -> str:
        """
        Build the prompt for generating MCQs.
        """
        material = context.strip() if context else "No study material provided."

        return dedent(f"""
            {self.system_prompt}

            ==============================
            Study Material
            ==============================

            {material}

            ==============================
            Task
            ==============================

            Generate exactly {count} {difficulty}-difficulty MCQ(s) from the study material.
            Output ONLY raw JSON array.
        """).strip()

    @classmethod
    def parse_mcq_json(cls, raw_response: str) -> list[dict[str, Any]]:
        """
        Extract and repair JSON array from LLM response.
        Handles markdown fences, trailing text, and minor formatting errors.
        """
        text = raw_response.strip()

        # Remove markdown fences if present
        if "```" in text:
            match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
            if match:
                text = match.group(1).strip()

        # Find array start and end
        start = text.find("[")
        end = text.rfind("]")

        if start != -1 and end != -1 and end > start:
            text = text[start:end + 1]

        try:
            data = json.loads(text)
            if isinstance(data, list):
                return data
        except json.JSONDecodeError as exc:
            logger.warning("[MCQAgent] Direct JSON decode failed: %s. Attempting regex repair.", exc)

        # Fallback regex object extractor if JSON decoder fails
        pattern = re.compile(
            r'\{\s*"question"\s*:\s*"(.*?)"\s*,\s*"options"\s*:\s*\{\s*"A"\s*:\s*"(.*?)"\s*,\s*"B"\s*:\s*"(.*?)"\s*,\s*"C"\s*:\s*"(.*?)"\s*,\s*"D"\s*:\s*"(.*?)"\s*\}\s*,\s*"correct_option"\s*:\s*"(.*?)"\s*,\s*"explanation"\s*:\s*"(.*?)"\s*\}',
            re.DOTALL,
        )

        extracted = []
        for match in pattern.finditer(raw_response):
            extracted.append({
                "question": match.group(1),
                "options": {
                    "A": match.group(2),
                    "B": match.group(3),
                    "C": match.group(4),
                    "D": match.group(5),
                },
                "correct_option": match.group(6),
                "explanation": match.group(7),
            })

        return extracted
