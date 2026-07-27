"""
ExamForge AI — Query Rewriter
==============================

Generates 3 distinct, high-precision rewritten search queries for any user prompt.
Implements Multi-Query Retrieval to drastically improve recall across vector search.
"""

from __future__ import annotations

import logging
from typing import List

logger = logging.getLogger(__name__)


class QueryRewriter:
    """
    Expands short or ambiguous student queries into 3 search variations.
    """

    @classmethod
    def rewrite(cls, question: str, intent: str = "explain") -> List[str]:
        """
        Generate 3 rewritten search queries from the primary question.

        Parameters
        ----------
        question:
            The raw user question.
        intent:
            The detected intent from IntentAnalyzer.

        Returns
        -------
        List[str]
            List of exactly 3 search query strings (including original or cleaned version).
        """
        cleaned = question.strip()
        if not cleaned:
            return ["general study material", "exam core concepts", "syllabus key topics"]

        words = cleaned.split()

        # Handle very short queries (1-2 words like "tree" or "PYQ")
        if len(words) <= 2:
            return cls._expand_short_query(cleaned, intent)

        # Generate 3 targeted variations based on intent
        queries = [cleaned]

        if intent == "pyq":
            queries.append(f"Previous year exam questions and solutions for {cleaned}")
            queries.append(f"Important exam problems and practice questions about {cleaned}")
        elif intent == "generate_mcqs":
            queries.append(f"Multiple choice practice questions with options on {cleaned}")
            queries.append(f"Key definitions and facts for quiz about {cleaned}")
        elif intent == "generate_notes":
            queries.append(f"Summary notes key concepts and formulas of {cleaned}")
            queries.append(f"Core principles and main points of {cleaned}")
        elif intent == "compare_topics":
            queries.append(f"Key differences contrast and comparison of {cleaned}")
            queries.append(f"Pros cons and distinguishing features of {cleaned}")
        elif intent == "memory_tricks":
            queries.append(f"Mnemonics formula shortcuts and memory tricks for {cleaned}")
            queries.append(f"How to easily remember and recall {cleaned}")
        elif intent == "examples":
            queries.append(f"Real world examples and solved numerical problems of {cleaned}")
            queries.append(f"Step by step worked examples for {cleaned}")
        else:
            queries.append(f"Detailed explanation key concepts and definitions of {cleaned}")
            queries.append(f"Core principles theory and applications of {cleaned}")

        logger.info(
            "[QueryRewriter] Rewrote query '%s' into %d variations: %s",
            cleaned,
            len(queries),
            queries,
        )

        return queries[:3]

    @staticmethod
    def _expand_short_query(short_q: str, intent: str) -> List[str]:
        """
        Expand single or two-word queries like 'tree', 'PYQ', 'RAM'.
        """
        token = short_q.upper()

        if token in ("PYQ", "PYQS", "PREVIOUS"):
            return [
                "Previous year examination questions and model answers",
                "Frequently asked exam problems and marking scheme",
                "Past paper questions for revision and practice",
            ]

        if intent in ("generate_mcqs", "quiz"):
            return [
                f"{short_q} multiple choice questions and practice quiz",
                f"{short_q} key terms definitions and options",
                f"{short_q} exam practice assessment questions",
            ]

        return [
            f"Explain {short_q} data structure concepts definitions and examples",
            f"{short_q} overview principles properties and applications",
            f"{short_q} core theory diagrams and step by step guide",
        ]
