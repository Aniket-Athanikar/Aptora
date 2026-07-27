"""
ExamForge AI — Knowledge API Router
======================================

Endpoints
---------
POST   /knowledge/chat               — Multi-turn Knowledge Chat (non-streaming)
POST   /knowledge/chat/stream        — Multi-turn Knowledge Chat (streaming)
GET    /knowledge/chat/{session_id}/history — Get session chat history
DELETE /knowledge/chat/{session_id}  — Clear session chat history
"""

import logging
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.ai.memory.conversation_memory import ConversationMemory
from app.ai.services.knowledge_chat_service import KnowledgeChatService
from app.schemas.knowledge import (
    KnowledgeChatRequest,
    KnowledgeChatResponse,
    MessageItem,
    SessionHistoryResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge Engine"],
)


@router.post(
    "/chat",
    response_model=KnowledgeChatResponse,
    status_code=status.HTTP_200_OK,
)
async def knowledge_chat(request: KnowledgeChatRequest):
    """
    Multi-turn AI study chat with session memory, confidence scoring, and source attribution.
    """
    try:
        result = KnowledgeChatService.ask(
            session_id=request.session_id,
            workspace_id=request.workspace_id,
            question=request.question,
            limit=request.limit or 8,
        )

        return KnowledgeChatResponse(
            success=True,
            session_id=result["session_id"],
            answer=result["answer"],
            confidence=result["confidence"],
            sources=result["sources"],
            history_length=result["history_length"],
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Knowledge chat generation failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate answer.",
        )


@router.post("/chat/stream")
async def stream_knowledge_chat(request: KnowledgeChatRequest):
    """
    Stream multi-turn AI study response token by token with session memory persistence.
    """
    try:
        return StreamingResponse(
            KnowledgeChatService.stream(
                session_id=request.session_id,
                workspace_id=request.workspace_id,
                question=request.question,
                limit=request.limit or 8,
            ),
            media_type="text/plain",
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Streaming knowledge chat failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Streaming failed.",
        )


@router.get(
    "/chat/{session_id}/history",
    response_model=SessionHistoryResponse,
)
async def get_session_history(session_id: str):
    """
    Retrieve message history for a specific chat session.
    """
    history = ConversationMemory.get_history(session_id)
    return SessionHistoryResponse(
        success=True,
        session_id=session_id,
        message_count=len(history),
        messages=[MessageItem(**m) for m in history],
    )


@router.delete(
    "/chat/{session_id}",
    status_code=status.HTTP_200_OK,
)
async def clear_session_history(session_id: str):
    """
    Clear/reset chat history for a session.
    """
    ConversationMemory.clear(session_id)
    return {
        "success": True,
        "message": f"Session '{session_id}' chat history cleared.",
    }
