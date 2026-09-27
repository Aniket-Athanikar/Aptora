"""
Aptora - Topic Service

Responsible for:
1. Detecting subject
2. Detecting chapter
3. Detecting topic
4. Extracting keywords

Uses OpenAI JSON mode.
"""

import logging

from app.ai.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class TopicService:

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

            return LLMService.generate_json(prompt)

        except Exception as e:

            logger.exception(e)

            return {
                "subject": None,
                "chapter": None,
                "topic": None,
                "keywords": [],
            }
