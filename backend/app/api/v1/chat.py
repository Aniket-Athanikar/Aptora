"""
ExamForge AI - Chat API

Endpoints
---------
POST /chat
POST /chat/stream
"""

import logging
import uuid
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse

from app.ai.services.chat_service import ChatService
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
)
from app.core.dependencies import get_current_user
from app.models.user import UserDb

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
    http_request: Request,
    current_user: UserDb = Depends(get_current_user),
):
    """
    Generate an AI response using the RAG pipeline.
    """
    request_id = http_request.headers.get("X-Request-ID") or str(uuid.uuid4())

    try:
        answer = ChatService.ask(
            workspace_id=request.workspace_id,
            question=request.question,
            user_id=current_user.id,
            request_id=request_id,
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
    http_request: Request,
    current_user: UserDb = Depends(get_current_user),
):
    """
    Stream an AI response using the RAG pipeline.
    """
    request_id = http_request.headers.get("X-Request-ID") or str(uuid.uuid4())
    media_type = "text/event-stream" if request.stream_format == "sse" else "text/plain"

    try:
        return StreamingResponse(
            ChatService.stream(
                workspace_id=request.workspace_id,
                question=request.question,
                stream_format=request.stream_format,
                user_id=current_user.id,
                request_id=request_id,
            ),
            media_type=media_type,
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
