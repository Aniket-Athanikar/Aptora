"""
ExamForge AI - Chat API

Endpoints
---------
POST /chat
POST /chat/stream
"""

import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.ai.services.chat_service import ChatService
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"],
)


# ==========================================================
# Chat
# ==========================================================

@router.post(
    "",
    response_model=ChatResponse,
)
async def chat(
    request: ChatRequest,
):
    """
    Generate an AI response using the RAG pipeline.
    """

    try:

        answer = ChatService.ask(
            workspace_id=request.workspace_id,
            question=request.question,
        )

        return ChatResponse(
            success=True,
            answer=answer,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:

        logger.exception(
            "Failed to generate chat response."
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate answer.",
        )


# ==========================================================
# Streaming Chat
# ==========================================================

@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
):
    """
    Stream an AI response using the RAG pipeline.
    """

    try:

        return StreamingResponse(
            ChatService.stream(
                workspace_id=request.workspace_id,
                question=request.question,
            ),
            media_type="text/plain",
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception:

        logger.exception(
            "Failed to stream chat response."
        )

        raise HTTPException(
            status_code=500,
            detail="Streaming failed.",
        )