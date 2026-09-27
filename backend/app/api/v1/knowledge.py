"""
Aptora — Knowledge API Router
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
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
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
        message_count=len(conversation.messages)
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
    q: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    query = db.query(KnowledgeConversationDb).filter(
        KnowledgeConversationDb.user_id == current_user.id,
    )
    if q:
        clean_q = f"%{q.strip()}%"
        query = query.filter(
            (KnowledgeConversationDb.title.ilike(clean_q)) |
            (KnowledgeConversationDb.messages.any(KnowledgeMessageDb.content.ilike(clean_q)))
        )
    conversations = query.order_by(
        KnowledgeConversationDb.pinned.desc(),
        KnowledgeConversationDb.last_message_at.desc(),
        KnowledgeConversationDb.created_at.desc()
    ).offset(offset).limit(limit).all()
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
async def knowledge_chat(
    request: KnowledgeChatRequest,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user)
):
    """
    Multi-turn AI study chat with session memory, confidence scoring, and source attribution.
    """
    request_id = http_request.headers.get("X-Request-ID") or str(uuid.uuid4())

    try:
        conversation = db.query(KnowledgeConversationDb).filter(KnowledgeConversationDb.id == request.session_id).first()
        if conversation:
            if conversation.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        else:
            conversation = KnowledgeConversationDb(
                id=request.session_id,
                user_id=current_user.id,
                workspace_id=request.workspace_id,
                subject_id=request.subject_id,
                title="New study session"
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        
        from app.models.ai_study_source import AiStudySourceDb
        active_sources = db.query(AiStudySourceDb.resource_id).filter(
            AiStudySourceDb.user_id == current_user.id,
            AiStudySourceDb.workspace_id == request.workspace_id,
            AiStudySourceDb.is_active == True,
        ).all()
        resource_ids = [s.resource_id for s in active_sources] if active_sources else None

        result = KnowledgeChatService.ask(
            session_id=request.session_id,
            workspace_id=request.workspace_id,
            question=request.question,
            limit=request.limit or 8,
            history=[{"role": message.role, "content": message.content} for message in conversation.messages] if conversation else None,
            subject_id=request.subject_id or (conversation.subject_id if conversation else None),
            resource_ids=resource_ids,
            user_id=current_user.id,
            request_id=request_id,
        )
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
async def stream_knowledge_chat(
    request: KnowledgeChatRequest,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user)
):
    """
    Stream multi-turn AI study response token by token with session memory persistence.
    """
    request_id = http_request.headers.get("X-Request-ID") or str(uuid.uuid4())
    media_type = "text/event-stream" if request.stream_format == "sse" else "text/plain"

    try:
        conversation = db.query(KnowledgeConversationDb).filter(KnowledgeConversationDb.id == request.session_id).first()
        if conversation:
            if conversation.user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        else:
            conversation = KnowledgeConversationDb(
                id=request.session_id,
                user_id=current_user.id,
                workspace_id=request.workspace_id,
                subject_id=request.subject_id,
                title="New study session"
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        from app.models.ai_study_source import AiStudySourceDb
        active_sources = db.query(AiStudySourceDb.resource_id).filter(
            AiStudySourceDb.user_id == current_user.id,
            AiStudySourceDb.workspace_id == request.workspace_id,
            AiStudySourceDb.is_active == True,
        ).all()
        resource_ids = [s.resource_id for s in active_sources] if active_sources else None

        return StreamingResponse(
            KnowledgeChatService.stream(
                session_id=request.session_id,
                workspace_id=request.workspace_id,
                question=request.question,
                limit=request.limit or 8,
                resource_ids=resource_ids,
                stream_format=request.stream_format or "plain",
                user_id=current_user.id,
                request_id=request_id,
            ),
            media_type=media_type,
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


@router.post(
    "/conversations/{session_id}/save-note",
    status_code=status.HTTP_201_CREATED
)
def save_conversation_as_note(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user)
):
    """Summarize and convert an AI study conversation into a structured study note."""
    import os
    import uuid
    conversation = _conversation_or_404(db, session_id, current_user.id)
    if not conversation.messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot save an empty conversation as a note."
        )

    # 1. Format the conversation turns as prompt context
    turns = []
    for msg in conversation.messages:
        role_label = "Student" if msg.role == "user" else "Assistant"
        turns.append(f"{role_label}: {msg.content}")
    conversation_text = "\n\n".join(turns)

    # 2. Invoke LLM to generate structured study notes
    from app.ai.services.llm_service import LLMService
    prompt = (
        "You are an expert academic note-taker. Analyze the following conversation between a student "
        "and an AI study assistant. Extract ALL useful study content and compile it into a comprehensive, "
        "professionally structured study note in Markdown format.\n\n"
        "STRICT RULES:\n"
        "- DO NOT include any multiple choice questions (MCQs), quizzes, sample questions, or test items.\n"
        "- DO NOT include any Q&A format content or practice exercises.\n"
        "- Focus ONLY on explanatory study content: concepts, definitions, theories, examples, and analysis.\n\n"
        "REQUIRED STRUCTURE:\n"
        "1. Start with an H1 title: '# Study Note: [Topic]'\n"
        "2. Add a brief 2-3 sentence overview/introduction paragraph.\n"
        "3. Organize content into logical H2 sections (## Section Title) and H3 subsections (### Subsection).\n"
        "4. Use bullet points for key facts and numbered lists for sequential processes.\n"
        "5. Use **bold** for key terms and definitions.\n"
        "6. Include relevant examples, diagrams descriptions, and real-world applications.\n"
        "7. Add a '## Key Takeaways' section at the end summarizing the most important points.\n\n"
        "Write in a clean, formal academic tone. Be thorough and detailed — capture every important "
        "concept discussed in the conversation. Do not skip or summarize away important details.\n\n"
        f"--- CONVERSATION ---\n{conversation_text}"
    )
    
    try:
        markdown_note = LLMService.generate(prompt)
    except Exception as e:
        logger.warning("LLM generate failed for conversation note %s (%s). Using fallback formatter.", session_id, e)
        title_str = conversation.title if hasattr(conversation, "title") and conversation.title else "Study Note"
        markdown_note = f"# Study Note: {title_str}\n\n## Overview\nAuto-generated summary from study conversation.\n\n## Conversation Notes\n\n{conversation_text}\n\n## Key Takeaways\n- Review key concepts discussed above."

    # 3. Create ResourceDb & ResourceContentDb records under ResourceType.NOTES
    from app.models.resource import ResourceDb
    from app.models.resource_content import ResourceContentDb
    from app.core.enums import ResourceType
    
    stored_filename = f"note_{uuid.uuid4()}.md"
    storage_path = f"app/uploads/{stored_filename}"
    
    os.makedirs("app/uploads", exist_ok=True)
    with open(storage_path, "w", encoding="utf-8") as f:
        f.write(markdown_note)

    # Find or set a valid subject_id
    subject_id = conversation.subject_id
    if not subject_id:
        from app.models.workspace_subject import WorkspaceSubjectDb
        subj = db.query(WorkspaceSubjectDb).filter(
            WorkspaceSubjectDb.workspace_id == conversation.workspace_id
        ).first()
        subject_id = subj.id if subj else None
        
    if not subject_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A subject is required to save notes. Ensure your workspace has at least one subject."
        )

    resource = ResourceDb(
        workspace_id=conversation.workspace_id,
        subject_id=subject_id,
        resource_type=ResourceType.NOTES,
        title=f"AI Note: {conversation.title}",
        description=f"Generated from study session: {conversation.title}",
        original_filename=f"{conversation.title.replace(' ', '_')}_notes.md",
        stored_filename=stored_filename,
        storage_path=storage_path,
        mime_type="text/markdown",
        file_size=len(markdown_note.encode("utf-8")),
        status="COMPLETED"
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)

    content_rec = ResourceContentDb(
        resource_id=resource.id,
        raw_text=markdown_note,
        cleaned_text=markdown_note
    )
    db.add(content_rec)
    db.commit()

    return {
        "success": True,
        "resource_id": resource.id,
        "title": resource.title,
        "message": "Conversation successfully saved as study note."
    }
