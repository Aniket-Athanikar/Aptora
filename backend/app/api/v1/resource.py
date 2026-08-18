"""
ExamForge AI - Resource API
"""

import os
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.resource_service import ResourceService
from app.schemas.resource import ResourceResponse
from app.core.enums import ResourceType
from app.schemas.document_status import DocumentStatusResponse
from app.core.dependencies import get_current_user
from app.models.user import UserDb
from app.models.workspace import GoalWorkspaceDb
from app.models.workspace_subject import WorkspaceSubjectDb
from app.ai.services.qdrant_service import QdrantService
router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/upload",
    response_model=ResourceResponse,
)
def upload_document(
    workspace_id: int = Form(...),
    subject_id: int = Form(...),
    resource_type: ResourceType = Form(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    workspace = db.query(GoalWorkspaceDb).filter(
        GoalWorkspaceDb.id == workspace_id,
        GoalWorkspaceDb.user_id == current_user.id,
    ).first()
    if workspace is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found for the authenticated user.",
        )

    subject = db.query(WorkspaceSubjectDb).filter(
        WorkspaceSubjectDb.id == subject_id,
        WorkspaceSubjectDb.workspace_id == workspace_id,
    ).first()
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The selected subject does not belong to this workspace.",
        )

    return ResourceService.upload_resource(
        db=db,
        workspace_id=workspace_id,
        subject_id=subject_id,
        resource_type=resource_type,
        file=file,
        title=title,
        description=description,
    )

@router.patch(
    "/{resource_id}",
    response_model=ResourceResponse,
)
def rename_document(
    resource_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    return ResourceService.rename_resource(
        db=db,
        resource_id=resource_id,
        title=title,
        description=description,
    )

@router.post(
    "/{resource_id}/reprocess",
    response_model=ResourceResponse,
)
def reprocess_document(
    resource_id: int,
    db: Session = Depends(get_db),
):
    return ResourceService.reprocess_resource(
        db=db,
        resource_id=resource_id,
    )

@router.get(
    "/{resource_id}/status",
    response_model=DocumentStatusResponse,
)
def get_document_status(
    resource_id: int,
    db: Session = Depends(get_db),
):
    resource = ResourceService.get_resource(
        db=db,
        resource_id=resource_id,
    )

    return DocumentStatusResponse(
        resource_id=resource.id,
        status=resource.status,
    )

@router.get(
    "/{resource_id}",
    response_model=ResourceResponse,
)
def get_document(
    resource_id: int,
    db: Session = Depends(get_db),
):
    return ResourceService.get_resource(
        db=db,
        resource_id=resource_id,
    )


@router.get("/workspace/{workspace_id}")
def get_workspace_documents(
    workspace_id: int,
    db: Session = Depends(get_db),
):
    return ResourceService.get_workspace_resources(
        db=db,
        workspace_id=workspace_id,
    )


@router.get("/subject/{subject_id}")
def get_subject_documents(
    subject_id: int,
    resource_type: Optional[ResourceType] = None,
    db: Session = Depends(get_db),
):
    return ResourceService.get_subject_resources(
        db=db,
        subject_id=subject_id,
        resource_type=resource_type,
    )


@router.delete("/{resource_id}")
def delete_document(
    resource_id: int,
    db: Session = Depends(get_db),
):
    return ResourceService.delete_resource(
        db=db,
        resource_id=resource_id,
    )


@router.get("/{resource_id}/index-diagnostics")
def get_document_index_diagnostics(resource_id: int, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    resource = ResourceService.get_resource(db=db, resource_id=resource_id)
    workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.id == resource.workspace_id, GoalWorkspaceDb.user_id == current_user.id).first()
    if workspace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")
    details = QdrantService.diagnostics(workspace_id=resource.workspace_id, resource_id=resource.id)
    return {"resource_id": resource.id, "resource_status": resource.status, "chunk_records": len(resource.chunks), **details}


@router.get("/{resource_id}/preview")
def get_document_preview(resource_id: int, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    resource = ResourceService.get_resource(db=db, resource_id=resource_id)
    workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.id == resource.workspace_id, GoalWorkspaceDb.user_id == current_user.id).first()
    if workspace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")
    chunks = sorted(resource.chunks, key=lambda c: c.chunk_index)
    if not chunks and resource.content and resource.content.raw_text:
        return {
            "resource_id": resource.id,
            "title": resource.title,
            "chunks": [{"index": 0, "content": resource.content.raw_text}]
        }
    return {
        "resource_id": resource.id,
        "title": resource.title,
        "chunks": [{"index": c.chunk_index, "content": c.content} for c in chunks]
    }


@router.get("/{resource_id}/file")
def get_document_file(resource_id: int, db: Session = Depends(get_db)):
    resource = ResourceService.get_resource(db=db, resource_id=resource_id)
    if not resource or not resource.storage_path or not os.path.exists(resource.storage_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Original document file not found.")
    return FileResponse(
        path=resource.storage_path,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "inline",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.get("/{resource_id}/download-pdf")
def download_note_as_pdf(resource_id: int, db: Session = Depends(get_db), current_user: UserDb = Depends(get_current_user)):
    """Generate a styled PDF from an AI study note's markdown content and return it as a direct download."""
    import tempfile
    import datetime
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from app.services.chat_export_service import MarkdownToReportLabConverter, ChatExportService, NumberedCanvas

    resource = ResourceService.get_resource(db=db, resource_id=resource_id)
    workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.id == resource.workspace_id, GoalWorkspaceDb.user_id == current_user.id).first()
    if workspace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    # Get markdown content from resource_content or chunks
    markdown_text = ""
    if resource.content and resource.content.raw_text:
        markdown_text = resource.content.raw_text
    elif resource.chunks:
        chunks = sorted(resource.chunks, key=lambda c: c.chunk_index)
        markdown_text = "\n\n".join(c.content for c in chunks)

    if not markdown_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No content available to export.")

    # Generate PDF to a temp file
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    tmp.close()

    doc = SimpleDocTemplate(
        tmp.name,
        pagesize=letter,
        leftMargin=54, rightMargin=54,
        topMargin=54, bottomMargin=54
    )

    styles = ChatExportService.get_style_sheet()
    flowables = []

    # Cover page
    flowables.append(Spacer(1, 100))
    flowables.append(Paragraph(
        '<font size="12" color="#6366f1"><b>EXAMFORGE AI — STUDY NOTE</b></font>',
        styles['body']
    ))
    divider = Table([['']], colWidths=[500], rowHeights=[3])
    divider.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#6366f1')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    flowables.append(divider)
    flowables.append(Spacer(1, 15))

    title_style = ParagraphStyle(
        'CoverTitle', fontName='Helvetica-Bold', fontSize=28,
        leading=34, textColor=colors.HexColor('#0f172a'),
    )
    flowables.append(Paragraph(resource.title, title_style))
    flowables.append(Spacer(1, 40))

    date_str = datetime.datetime.utcnow().strftime("%B %d, %Y")
    meta = [
        [Paragraph("<b>Document Type:</b>", styles['table_header']), Paragraph("AI Study Note", styles['table_cell'])],
        [Paragraph("<b>Date Generated:</b>", styles['table_header']), Paragraph(date_str, styles['table_cell'])],
        [Paragraph("<b>Exam Context:</b>", styles['table_header']), Paragraph(workspace.target_exam if workspace else "General", styles['table_cell'])],
    ]
    meta_table = Table(meta, colWidths=[120, 380])
    meta_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#f1f5f9')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
    ]))
    flowables.append(meta_table)
    flowables.append(PageBreak())

    # Convert markdown body to PDF flowables
    converter = MarkdownToReportLabConverter(styles)
    body_flowables = converter.convert(markdown_text)
    flowables.extend(body_flowables)

    doc.build(flowables, canvasmaker=NumberedCanvas)

    safe_title = resource.title.replace(" ", "_")[:50]
    return FileResponse(
        path=tmp.name,
        media_type="application/pdf",
        filename=f"ExamForge_Note_{safe_title}.pdf",
        headers={
            "Content-Disposition": f'attachment; filename="ExamForge_Note_{safe_title}.pdf"',
        }
    )
