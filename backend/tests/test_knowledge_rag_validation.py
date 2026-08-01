"""Regression tests for Knowledge Chat context validation and query cleanup."""

import pytest

pytest.importorskip("qdrant_client")

from app.ai.orchestrator.query_rewriter import QueryRewriter
from app.ai.orchestrator.reasoning_pipeline import ReasoningPipeline


def test_topic_query_removes_conversational_prefix() -> None:
    queries = QueryRewriter.rewrite('Explain, about "The Naturalisation of Humans"')

    assert queries[0] == "The Naturalisation of Humans"
    assert all(not query.startswith("Geography ") for query in queries)


def test_context_validation_accepts_relevant_geography_chunk() -> None:
    chunks = [{"vector_score": 0.61, "keyword_score": 0.75, "content": "Naturalisation of Humans describes the relationship between human beings and nature in geography."}]

    assert ReasoningPipeline._has_valid_context(chunks, chunks[0]["content"])


def test_context_validation_rejects_unrelated_low_score_chunk() -> None:
    chunks = [{"vector_score": 0.12, "keyword_score": 0.0, "content": "Inland waterways are used for transport across rivers and canals."}]

    assert not ReasoningPipeline._has_valid_context(chunks, chunks[0]["content"])


def test_no_context_response_has_required_contract() -> None:
    result = ReasoningPipeline._no_context_result("explain", ["quantum physics"])

    assert result["context_found"] is False
    assert result["confidence"] == 0.0
    assert result["sources"] == []
