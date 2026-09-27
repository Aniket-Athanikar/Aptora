from __future__ import annotations

import logging
import uuid
import time
import json
from typing import Any, Dict, List, Generator

from app.core.config import settings
from app.core.request_context import ai_request_context
from app.ai.services.token_budget_manager import TokenBudgetManager
from app.ai.services.audit_logger import AuditLogger

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
    Production-ready AI Reasoning Pipeline for Aptora.
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
        user_id: int | None = None,
        request_id: str | None = None,
        feature: str = "chat",
    ) -> Dict[str, Any]:
        """
        Execute the full reasoning pipeline for a student query.
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        request_id = request_id or str(uuid.uuid4())
        logger.info("[ReasoningPipeline] Running pipeline | workspace=%d | request_id=%s", workspace_id, request_id)

        # Log started audit event
        AuditLogger.log_event(request_id, user_id, "AI_REQUEST_STARTED", feature=feature, model=LLMService.MODEL_NAME, status="started")

        token = ai_request_context.set({
            "request_id": request_id,
            "user_id": user_id,
            "feature": feature,
            "configured_context_budget": settings.AI_CHAT_CONTEXT_TOKENS,
            "configured_history_budget": settings.AI_CHAT_HISTORY_TOKENS,
            "configured_output_budget": settings.AI_CHAT_OUTPUT_TOKENS,
            "actual_context_tokens": 0,
            "actual_history_tokens": 0,
        })

        try:
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

            # Step 2: Query rewriting
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
                AuditLogger.log_event(request_id, user_id, "AI_REQUEST_FAILED", feature=feature, model=LLMService.MODEL_NAME, status="failed", metadata={"error": "Retrieval infrastructure unavailable"})
                return cls._search_unavailable_result(intent_res.intent, rewritten_queries)

            # Step 5: Context Optimization (Deduplication, merging, token limits)
            optimized_chunks = ContextOptimizer.optimize(raw_chunks)

            # Step 6: Confidence & Sources
            confidence_result = ConfidenceScorer.score(optimized_chunks)

            # Step 7: Knowledge Synthesis
            synthesized_context = KnowledgeSynthesizer.synthesize(optimized_chunks, intent=intent_res.intent)
            
            # Enforce token budget limits on history and context
            sliced_history = TokenBudgetManager.slice_history_to_budget(history or [], settings.AI_CHAT_HISTORY_TOKENS)
            actual_history_tokens = TokenBudgetManager.count_messages_tokens(sliced_history)
            actual_context_tokens = TokenBudgetManager.count_tokens(synthesized_context)

            ctx = ai_request_context.get()
            ctx["actual_context_tokens"] = actual_context_tokens
            ctx["actual_history_tokens"] = actual_history_tokens

            if not cls._has_valid_context(optimized_chunks, synthesized_context):
                logger.info("[ReasoningPipeline] Skipping LLM generation.")
                AuditLogger.log_event(request_id, user_id, "AI_REQUEST_COMPLETED", feature=feature, model=LLMService.MODEL_NAME, status="completed", metadata={"context_found": False})
                return cls._no_context_result(intent_res.intent, rewritten_queries)

            # Step 8: LLM Generation
            prompt = cls._build_reasoning_prompt(
                question=question,
                context=synthesized_context,
                intent=intent_res.intent,
                history=sliced_history,
            )

            raw_answer = LLMService.generate(prompt)

            # Step 9: Response Formatting & Source Attribution
            formatted_answer = ResponseFormatter.format_response(
                raw_answer=raw_answer,
                intent=intent_res.intent,
                confidence=confidence_result.level,
                sources=confidence_result.sources,
            )

            AuditLogger.log_event(request_id, user_id, "AI_REQUEST_COMPLETED", feature=feature, model=LLMService.MODEL_NAME, status="completed", metadata={"context_found": True})

            return {
                "answer": formatted_answer,
                "raw_answer": raw_answer,
                "intent": intent_res.intent,
                "confidence": confidence_result.level,
                "sources": confidence_result.sources,
                "context_found": True,
                "queries_used": rewritten_queries,
            }

        except Exception as e:
            AuditLogger.log_event(request_id, user_id, "AI_REQUEST_FAILED", feature=feature, model=LLMService.MODEL_NAME, status="failed", metadata={"error": str(e)})
            raise
        finally:
            ai_request_context.reset(token)

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
        stream_format: str = "plain",
        user_id: int | None = None,
        request_id: str | None = None,
        feature: str = "chat",
    ) -> Generator[str, None, None]:
        """
        Stream response through reasoning pipeline.
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        request_id = request_id or str(uuid.uuid4())
        
        # Log started audit event
        AuditLogger.log_event(request_id, user_id, "AI_REQUEST_STARTED", feature=feature, model=LLMService.MODEL_NAME, status="started")

        token = ai_request_context.set({
            "request_id": request_id,
            "user_id": user_id,
            "feature": feature,
            "configured_context_budget": settings.AI_CHAT_CONTEXT_TOKENS,
            "configured_history_budget": settings.AI_CHAT_HISTORY_TOKENS,
            "configured_output_budget": settings.AI_CHAT_OUTPUT_TOKENS,
            "actual_context_tokens": 0,
            "actual_history_tokens": 0,
        })

        try:
            if stream_format == "sse":
                yield f"data: {json.dumps({'event': 'STARTED', 'request_id': request_id})}\n\n"

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
            if stream_format == "sse":
                yield f"data: {json.dumps({'event': 'SEARCHING'})}\n\n"
            intent_res = IntentAnalyzer.analyze(question)
            
            # Step 2: Query rewriting
            rewritten_queries = QueryRewriter.rewrite(question, intent=intent_res.intent, subject_name=subject)
            
            # Step 3: Retrieval Planning
            plan = RetrievalPlanner.plan(
                intent=intent_res.intent,
                confidence=intent_res.confidence,
                preferred_resource_types=intent_res.required_resource_types,
                preferred_chunk_limit=intent_res.preferred_chunk_limit,
                subject=subject,
            )

            # Step 4: Multi-Query Retrieval
            if stream_format == "sse":
                yield f"data: {json.dumps({'event': 'RETRIEVING'})}\n\n"
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
                AuditLogger.log_event(request_id, user_id, "AI_REQUEST_FAILED", feature=feature, model=LLMService.MODEL_NAME, status="failed", metadata={"error": "Retrieval infrastructure unavailable"})
                if stream_format == "sse":
                    yield f"data: {json.dumps({'event': 'FAILED', 'error': 'Retrieval infrastructure unavailable'})}\n\n"
                else:
                    yield cls.SEARCH_UNAVAILABLE_ANSWER
                return

            # Step 5: Context Optimization
            optimized_chunks = ContextOptimizer.optimize(raw_chunks)
            confidence_result = ConfidenceScorer.score(optimized_chunks)
            synthesized_context = KnowledgeSynthesizer.synthesize(optimized_chunks, intent=intent_res.intent)

            # Slicing history and context
            sliced_history = TokenBudgetManager.slice_history_to_budget(history or [], settings.AI_CHAT_HISTORY_TOKENS)
            actual_history_tokens = TokenBudgetManager.count_messages_tokens(sliced_history)
            actual_context_tokens = TokenBudgetManager.count_tokens(synthesized_context)

            ctx = ai_request_context.get()
            ctx["actual_context_tokens"] = actual_context_tokens
            ctx["actual_history_tokens"] = actual_history_tokens
            if ctx is not None:
                ctx["sources"] = confidence_result.sources
                ctx["confidence"] = confidence_result.level

            if stream_format == "sse":
                yield f"data: {json.dumps({'event': 'CONTEXT_READY'})}\n\n"

            if not cls._has_valid_context(optimized_chunks, synthesized_context):
                logger.info("[ReasoningPipeline] Skipping LLM generation.")
                AuditLogger.log_event(request_id, user_id, "AI_REQUEST_COMPLETED", feature=feature, model=LLMService.MODEL_NAME, status="completed", metadata={"context_found": False})
                if stream_format == "sse":
                    yield f"data: {json.dumps({'event': 'COMPLETED'})}\n\n"
                else:
                    yield cls.NO_CONTEXT_ANSWER
                return

            prompt = cls._build_reasoning_prompt(
                question=question,
                context=synthesized_context,
                intent=intent_res.intent,
                history=sliced_history,
            )

            if stream_format == "sse":
                yield f"data: {json.dumps({'event': 'GENERATING'})}\n\n"

            for token_chunk in LLMService.stream(prompt):
                if stream_format == "sse":
                    yield f"data: {json.dumps({'event': 'TOKEN', 'text': token_chunk})}\n\n"
                else:
                    yield token_chunk

            AuditLogger.log_event(request_id, user_id, "AI_REQUEST_COMPLETED", feature=feature, model=LLMService.MODEL_NAME, status="completed", metadata={"context_found": True})
            if stream_format == "sse":
                yield f"data: {json.dumps({'event': 'COMPLETED'})}\n\n"

        except Exception as e:
            AuditLogger.log_event(request_id, user_id, "AI_REQUEST_FAILED", feature=feature, model=LLMService.MODEL_NAME, status="failed", metadata={"error": str(e)})
            if stream_format == "sse":
                yield f"data: {json.dumps({'event': 'FAILED', 'error': str(e)})}\n\n"
            else:
                yield "AI generation service is temporarily unavailable. Please verify the OpenAI API configuration and retry."
        finally:
            ai_request_context.reset(token)

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
            turns = [f"{m['role'].capitalize()}: {m['content']}" for m in history]
            history_text = "\n\nConversation History:\n" + "\n".join(turns)

        return f"""
You are Aptora, an expert educational tutor.

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
