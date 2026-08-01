"""
ExamForge AI - Topic Service

Responsible for:
1. Detecting subject
2. Detecting chapter
3. Detecting topic
4. Extracting keywords

Uses Ollama (Qwen3)
"""

import json
import logging

from app.ai.services.llm_service import client

logger = logging.getLogger(__name__)


class TopicService:

    MODEL = "qwen3:4b"

    @classmethod
    def detect(cls, text: str) -> dict:

        prompt = f"""
You are an educational content analyzer.

Analyze the following study material and return ONLY valid JSON.

Return exactly this format:

{{
    "subject": "",
    "chapter": "",
    "topic": "",
    "keywords": []
}}

Study Material (first 3000 characters):

{text[:3000]}

Return ONLY valid JSON.
Do not include markdown.
Do not explain your answer.
"""

        try:

            response = client.chat(
                model=cls.MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            content = response["message"]["content"]

            # Remove markdown if present
            content = (
                content.replace("```json", "")
                .replace("```", "")
                .strip()
            )
            # Extract only the JSON object
            start = content.find("{")
            end = content.rfind("}")

            if start != -1 and end != -1:
                content = content[start:end + 1]

            return json.loads(content)

        except Exception as e:

            logger.exception(e)

            return {
                "subject": None,
                "chapter": None,
                "topic": None,
                "keywords": [],
            }
