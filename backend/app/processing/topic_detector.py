"""
Aptora - Topic Detector
==============================

Processing stage: DocumentProcessor -> TopicDetector

Identifies main topics, key concepts, and important subject keywords from cleaned
document text using OpenAI.

Design principles
-----------------
- Pure-function interface (TopicDetector.detect is stateless)
- Uses the configured OpenAI model for semantic topic extraction
- Max 20 topics returned, deduplicated, sorted by importance
- Graceful exception handling (returns [] on failure without crashing pipeline)
"""

from __future__ import annotations

import json
import logging
import re
import time
from typing import Final, List

from app.core.config import LLM_MODEL
from app.ai.services.llm_service import LLMService

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DEFAULT_MODEL: Final[str] = LLM_MODEL
MAX_TOPICS: Final[int] = 20
MAX_TEXT_SCAN_CHARS: Final[int] = 5000
MAX_RETRIES: Final[int] = 2
REQUEST_TIMEOUT_SECONDS: Final[float] = 15.0


class TopicDetector:
    """
    Production-ready service for detecting key topics and concepts using OpenAI.
    """

    MODEL_NAME: str = DEFAULT_MODEL

    @staticmethod
    def detect(text: str) -> List[str]:
        """
        Detect main topics, concepts, and keywords from document text.

        Parameters
        ----------
        text : str
            Cleaned document text.

        Returns
        -------
        List[str]
            Deduplicated list of up to 20 important topics, sorted by relevance.
            Returns [] if detection fails or input is empty.
        """
        if not text or not text.strip():
            logger.warning("[TopicDetector] Empty text passed to TopicDetector.")
            return []

        # Scanned sample text limited to keep context window fast and targeted
        sample = text[:MAX_TEXT_SCAN_CHARS].strip()

        prompt = f"""You are an expert academic curriculum and educational content analyzer.

Analyze the following document text and extract the most important main topics, core concepts, and key subject terms.

Follow these strict rules:
1. Extract between 5 and 20 specific, high-level topics or concepts.
2. Order them by importance (most central topic first).
3. Keep each topic brief (1-4 words max, e.g., "Data Structures", "Linear Algebra").
4. Output MUST be valid JSON in this object format: {"topics": ["topic"]}.
5. Output ONLY that JSON object. Do not include markdown formatting or extra text.

Document Text:
\"\"\"
{sample}
\"\"\"

JSON Output:"""

        logger.info(
            "[TopicDetector] Detecting topics | provider=OpenAI | MODEL=%s | (%d chars scanned)...",
            TopicDetector.MODEL_NAME,
            len(sample),
        )

        start_time = time.perf_counter()

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = LLMService.generate_json(prompt)
                topics = TopicDetector._parse_topics_response(json.dumps(response.get("topics", [])))
                if topics:
                    elapsed = time.perf_counter() - start_time
                    logger.info(
                        "[TopicDetector] Successfully detected %d topics in %.2fs.",
                        len(topics),
                        elapsed,
                    )
                    return topics

            except Exception as exc:
                logger.warning(
                    "[TopicDetector] Attempt %d/%d failed | provider=OpenAI: %s",
                    attempt,
                    MAX_RETRIES,
                    exc,
                )
                if attempt < MAX_RETRIES:
                    time.sleep(1.0)
                else:
                    logger.exception(
                        "[TopicDetector] Topic detection failed after %d attempt(s). Exception detail:",
                        MAX_RETRIES,
                    )

        return []

    @staticmethod
    def _parse_topics_response(response_text: str) -> List[str]:
        """
        Parse, clean, deduplicate, and limit the LLM response to valid topics.
        """
        cleaned_text = response_text.replace("```json", "").replace("```", "").strip()

        # Extract JSON array substring if surrounded by other characters
        match = re.search(r"\[.*\]", cleaned_text, re.DOTALL)
        if match:
            cleaned_text = match.group(0)

        raw_topics: List[str] = []
        try:
            parsed = json.loads(cleaned_text)
            if isinstance(parsed, list):
                raw_topics = [str(item) for item in parsed if item]
        except Exception:
            # Fallback: line-by-line parsing if JSON loading fails
            lines = response_text.splitlines()
            for line in lines:
                line_clean = re.sub(r"^[\d\.\-\*\s•]+", "", line).strip(' "[],\'')
                if line_clean and len(line_clean) > 2:
                    raw_topics.append(line_clean)

        # Process, clean, deduplicate while preserving order
        unique_topics: List[str] = []
        seen_lower: set[str] = set()

        for topic in raw_topics:
            # Clean formatting characters
            t_clean = re.sub(r"^\d+[\.\)\s]+", "", topic).strip(' "[],\'')
            t_clean = re.sub(r"\s+", " ", t_clean)

            if not t_clean or len(t_clean) < 2 or len(t_clean) > 80:
                continue

            t_lower = t_clean.lower()
            if t_lower not in seen_lower:
                seen_lower.add(t_lower)
                unique_topics.append(t_clean)

            if len(unique_topics) >= MAX_TOPICS:
                break

        return unique_topics


# ---------------------------------------------------------------------------
# Smoke Test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    sample_text = """
    Introduction to Object-Oriented Programming in Python.
    This chapter covers key programming concepts including Variables, Data Types,
    Functions, Conditional Control Flow, Loops, and Classes.
    We will explore Object-Oriented Design, Inheritance, Polymorphism, and Encapsulation.
    Furthermore, we analyze Algorithm Complexity, Big-O Notation, and Memory Management.
    """

    print("=" * 60)
    print("TopicDetector - Smoke Test")
    print("=" * 60)

    detected = TopicDetector.detect(sample_text)
    print(f"Detected {len(detected)} topics:")
    for idx, t in enumerate(detected, start=1):
        print(f"  {idx}. {t}")
