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

import datetime
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.ai.memory.conversation_memory import ConversationMemory
from app.ai.services.knowledge_chat_service import KnowledgeChatService
from app.core.dependencies import get_current_user, get_db
from app.models.knowledge_conversation import KnowledgeConversationDb, KnowledgeMessageDb
from app.models.user import UserDb
from app.models.workspace import GoalWorkspaceDb
from app.schemas.knowledge import (
    ConversationCreateRequest,
    ConversationDetail,
    ConversationRenameRequest,
    ConversationSummary,
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


def _conversation_or_404(db: Session, session_id: str, user_id: int) -> KnowledgeConversationDb:
    conversation = db.query(KnowledgeConversationDb).filter(
        KnowledgeConversationDb.id == session_id,
        KnowledgeConversationDb.user_id == user_id,
    ).first()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    return conversation


def _summary(conversation: KnowledgeConversationDb) -> ConversationSummary:
    last_message = next((message.content for message in reversed(conversation.messages) if message.role == "user"), None)
    return ConversationSummary(
        session_id=conversation.id, workspace_id=conversation.workspace_id, subject_id=conversation.subject_id,
        title=conversation.title, created_at=conversation.created_at, updated_at=conversation.updated_at,
        last_message_at=conversation.last_message_at, pinned=conversation.pinned, last_message=last_message,
    )


def _title_from_question(question: str) -> str:
    text = question.strip().rstrip("?.! ")
    for prefix in ("explain ", "what is ", "tell me about ", "help me understand "):
        if text.lower().startswith(prefix):
            text = text[len(prefix):]
            break
    return (text[:252].strip().capitalize() or "New study session")


def _persist_turn(db: Session, conversation: KnowledgeConversationDb, question: str, result: dict) -> None:
    now = datetime.datetime.utcnow()
    if not conversation.messages:
        conversation.title = _title_from_question(question)
    db.add_all([
        KnowledgeMessageDb(conversation_id=conversation.id, role="user", content=question),
        KnowledgeMessageDb(conversation_id=conversation.id, role="assistant", content=result["answer"], sources=result["sources"], confidence=result["confidence"]),
    ])
    conversation.last_message_at = now
    conversation.updated_at = now
    db.commit()


@router.get("/conversations", response_model=list[ConversationSummary])
def list_conversations(
    db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user),
):
    conversations = db.query(KnowledgeConversationDb).filter(
        KnowledgeConversationDb.user_id == current_user.id,
    ).order_by(KnowledgeConversationDb.pinned.desc(), KnowledgeConversationDb.last_message_at.desc(), KnowledgeConversationDb.created_at.desc()).all()
    return [_summary(conversation) for conversation in conversations]


@router.post("/conversations", response_model=ConversationSummary, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreateRequest, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user),
):
    workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.id == payload.workspace_id, GoalWorkspaceDb.user_id == current_user.id).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found.")
    conversation = KnowledgeConversationDb(user_id=current_user.id, workspace_id=payload.workspace_id, subject_id=payload.subject_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return _summary(conversation)


@router.get("/conversations/{session_id}", response_model=ConversationDetail)
def get_conversation(session_id: str, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    conversation = _conversation_or_404(db, session_id, current_user.id)
    return ConversationDetail(**_summary(conversation).model_dump(), messages=[
        {"role": message.role, "content": message.content, "sources": message.sources, "confidence": message.confidence, "created_at": message.created_at}
        for message in conversation.messages
    ])


@router.patch("/conversations/{session_id}", response_model=ConversationSummary)
def rename_conversation(session_id: str, payload: ConversationRenameRequest, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    conversation = _conversation_or_404(db, session_id, current_user.id)
    conversation.title = payload.title.strip()
    db.commit(); db.refresh(conversation)
    return _summary(conversation)


@router.delete("/conversations/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(session_id: str, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    conversation = _conversation_or_404(db, session_id, current_user.id)
    ConversationMemory.clear(session_id)
    db.delete(conversation); db.commit()


@router.post("/conversations/{session_id}/pin", response_model=ConversationSummary)
def toggle_conversation_pin(session_id: str, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    conversation = _conversation_or_404(db, session_id, current_user.id)
    conversation.pinned = not conversation.pinned
    db.commit(); db.refresh(conversation)
    return _summary(conversation)


@router.post(
    "/chat",
    response_model=KnowledgeChatResponse,
    status_code=status.HTTP_200_OK,
)
async def knowledge_chat(request: KnowledgeChatRequest, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    """
    Multi-turn AI study chat with session memory, confidence scoring, and source attribution.
    """
    try:
        conversation = db.query(KnowledgeConversationDb).filter(KnowledgeConversationDb.id == request.session_id).first()
        if conversation and conversation.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        result = KnowledgeChatService.ask(
            session_id=request.session_id,
            workspace_id=request.workspace_id,
            question=request.question,
            limit=request.limit or 8,
            history=[{"role": message.role, "content": message.content} for message in conversation.messages] if conversation else None,
            subject_id=request.subject_id or (conversation.subject_id if conversation else None),
        )
        if conversation:
            _persist_turn(db, conversation, request.question, result)

        return KnowledgeChatResponse(
            success=True,
            session_id=result["session_id"],
            answer=result["answer"],
            confidence=result["confidence"],
            sources=result["sources"],
            context_found=result["context_found"],
            history_length=result["history_length"],
        )
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Knowledge chat generation failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge chat generation failed: {exc}",
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
            detail=f"Streaming knowledge chat failed: {exc}",
        )


@router.get("/chat/{session_id}/history", response_model=SessionHistoryResponse)
async def get_session_history(session_id: str, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    """
    Retrieve message history for a specific chat session.
    """
    conversation = db.query(KnowledgeConversationDb).filter(KnowledgeConversationDb.id == session_id).first()
    if conversation and conversation.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    history = ([{"role": message.role, "content": message.content} for message in conversation.messages] if conversation else ConversationMemory.get_history(session_id))
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
async def clear_session_history(session_id: str, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    """
    Clear/reset chat history for a session.
    """
    ConversationMemory.clear(session_id)
    conversation = db.query(KnowledgeConversationDb).filter(KnowledgeConversationDb.id == session_id).first()
    if conversation:
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        db.query(KnowledgeMessageDb).filter(KnowledgeMessageDb.conversation_id == session_id).delete()
        conversation.last_message_at = None
        db.commit()
    return {
        "success": True,
        "message": f"Session '{session_id}' chat history cleared.",
    }
