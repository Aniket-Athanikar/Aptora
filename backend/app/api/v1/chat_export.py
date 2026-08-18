"""API endpoints for managing and retrieving PDF exports of Knowledge Chat sessions."""

import logging
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.database import SessionLocal
from app.models.chat_export import ChatExportDb
from app.models.knowledge_conversation import KnowledgeConversationDb
from app.models.user import UserDb
from app.schemas.knowledge import ChatExportResponse
from app.services.chat_export_service import ChatExportService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/knowledge",
    tags=["Chat Export"],
)


def _get_export_or_404(db: Session, export_id: str, user_id: int) -> ChatExportDb:
    export_rec = db.query(ChatExportDb).filter(
        ChatExportDb.id == export_id,
        ChatExportDb.user_id == user_id
    ).first()
    if not export_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Export task not found."
        )
    return export_rec


def run_export_worker(export_id: str):
    """Background worker task that creates a fresh database session and triggers generation."""
    db = SessionLocal()
    try:
        ChatExportService.generate_pdf(db, export_id)
    except Exception as e:
        logger.exception("Error running background export worker for %s", export_id)
    finally:
        db.close()


@router.post(
    "/conversations/{session_id}/export",
    response_model=ChatExportResponse,
    status_code=status.HTTP_202_ACCEPTED
)
def export_conversation(
    session_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user)
):
    """Initiate a background PDF export for a specific study conversation."""
    conversation = db.query(KnowledgeConversationDb).filter(
        KnowledgeConversationDb.id == session_id,
        KnowledgeConversationDb.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found."
        )

    # Check for duplicate pending/processing exports to avoid repeated clicks
    dup = db.query(ChatExportDb).filter(
        ChatExportDb.conversation_id == session_id,
        ChatExportDb.status.in_(["pending", "processing"])
    ).first()
    if dup:
        return dup

    # Create export tracking record
    export_rec = ChatExportDb(
        conversation_id=session_id,
        user_id=current_user.id,
        status="pending"
    )
    db.add(export_rec)
    db.commit()
    db.refresh(export_rec)

    # Queue background task
    background_tasks.add_task(run_export_worker, export_rec.id)

    return export_rec


@router.get(
    "/exports",
    response_model=list[ChatExportResponse]
)
def list_exports(
    q: Optional[str] = None,
    sort_by: str = "newest",
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user)
):
    """List PDF exports belonging only to the authenticated user with search, filtering, and sorting."""
    query = db.query(ChatExportDb).filter(ChatExportDb.user_id == current_user.id)
    if q:
        clean_q = f"%{q.strip()}%"
        # Join with conversation to search by title or filename
        query = query.join(ChatExportDb.conversation).filter(
            (ChatExportDb.file_name.ilike(clean_q)) |
            (KnowledgeConversationDb.title.ilike(clean_q))
        )
    
    if sort_by == "oldest":
        query = query.order_by(ChatExportDb.created_at.asc())
    elif sort_by == "largest":
        query = query.order_by(ChatExportDb.file_size.desc())
    else:
        query = query.order_by(ChatExportDb.created_at.desc())
        
    return query.offset(offset).limit(limit).all()


@router.get(
    "/exports/{export_id}",
    response_model=ChatExportResponse
)
def get_export_status(
    export_id: str,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user)
):
    """Get the status of a PDF export task."""
    return _get_export_or_404(db, export_id, current_user.id)


@router.get(
    "/exports/{export_id}/download",
    response_class=FileResponse
)
def download_exported_pdf(
    export_id: str,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user)
):
    """Securely stream/download the generated PDF file."""
    export_rec = _get_export_or_404(db, export_id, current_user.id)
    
    if export_rec.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Export is not ready. Current status: {export_rec.status}"
        )
        
    if not export_rec.storage_path or not os.path.exists(export_rec.storage_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exported PDF file not found on disk."
        )

    return FileResponse(
        path=export_rec.storage_path,
        media_type="application/pdf",
        filename=export_rec.file_name or f"export_{export_id}.pdf"
    )


@router.delete(
    "/exports/{export_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_export(
    export_id: str,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user)
):
    """Delete an export record and its generated file without deleting the conversation."""
    export_rec = _get_export_or_404(db, export_id, current_user.id)
    if export_rec.storage_path and os.path.exists(export_rec.storage_path):
        try:
            os.remove(export_rec.storage_path)
        except Exception:
            logger.exception("Failed to delete export file at %s", export_rec.storage_path)
    db.delete(export_rec)
    db.commit()
