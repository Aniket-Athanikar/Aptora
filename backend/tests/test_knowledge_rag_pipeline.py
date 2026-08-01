"""Focused regressions for RAG no-context and infrastructure outcomes."""

import pytest

pytest.importorskip("qdrant_client")

from app.ai.orchestrator.context_optimizer import ContextOptimizer
from app.ai.orchestrator.reasoning_pipeline import ReasoningPipeline


def test_relevant_textbook_match_passes_context_validation() -> None:
    chunk = {
        "vector_score": 0.71,
        "keyword_score": 1.0,
        "content": "The Naturalisation of Humans explains an early human relationship with nature.",
    }
    assert ReasoningPipeline._has_valid_context([chunk], chunk["content"])


def test_unrelated_question_context_is_rejected() -> None:
    chunk = {"vector_score": 0.10, "keyword_score": 0.0, "content": "Inland waterways support transport."}
    assert not ReasoningPipeline._has_valid_context([chunk], chunk["content"])


def test_empty_qdrant_result_is_no_context() -> None:
    assert ContextOptimizer.optimize([]) == []
    result = ReasoningPipeline._no_context_result("explain", ["quantum physics"])
    assert result["context_found"] is False
    assert result["sources"] == []


def test_embedding_or_qdrant_failure_has_distinct_response() -> None:
    result = ReasoningPipeline._search_unavailable_result("explain", ["Naturalisation of Humans"])
    assert result["answer"] == "Knowledge search service is temporarily unavailable. Please retry."
    assert result["confidence"] == 0.0
    assert result["context_found"] is False
