"""
ExamForge AI — Query Rewriter
==============================

Generates 3 distinct, high-precision rewritten search queries for any user prompt.
Implements Multi-Query Retrieval to drastically improve recall across vector search.
"""

from __future__ import annotations

import logging
import re
from typing import List

logger = logging.getLogger(__name__)


class QueryRewriter:
    """
    Expands short or ambiguous student queries into 3 search variations.
    """

    INSTRUCTION_ONLY_PHRASES = {
        "generate revision notes", "revision notes", "make notes", "generate notes", "create notes",
        "explain this topic", "explain topic", "explain", "teach like a beginner", "teach me",
        "generate flashcards", "make flashcards", "flashcards", "flashcard",
        "generate upsc mcqs", "generate mcqs", "mcqs", "multiple choice questions", "quiz",
        "predict exam questions", "predict questions", "expected questions", "exam questions",
        "explain with examples", "give examples", "examples",
        "memory tricks", "mnemonics", "how to remember", "revision", "quick review",
    }
    _LEADING_DIRECTIVE = re.compile(
        r"^\s*(?:(?:explain\s*[,,:-]*\s*(?:about\s+)?)|tell\s+me\s+about|describe|what\s+is|give\s+details\s+about)\s*",
        re.IGNORECASE,
    )

    @classmethod
    def rewrite(cls, question: str, intent: str = "explain", subject_name: str | None = None) -> List[str]:
        """
        Generate 3 rewritten search queries from the primary question.
        For study-mode directive prompts, generates search queries targeting document content
        rather than embedding the literal directive text.
        """
        # Subject is applied as a Qdrant metadata filter by the caller.  Do
        # not prepend it to a user's words: it changes query meaning and can
        # make embeddings less specific (for example, "Geography Tell me …").
        cleaned = question.strip()
        if not cleaned:
            return ["core concepts", "key topics", "syllabus summary"]

        cleaned_lower = cleaned.lower()
        is_instruction_only = (
            cleaned_lower in cls.INSTRUCTION_ONLY_PHRASES
            or any(cleaned_lower == p for p in cls.INSTRUCTION_ONLY_PHRASES)
        )

        # If user prompt is a meta-instruction ("Generate revision notes"), search document content!
        if is_instruction_only:
            domain = "subject core topics"
            logger.info("[QueryRewriter] Detected pure instruction prompt %r. Target domain content for %r.", cleaned, domain)
            if intent == "pyq":
                return [
                    f"{domain} previous year examination questions and model answers",
                    f"{domain} past paper exam problems and solved questions",
                    f"{domain} important exam questions and marking scheme",
                ]
            elif intent == "generate_mcqs":
                return [
                    f"{domain} multiple choice questions and definitions",
                    f"{domain} core principles facts and assessment terms",
                    f"{domain} key topics and concept definitions",
                ]
            elif intent in ("generate_notes", "revision"):
                return [
                    f"{domain} fundamental principles key concepts and summary",
                    f"{domain} core topics definitions and main points",
                    f"{domain} syllabus overview and essential facts",
                ]
            elif intent in ("teach", "explain"):
                return [
                    f"{domain} introduction fundamental concepts and explanation",
                    f"{domain} basic principles definitions and step by step guide",
                    f"{domain} main concepts overview and key topics",
                ]
            else:
                return [
                    f"{domain} key concepts principles and definitions",
                    f"{domain} core study material and main points",
                    f"{domain} syllabus overview and key facts",
                ]

        # The original wording remains available to the LLM; retrieval should
        # use the topic phrase rather than a conversational command.
        topic_query = cls._LEADING_DIRECTIVE.sub("", cleaned).strip(" \"'?.!,") or cleaned
        words = topic_query.split()

        # Handle very short queries (1-2 words like "tree" or "PYQ")
        if len(words) <= 2:
            return cls._expand_short_query(topic_query, intent, subject_name=subject_name)

        target_q = topic_query

        queries = [target_q]

        if intent == "pyq":
            queries.append(f"Previous year exam questions and solutions for {target_q}")
            queries.append(f"Important exam problems and practice questions about {target_q}")
        elif intent == "generate_mcqs":
            queries.append(f"Multiple choice practice questions with options on {target_q}")
            queries.append(f"Key definitions and facts for quiz about {target_q}")
        elif intent == "generate_notes":
            queries.append(f"Summary notes key concepts and formulas of {target_q}")
            queries.append(f"Core principles and main points of {target_q}")
        elif intent == "compare_topics":
            queries.append(f"Key differences contrast and comparison of {target_q}")
            queries.append(f"Pros cons and distinguishing features of {target_q}")
        elif intent == "memory_tricks":
            queries.append(f"Mnemonics formula shortcuts and memory tricks for {target_q}")
            queries.append(f"How to easily remember and recall {target_q}")
        elif intent == "examples":
            queries.append(f"Real world examples and solved numerical problems of {target_q}")
            queries.append(f"Step by step worked examples for {target_q}")
        else:
            queries.append(f"Detailed explanation key concepts and definitions of {target_q}")
            queries.append(f"Core principles theory and applications of {target_q}")

        logger.info(
            "[QueryRewriter] Rewrote query %r into %d variations: %s",
            cleaned,
            len(queries),
            queries,
        )

        return queries[:3]

    @staticmethod
    def _expand_short_query(short_q: str, intent: str, subject_name: str | None = None) -> List[str]:
        """
        Expand single or two-word queries like 'tree', 'PYQ', 'RAM'.
        """
        token = short_q.upper()
        prefix = ""

        if token in ("PYQ", "PYQS", "PREVIOUS"):
            return [
                f"{prefix}Previous year examination questions and model answers",
                f"{prefix}Frequently asked exam problems and marking scheme",
                f"{prefix}Past paper questions for revision and practice",
            ]

        if intent in ("generate_mcqs", "quiz"):
            return [
                f"{prefix}{short_q} multiple choice questions and practice quiz",
                f"{prefix}{short_q} key terms definitions and options",
                f"{prefix}{short_q} exam practice assessment questions",
            ]

        return [
            f"{prefix}Explain {short_q} concepts definitions and examples",
            f"{prefix}{short_q} overview principles properties and applications",
            f"{prefix}{short_q} core theory diagrams and step by step guide",
        ]
