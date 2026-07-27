"""
ExamForge AI — Intent Analyzer
================================

Detects student intent from natural language questions or prompts.

Supported Intents:
------------------
- explain             — Conceptual explanation ("What is ...", "How does ... work")
- teach               — Step-by-step tutorial ("Teach me ...", "Guide me through")
- summarize           — High-level summary ("Summarize ...", "Overview of")
- generate_notes      — Quick revision notes ("Make notes on ...", "Key notes")
- generate_flashcards — Flashcard request ("Flashcards for ...")
- generate_mcqs       — Quiz/MCQ request ("Quiz on ...", "Test me on")
- predict_questions   — Exam topic prediction ("What's likely to come in exam?")
- compare_topics      — Comparison ("Difference between A and B", "Compare X and Y")
- revision            — Last-minute review ("Quick revision of ...")
- examples            — Real-world / numerical examples ("Show examples of ...")
- memory_tricks       — Mnemonics / tricks ("How to remember ...", "Mnemonic for")
- pyq                 — Previous Year Questions ("Previous year questions", "PYQs")
- roadmap             — Learning path / sequence ("Study roadmap for ...")
- study_plan          — Timetable / advice ("How should I prepare ...")
- doubt_solving       — Specific question solving ("Solve this problem ...")
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Final, List, Dict, Any

logger = logging.getLogger(__name__)


@dataclass
class IntentAnalysisResult:
    """
    Result of intent analysis.
    """
    intent: str
    confidence: float
    required_resource_types: List[str] = field(default_factory=list)
    preferred_chunk_limit: int = 6


class IntentAnalyzer:
    """
    Production-ready intent analyzer using pattern matching, keyword analysis,
    and fallback semantic heuristics.
    """

    INTENT_MAP: Final[Dict[str, Dict[str, Any]]] = {
        "pyq": {
            "keywords": ["pyq", "previous year", "past paper", "exam questions", "asked in", "gate paper", "upsc paper"],
            "resource_types": ["pyq", "notes"],
            "limit": 10,
        },
        "generate_mcqs": {
            "keywords": ["mcq", "multiple choice", "quiz", "test me", "practice questions"],
            "resource_types": ["book", "notes", "pyq"],
            "limit": 8,
        },
        "generate_flashcards": {
            "keywords": ["flashcard", "flashcards", "card", "active recall"],
            "resource_types": ["notes", "book"],
            "limit": 8,
        },
        "generate_notes": {
            "keywords": ["notes", "summary notes", "revision notes", "cheat sheet", "bullet points"],
            "resource_types": ["book", "notes", "syllabus"],
            "limit": 10,
        },
        "predict_questions": {
            "keywords": ["predict", "expected questions", "important questions", "most likely", "exam trend"],
            "resource_types": ["pyq", "syllabus", "book"],
            "limit": 12,
        },
        "compare_topics": {
            "keywords": ["difference between", "compare", "versus", "vs", "distinguish", "pros and cons"],
            "resource_types": ["book", "notes"],
            "limit": 8,
        },
        "memory_tricks": {
            "keywords": ["mnemonic", "memory trick", "how to remember", "shortcut", "trick to learn"],
            "resource_types": ["notes", "book"],
            "limit": 6,
        },
        "examples": {
            "keywords": ["example", "sample", "instance", "case study", "numerical", "solved problem"],
            "resource_types": ["book", "notes", "pyq"],
            "limit": 8,
        },
        "revision": {
            "keywords": ["revision", "quick review", "recap", "brush up", "last minute"],
            "resource_types": ["notes", "flashcard", "book"],
            "limit": 8,
        },
        "summarize": {
            "keywords": ["summarize", "summary", "brief", "overview", "in short", "synopsis"],
            "resource_types": ["book", "notes"],
            "limit": 8,
        },
        "teach": {
            "keywords": ["teach me", "explain step by step", "guide me", "tutorial", "walk me through"],
            "resource_types": ["book", "notes"],
            "limit": 10,
        },
        "roadmap": {
            "keywords": ["roadmap", "learning path", "order of topics", "where to start", "prerequisites"],
            "resource_types": ["syllabus", "book"],
            "limit": 6,
        },
        "study_plan": {
            "keywords": ["study plan", "schedule", "timetable", "preparation strategy", "how to cover"],
            "resource_types": ["syllabus", "notes"],
            "limit": 8,
        },
        "doubt_solving": {
            "keywords": ["why does", "how to solve", "where is error", "solve", "is it true that"],
            "resource_types": ["book", "notes", "pyq"],
            "limit": 6,
        },
        "explain": {
            "keywords": ["what is", "explain", "define", "concept of", "meaning of", "describe"],
            "resource_types": ["book", "notes"],
            "limit": 6,
        },
    }

    @classmethod
    def analyze(cls, question: str) -> IntentAnalysisResult:
        """
        Analyze user query text to determine intent, confidence score,
        required resource types, and preferred chunk limit.

        Parameters
        ----------
        question:
            The raw query string from the user.

        Returns
        -------
        IntentAnalysisResult
        """
        if not question or not question.strip():
            return IntentAnalysisResult(
                intent="explain",
                confidence=0.5,
                required_resource_types=["book", "notes"],
                preferred_chunk_limit=6,
            )

        text_lower = question.lower().strip()

        for intent_name, config in cls.INTENT_MAP.items():
            for kw in config["keywords"]:
                if kw in text_lower or re.search(r"\b" + re.escape(kw) + r"\b", text_lower):
                    logger.info(
                        "[IntentAnalyzer] Detected intent '%s' (matched keyword: '%s')",
                        intent_name,
                        kw,
                    )
                    return IntentAnalysisResult(
                        intent=intent_name,
                        confidence=0.9,
                        required_resource_types=config["resource_types"],
                        preferred_chunk_limit=config["limit"],
                    )

        # Fallback default intent is 'explain'
        logger.info("[IntentAnalyzer] No specific keyword matched. Falling back to 'explain'.")
        return IntentAnalysisResult(
            intent="explain",
            confidence=0.6,
            required_resource_types=["book", "notes"],
            preferred_chunk_limit=6,
        )
