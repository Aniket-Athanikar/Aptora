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
from app.ai.services.search_service import RetrievalUnavailable
from app.ai.services.llm_service import LLMService
from app.ai.rag.study_mode_prompts import instruction_for

logger = logging.getLogger(__name__)


class ReasoningPipeline:
    """
    Production-ready AI Reasoning Pipeline for ExamForge AI.
    Coordinated execution of intent detection, multi-query retrieval,
    context optimization, knowledge synthesis, LLM generation, and formatting.
    """

    MIN_CONTEXT_CHARS = 50
    MIN_SIMILARITY_SCORE = 0.35
    NO_CONTEXT_ANSWER = (
        "This question is not available in your uploaded study material. "
        "Please ask questions related to your uploaded documents."
    )
    SEARCH_UNAVAILABLE_ANSWER = "Knowledge search service is temporarily unavailable. Please retry."

    @classmethod
    def _no_context_result(cls, intent: str, queries: List[str]) -> Dict[str, Any]:
        return {
            "answer": cls.NO_CONTEXT_ANSWER,
            "raw_answer": cls.NO_CONTEXT_ANSWER,
            "intent": intent,
            "confidence": 0.0,
            "sources": [],
            "context_found": False,
            "queries_used": queries,
        }

    @classmethod
    def _search_unavailable_result(cls, intent: str, queries: List[str]) -> Dict[str, Any]:
        return {
            "answer": cls.SEARCH_UNAVAILABLE_ANSWER,
            "raw_answer": "",
            "intent": intent,
            "confidence": 0.0,
            "sources": [],
            "context_found": False,
            "queries_used": queries,
        }

    @classmethod
    def _has_valid_context(cls, chunks: List[Dict[str, Any]], context: str) -> bool:
        if not chunks:
            logger.info("[ReasoningPipeline] Context validation failed. No relevant chunks found for query.")
            return False
        # SearchService preserves the raw Qdrant cosine score as
        # ``vector_score`` after lightweight reranking.  Fall back to score
        # for legacy callers that do not provide it.
        max_score = max(float(chunk.get("vector_score", chunk.get("score")) or 0.0) for chunk in chunks)
        strong_keyword_match = any(float(chunk.get("keyword_score") or 0.0) >= 0.5 for chunk in chunks)
        if max_score < cls.MIN_SIMILARITY_SCORE and not strong_keyword_match:
            logger.info("[ReasoningPipeline] Context validation failed. Max similarity %.4f is below %.2f.", max_score, cls.MIN_SIMILARITY_SCORE)
            return False
        if max_score < cls.MIN_SIMILARITY_SCORE:
            logger.info("[ReasoningPipeline] Context validation accepted a strong keyword/topic match despite low vector similarity %.4f.", max_score)
        if len(context.strip()) < cls.MIN_CONTEXT_CHARS:
            logger.info("[ReasoningPipeline] Context validation failed. Context length %d is below %d.", len(context.strip()), cls.MIN_CONTEXT_CHARS)
            return False
        return True

    @classmethod
    def run(
        cls,
        workspace_id: int,
        question: str,
        history: List[Dict[str, str]] | None = None,
        subject: str | None = None,
        subject_id: int | None = None,
        limit: int | None = None,
        resource_ids: List[int] | None = None,
    ) -> Dict[str, Any]:
        """
        Execute the full reasoning pipeline for a student query.
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        logger.info("[ReasoningPipeline] Running pipeline | workspace=%d | subject_id=%s | resource_ids=%s", workspace_id, subject_id, resource_ids)

        # Resolve subject_name from DB if subject_id is provided but subject text is None
        if subject_id and not subject:
            try:
                from app.database import SessionLocal
                from app.models.workspace_subject import WorkspaceSubjectDb
                s_db = SessionLocal()
                subj_rec = s_db.query(WorkspaceSubjectDb).filter(WorkspaceSubjectDb.id == subject_id).first()
                if subj_rec:
                    subject = subj_rec.name
                s_db.close()
            except Exception as s_err:
                logger.debug("[ReasoningPipeline] Subject name resolution failed: %s", s_err)

        # Step 1: Intent Analysis
        intent_res = IntentAnalyzer.analyze(question)
        logger.info("[ReasoningPipeline] Step 1: Intent = %s (conf: %.2f)", intent_res.intent, intent_res.confidence)

        # Step 2: Query rewriting. Subject scope is enforced by retrieval filters.
        rewritten_queries = QueryRewriter.rewrite(question, intent=intent_res.intent, subject_name=subject)
        logger.info("[ReasoningPipeline] Step 2: Multi-queries = %s", rewritten_queries)

        # Step 3: Retrieval Planning
        plan = RetrievalPlanner.plan(
            intent=intent_res.intent,
            confidence=intent_res.confidence,
            preferred_resource_types=intent_res.required_resource_types,
            preferred_chunk_limit=intent_res.preferred_chunk_limit,
            subject=subject,
        )

        # Step 4: Multi-Query Retrieval
        raw_chunks: List[Dict[str, Any]] = []
        try:
            for q in rewritten_queries:
                chunks = Retriever.retrieve(
                    workspace_id=workspace_id,
                    question=q,
                    limit=min(plan.max_chunks_per_query, limit) if limit else plan.max_chunks_per_query,
                    subject_id=subject_id,
                    resource_types=plan.target_resource_types,
                    resource_ids=resource_ids,
                )
                raw_chunks.extend(chunks)
        except RetrievalUnavailable:
            logger.exception("[ReasoningPipeline] Retrieval infrastructure is unavailable; skipping LLM generation.")
            return cls._search_unavailable_result(intent_res.intent, rewritten_queries)

        logger.info("[ReasoningPipeline] Step 4: Multi-query retrieved %d raw chunks total.", len(raw_chunks))

        # Step 5: Context Optimization (Deduplication, merging, token limits)
        optimized_chunks = ContextOptimizer.optimize(raw_chunks)
        logger.info("[ReasoningPipeline] Step 5: Optimized to %d chunks.", len(optimized_chunks))

        # Task 8: Detailed Logging of Chunk Injection
        chunk_summary = [
            f"ID:{c.get('chunk_id','?')} (score:{c.get('score', 0.0):.4f}, res:{c.get('resource_id')})"
            for c in optimized_chunks
        ]
        logger.info("[ReasoningPipeline Task 8 Audit] Retrieved Chunks (%d): %s", len(optimized_chunks), chunk_summary)

        # Step 6: Confidence & Sources
        confidence_result = ConfidenceScorer.score(optimized_chunks)
        logger.info("[ReasoningPipeline] Step 6: Confidence = %s (avg: %.2f)", confidence_result.level, confidence_result.avg_score)

        # Step 7: Knowledge Synthesis
        synthesized_context = KnowledgeSynthesizer.synthesize(optimized_chunks, intent=intent_res.intent)
        logger.info("[ReasoningPipeline] Final context documents=%s; context length=%d chars.", [c.get("document_title") for c in optimized_chunks], len(synthesized_context))

        if not cls._has_valid_context(optimized_chunks, synthesized_context):
            logger.info("[ReasoningPipeline] Skipping LLM generation.")
            return cls._no_context_result(intent_res.intent, rewritten_queries)

        # Step 8: LLM Generation
        prompt = cls._build_reasoning_prompt(
            question=question,
            context=synthesized_context,
            intent=intent_res.intent,
            history=history,
        )
        logger.info("[ReasoningPipeline Task 8 Audit] Prompt Preview (first 300 chars):\n%s", prompt[:300])

        try:
            raw_answer = LLMService.generate(prompt)
        except Exception:
            logger.exception("[ReasoningPipeline] LLM generation failed after context validation.")
            return {
                "answer": "AI generation service is temporarily unavailable. Please verify the OpenAI API configuration and retry.",
                "raw_answer": "",
                "intent": intent_res.intent,
                "confidence": confidence_result.level,
                "sources": confidence_result.sources,
                "context_found": True,
                "queries_used": rewritten_queries,
            }

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
            "context_found": True,
            "queries_used": rewritten_queries,
        }

    @classmethod
    def run_stream(
        cls,
        workspace_id: int,
        question: str,
        history: List[Dict[str, str]] | None = None,
        subject: str | None = None,
        subject_id: int | None = None,
        limit: int | None = None,
        resource_ids: List[int] | None = None,
    ) -> Generator[str, None, None]:
        """
        Stream response through reasoning pipeline.
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        # Resolve subject_name from DB if subject_id is provided but subject text is None
        if subject_id and not subject:
            try:
                from app.database import SessionLocal
                from app.models.workspace_subject import WorkspaceSubjectDb
                s_db = SessionLocal()
                subj_rec = s_db.query(WorkspaceSubjectDb).filter(WorkspaceSubjectDb.id == subject_id).first()
                if subj_rec:
                    subject = subj_rec.name
                s_db.close()
            except Exception as s_err:
                logger.debug("[ReasoningPipeline] Subject name resolution failed: %s", s_err)

        # Execute steps 1 to 7
        intent_res = IntentAnalyzer.analyze(question)
        rewritten_queries = QueryRewriter.rewrite(question, intent=intent_res.intent, subject_name=subject)
        plan = RetrievalPlanner.plan(
            intent=intent_res.intent,
            confidence=intent_res.confidence,
            preferred_resource_types=intent_res.required_resource_types,
            preferred_chunk_limit=intent_res.preferred_chunk_limit,
            subject=subject,
        )

        raw_chunks: List[Dict[str, Any]] = []
        try:
            for q in rewritten_queries:
                chunks = Retriever.retrieve(
                    workspace_id=workspace_id,
                    question=q,
                    limit=min(plan.max_chunks_per_query, limit) if limit else plan.max_chunks_per_query,
                    subject_id=subject_id,
                    resource_types=plan.target_resource_types,
                    resource_ids=resource_ids,
                )
                raw_chunks.extend(chunks)
        except RetrievalUnavailable:
            logger.exception("[ReasoningPipeline] Retrieval infrastructure is unavailable; skipping LLM generation.")
            yield cls.SEARCH_UNAVAILABLE_ANSWER
            return

        optimized_chunks = ContextOptimizer.optimize(raw_chunks)
        confidence_result = ConfidenceScorer.score(optimized_chunks)
        synthesized_context = KnowledgeSynthesizer.synthesize(optimized_chunks, intent=intent_res.intent)

        if not cls._has_valid_context(optimized_chunks, synthesized_context):
            logger.info("[ReasoningPipeline] Skipping LLM generation.")
            yield cls.NO_CONTEXT_ANSWER
            return

        prompt = cls._build_reasoning_prompt(
            question=question,
            context=synthesized_context,
            intent=intent_res.intent,
            history=history,
        )

        # Stream tokens only after context validation.  Generator exceptions
        # occur during iteration, so handle them here rather than leaking an
        # Provider errors occur during generator iteration, so handle them here.
        try:
            yield from LLMService.stream(prompt)
        except Exception:
            logger.exception("[ReasoningPipeline] LLM streaming failed after context validation.")
            yield "AI generation service is temporarily unavailable. Please verify the OpenAI API configuration and retry."

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

Study-mode output contract:
{instruction_for(intent)}

Study Material Context:
{context}
{history_text}

Student Question:
{question}

Use only the supplied Study Material Context for factual claims. If it is empty or insufficient, respond exactly: "I could not find this topic in the uploaded study materials." Do not fill gaps with generic knowledge. When answering, name the source document(s) used.
        """.strip()
