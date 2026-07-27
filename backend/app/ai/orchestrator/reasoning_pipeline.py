"""
ExamForge AI — Reasoning Pipeline
==================================

Master orchestrator for ExamForge AI's professional knowledge engine.

Pipeline Architecture:
----------------------
1. Intent Analysis     (IntentAnalyzer)
2. Query Rewriting     (QueryRewriter)
3. Retrieval Planning  (RetrievalPlanner)
4. Multi-Query Search  (SearchService / Retriever)
5. Context Optimizer   (ContextOptimizer)
6. Knowledge Synthesis (KnowledgeSynthesizer)
7. LLM Prompt Build    (PromptBuilder / Agents)
8. LLM Execution       (LLMService)
9. Response Format     (ResponseFormatter)
10. Source Attribution (ConfidenceScorer)
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Generator

from app.ai.orchestrator.intent_analyzer import IntentAnalyzer
from app.ai.orchestrator.query_rewriter import QueryRewriter
from app.ai.orchestrator.retrieval_planner import RetrievalPlanner
from app.ai.orchestrator.context_optimizer import ContextOptimizer
from app.ai.orchestrator.knowledge_synthesizer import KnowledgeSynthesizer
from app.ai.orchestrator.response_formatter import ResponseFormatter

from app.ai.rag.confidence_scorer import ConfidenceScorer
from app.ai.rag.retriever import Retriever
from app.ai.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class ReasoningPipeline:
    """
    Production-ready AI Reasoning Pipeline for ExamForge AI.
    Coordinated execution of intent detection, multi-query retrieval,
    context optimization, knowledge synthesis, LLM generation, and formatting.
    """

    @classmethod
    def run(
        cls,
        workspace_id: int,
        question: str,
        history: List[Dict[str, str]] | None = None,
        subject: str | None = None,
    ) -> Dict[str, Any]:
        """
        Execute the full reasoning pipeline for a student query.

        Parameters
        ----------
        workspace_id:
            Target workspace ID.
        question:
            User query text.
        history:
            Optional conversation history list.
        subject:
            Optional subject filter.

        Returns
        -------
        Dict with keys: ``answer``, ``intent``, ``confidence``, ``sources``, ``queries_used``
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        logger.info("[ReasoningPipeline] Running pipeline | workspace=%d", workspace_id)

        # Step 1: Intent Analysis
        intent_res = IntentAnalyzer.analyze(question)
        logger.info("[ReasoningPipeline] Step 1: Intent = %s (conf: %.2f)", intent_res.intent, intent_res.confidence)

        # Step 2: Query Rewriting
        rewritten_queries = QueryRewriter.rewrite(question, intent=intent_res.intent)
        logger.info("[ReasoningPipeline] Step 2: Multi-queries = %s", rewritten_queries)

        # Step 3: Retrieval Planning
        plan = RetrievalPlanner.plan(
            intent=intent_res.intent,
            confidence=intent_res.confidence,
            preferred_resource_types=intent_res.required_resource_types,
            preferred_chunk_limit=intent_res.preferred_chunk_limit,
            subject=subject,
        )

        # Step 4: Multi-Query Retrieval (Task 9 Quality Improvement)
        raw_chunks: List[Dict[str, Any]] = []
        for q in rewritten_queries:
            chunks = Retriever.retrieve(
                workspace_id=workspace_id,
                question=q,
                limit=plan.max_chunks_per_query,
            )
            raw_chunks.extend(chunks)

        logger.info("[ReasoningPipeline] Step 4: Multi-query retrieved %d raw chunks total.", len(raw_chunks))

        # Step 5: Context Optimization (Deduplication, merging, token limits)
        optimized_chunks = ContextOptimizer.optimize(raw_chunks)
        logger.info("[ReasoningPipeline] Step 5: Optimized to %d chunks.", len(optimized_chunks))

        # Step 6: Confidence & Sources
        confidence_result = ConfidenceScorer.score(optimized_chunks)
        logger.info("[ReasoningPipeline] Step 6: Confidence = %s (avg: %.2f)", confidence_result.level, confidence_result.avg_score)

        # Step 7: Knowledge Synthesis
        synthesized_context = KnowledgeSynthesizer.synthesize(optimized_chunks, intent=intent_res.intent)

        # Step 8: LLM Generation
        prompt = cls._build_reasoning_prompt(
            question=question,
            context=synthesized_context,
            intent=intent_res.intent,
            history=history,
        )
        raw_answer = LLMService.generate(prompt)

        # Step 9: Response Formatting & Source Attribution
        formatted_answer = ResponseFormatter.format_response(
            raw_answer=raw_answer,
            intent=intent_res.intent,
            confidence=confidence_result.level,
            sources=confidence_result.sources,
        )

        logger.info("[ReasoningPipeline] Pipeline execution complete.")

        return {
            "answer": formatted_answer,
            "raw_answer": raw_answer,
            "intent": intent_res.intent,
            "confidence": confidence_result.level,
            "sources": confidence_result.sources,
            "queries_used": rewritten_queries,
        }

    @classmethod
    def run_stream(
        cls,
        workspace_id: int,
        question: str,
        history: List[Dict[str, str]] | None = None,
        subject: str | None = None,
    ) -> Generator[str, None, None]:
        """
        Stream response through reasoning pipeline.
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        # Execute steps 1 to 7
        intent_res = IntentAnalyzer.analyze(question)
        rewritten_queries = QueryRewriter.rewrite(question, intent=intent_res.intent)
        plan = RetrievalPlanner.plan(
            intent=intent_res.intent,
            confidence=intent_res.confidence,
            preferred_resource_types=intent_res.required_resource_types,
            preferred_chunk_limit=intent_res.preferred_chunk_limit,
            subject=subject,
        )

        raw_chunks: List[Dict[str, Any]] = []
        for q in rewritten_queries:
            chunks = Retriever.retrieve(
                workspace_id=workspace_id,
                question=q,
                limit=plan.max_chunks_per_query,
            )
            raw_chunks.extend(chunks)

        optimized_chunks = ContextOptimizer.optimize(raw_chunks)
        confidence_result = ConfidenceScorer.score(optimized_chunks)
        synthesized_context = KnowledgeSynthesizer.synthesize(optimized_chunks, intent=intent_res.intent)

        prompt = cls._build_reasoning_prompt(
            question=question,
            context=synthesized_context,
            intent=intent_res.intent,
            history=history,
        )

        # Stream tokens
        yield from LLMService.stream(prompt)

    @staticmethod
    def _build_reasoning_prompt(
        question: str,
        context: str,
        intent: str,
        history: List[Dict[str, str]] | None = None,
    ) -> str:
        """
        Build instruction prompt for the LLM based on intent and context.
        """
        history_text = ""
        if history:
            turns = [f"{m['role'].capitalize()}: {m['content']}" for m in history[-6:]]
            history_text = "\n\nConversation History:\n" + "\n".join(turns)

        return f"""
You are ExamForge AI, an expert educational tutor.

Intent Focus: {intent.upper()}

Study Material Context:
{context}
{history_text}

Student Question:
{question}

Provide a clear, thorough, and highly educational response.
        """.strip()
