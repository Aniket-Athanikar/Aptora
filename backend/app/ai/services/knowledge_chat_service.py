"""
ExamForge AI — Knowledge Chat Service
========================================
High-level orchestrator that manages conversational context (memory)
and executes the ReasoningPipeline for multi-turn chat sessions.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Generator

from app.ai.memory.conversation_memory import ConversationMemory
from app.ai.orchestrator.reasoning_pipeline import ReasoningPipeline

logger = logging.getLogger(__name__)


class KnowledgeChatService:
    DEFAULT_RETRIEVAL_LIMIT = 8

    @classmethod
    def ask(
        cls,
        session_id: str,
        workspace_id: int,
        question: str,
        limit: int = DEFAULT_RETRIEVAL_LIMIT,
        history: list[dict[str, str]] | None = None,
        subject_id: int | None = None,
        resource_ids: list[int] | None = None,
        user_id: int | None = None,
        request_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Generate a complete multi-turn response via ReasoningPipeline.
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        logger.info(
            "[KnowledgeChatService] ask | session=%s | workspace=%d | resource_ids=%s | request_id=%s",
            session_id,
            workspace_id,
            resource_ids,
            request_id,
        )

        # 1. Load conversation history
        history = history if history is not None else ConversationMemory.get_history(session_id)
        logger.info(
            "[KnowledgeChatService] History loaded: %d message(s).",
            len(history),
        )

        # 2. Run Reasoning Pipeline with history
        pipeline_result = ReasoningPipeline.run(
            workspace_id=workspace_id,
            question=question,
            history=history,
            subject_id=subject_id,
            limit=limit,
            resource_ids=resource_ids,
            user_id=user_id,
            request_id=request_id,
        )

        answer = pipeline_result["answer"]
        confidence = pipeline_result["confidence"]
        sources = pipeline_result["sources"]
        context_found = pipeline_result["context_found"]

        # 3. Persist to memory
        ConversationMemory.add_message(session_id, "user", question)
        ConversationMemory.add_message(session_id, "assistant", answer)

        logger.info("[KnowledgeChatService] Answer generated and stored via ReasoningPipeline.")

        return {
            "session_id": session_id,
            "answer": answer,
            "confidence": confidence,
            "sources": sources,
            "context_found": context_found,
            "history_length": len(history) + 2,   # +2 for messages just added
        }

    @classmethod
    def stream(
        cls,
        session_id: str,
        workspace_id: int,
        question: str,
        limit: int = DEFAULT_RETRIEVAL_LIMIT,
        subject_id: int | None = None,
        resource_ids: list[int] | None = None,
        stream_format: str = "plain",
        user_id: int | None = None,
        request_id: str | None = None,
    ) -> Generator[str, None, None]:
        """
        Stream a multi-turn response token by token via ReasoningPipeline.
        """
        question = question.strip()
        if not question:
            raise ValueError("Question cannot be empty.")

        logger.info(
            "[KnowledgeChatService] stream | session=%s | workspace=%d | resource_ids=%s | request_id=%s",
            session_id,
            workspace_id,
            resource_ids,
            request_id,
        )

        # 1. Load history
        history = ConversationMemory.get_history(session_id)

        # 2. Store user message before streaming
        ConversationMemory.add_message(session_id, "user", question)

        # 3. Stream through reasoning pipeline
        accumulated: list[str] = []

        for token in ReasoningPipeline.run_stream(
            workspace_id=workspace_id,
            question=question,
            history=history,
            limit=limit,
            subject_id=subject_id,
            resource_ids=resource_ids,
            stream_format=stream_format,
            user_id=user_id,
            request_id=request_id,
        ):
            if stream_format == "sse":
                if token.startswith("data: "):
                    try:
                        payload = json.loads(token.split("data: ", 1)[1].strip())
                        if payload.get("event") == "TOKEN":
                            accumulated.append(payload.get("text", ""))
                    except Exception:
                        pass
            else:
                accumulated.append(token)
            yield token

        # 4. Store assistant response after stream completes
        full_answer = "".join(accumulated)
        ConversationMemory.add_message(session_id, "assistant", full_answer)

        # 5. Persist the turn to SQL database
        if user_id:
            try:
                from app.db.session import SessionLocal
                from app.models.knowledge_conversation import KnowledgeConversationDb, KnowledgeMessageDb
                from app.core.request_context import ai_request_context
                import datetime

                db = SessionLocal()
                try:
                    conversation = db.query(KnowledgeConversationDb).filter(
                        KnowledgeConversationDb.id == session_id,
                        KnowledgeConversationDb.user_id == user_id,
                    ).first()
                    if conversation:
                        # Set initial title if this is the first turn
                        if not conversation.messages:
                            from app.api.v1.knowledge import _title_from_question
                            conversation.title = _title_from_question(question)
                        
                        # Prevent duplicate user messages
                        user_msg_exists = db.query(KnowledgeMessageDb).filter(
                            KnowledgeMessageDb.conversation_id == session_id,
                            KnowledgeMessageDb.role == "user",
                            KnowledgeMessageDb.content == question
                        ).first()
                        if not user_msg_exists:
                            db.add(KnowledgeMessageDb(
                                conversation_id=session_id,
                                role="user",
                                content=question
                            ))

                        # Retrieve actual sources and confidence from RequestContext
                        ctx = ai_request_context.get()
                        sources = ctx.get("sources") if ctx else None
                        confidence = ctx.get("confidence") if ctx else None

                        db.add(KnowledgeMessageDb(
                            conversation_id=session_id,
                            role="assistant",
                            content=full_answer,
                            sources=sources,
                            confidence=str(confidence) if confidence is not None else None
                        ))

                        now = datetime.datetime.utcnow()
                        conversation.last_message_at = now
                        conversation.updated_at = now
                        db.commit()
                except Exception as db_err:
                    db.rollback()
                    logger.exception("[KnowledgeChatService] Database transaction failed during stream persistence: %s", db_err)
                finally:
                    db.close()
            except Exception as import_err:
                logger.exception("[KnowledgeChatService] Import or session creation failed during stream persistence: %s", import_err)

        logger.info("[KnowledgeChatService] Streaming completed and stored via ReasoningPipeline.")
