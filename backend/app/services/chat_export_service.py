"""Service for generating professionally styled PDFs from Knowledge Chat sessions."""

import datetime
import logging
import os
import uuid
from pathlib import Path

from markdown_it import MarkdownIt
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

from app.models.chat_export import ChatExportDb
from app.models.knowledge_conversation import KnowledgeConversationDb
from app.models.workspace import GoalWorkspaceDb
from app.models.user import UserDb
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

EXPORT_DIR = Path("app/uploads/exports")


class NumberedCanvas(canvas.Canvas):
    """Canvas that performs a two-pass render to draw 'Page X of Y' page numbers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number_and_header(num_pages)
            super().showPage()
        super().save()

    def draw_page_number_and_header(self, page_count):
        # Page 1 is the cover page: suppress header and footer
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b")) # slate-500

        # Header
        self.drawString(54, 750, "Aptora — Study Session Export")
        self.setStrokeColor(colors.HexColor("#e2e8f0")) # slate-200
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Footer
        self.line(54, 60, 558, 60)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 45, page_text)
        self.drawString(54, 45, "Confidential — Personal Study Document")
        
        self.restoreState()


def escape_xml(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("'", "&apos;")


def render_inline(inline_token) -> str:
    if not inline_token.children:
        return escape_xml(inline_token.content)

    html = ""
    for child in inline_token.children:
        if child.type == "text":
            html += escape_xml(child.content)
        elif child.type == "code_inline":
            html += f'<font face="Courier" color="#0f172a" backColor="#f1f5f9"> {escape_xml(child.content)} </font>'
        elif child.type == "em_open":
            html += "<i>"
        elif child.type == "em_close":
            html += "</i>"
        elif child.type == "strong_open":
            html += "<b>"
        elif child.type == "strong_close":
            html += "</b>"
        elif child.type == "link_open":
            href = child.attrs.get("href", "")
            html += f'<link href="{escape_xml(href)}" color="#4f46e5"><u>'
        elif child.type == "link_close":
            html += "</u></link>"
        elif child.type == "softbreak" or child.type == "hardbreak":
            html += "<br/>"
    return html


class MarkdownToReportLabConverter:
    """Parses Markdown text and converts it to ReportLab Flowables."""
    def __init__(self, styles):
        self.styles = styles
        self.flowables = []
        self.md = MarkdownIt().enable('table')

    def convert(self, markdown_text: str) -> list:
        tokens = self.md.parse(markdown_text)
        self.process_tokens(tokens)
        return self.flowables

    def process_tokens(self, tokens):
        i = 0
        n = len(tokens)
        while i < n:
            token = tokens[i]
            if token.type == "heading_open":
                level = int(token.tag[1])
                inline_token = tokens[i+1]
                html_content = render_inline(inline_token)
                style = self.styles.get(f'h{level}', self.styles['h3'])
                self.flowables.append(Paragraph(html_content, style))
                i += 3
            elif token.type == "paragraph_open":
                inline_token = tokens[i+1]
                html_content = render_inline(inline_token)
                self.flowables.append(Paragraph(html_content, self.styles['body']))
                i += 3
            elif token.type in ("bullet_list_open", "ordered_list_open"):
                list_type = "bullet" if token.type == "bullet_list_open" else "ordered"
                i += 1
                list_item_count = 1
                while i < n and tokens[i].type != f"{list_type}_list_close":
                    t = tokens[i]
                    if t.type == "list_item_open":
                        item_tokens = []
                        i += 1
                        while i < n and tokens[i].type != "list_item_close":
                            item_tokens.append(tokens[i])
                            i += 1
                        
                        item_text = ""
                        for it in item_tokens:
                            if it.type == "inline":
                                item_text += render_inline(it)
                            elif it.type == "paragraph_open":
                                pass
                        
                        if list_type == "bullet":
                            prefix = '<font color="#6366f1">&bull;</font>  '
                            self.flowables.append(Paragraph(f"{prefix}{item_text}", self.styles['bullet']))
                        else:
                            prefix = f'<font color="#6366f1">{list_item_count}.</font>  '
                            self.flowables.append(Paragraph(f"{prefix}{item_text}", self.styles['ordered']))
                            list_item_count += 1
                    i += 1
                i += 1
            elif token.type == "blockquote_open":
                quote_tokens = []
                i += 1
                while i < n and tokens[i].type != "blockquote_close":
                    quote_tokens.append(tokens[i])
                    i += 1
                
                quote_text = ""
                for qt in quote_tokens:
                    if qt.type == "inline":
                        quote_text += render_inline(qt)
                    elif qt.type == "paragraph_open" and quote_text:
                        quote_text += "<br/><br/>"
                
                p = Paragraph(quote_text, self.styles['blockquote'])
                t = Table([[p]], colWidths=[480])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
                    ('LINELEFT', (0,0), (0,-1), 3, colors.HexColor('#6366f1')),
                    ('TOPPADDING', (0,0), (-1,-1), 8),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                    ('LEFTPADDING', (0,0), (-1,-1), 12),
                    ('RIGHTPADDING', (0,0), (-1,-1), 12),
                ]))
                self.flowables.append(t)
                self.flowables.append(Spacer(1, 8))
                i += 1
            elif token.type == "fence":
                code_content = token.content
                lines = code_content.split('\n')
                if lines and not lines[-1]:
                    lines.pop() # remove final empty line from split
                
                formatted_lines = []
                for line in lines:
                    leading_spaces = len(line) - len(line.lstrip(' '))
                    line_content = '&nbsp;' * leading_spaces + escape_xml(line.lstrip(' '))
                    formatted_lines.append(line_content)
                html_code = "<br/>".join(formatted_lines)
                
                p = Paragraph(html_code, self.styles['code_block'])
                t = Table([[p]], colWidths=[500])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
                    ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                    ('TOPPADDING', (0,0), (-1,-1), 8),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                    ('LEFTPADDING', (0,0), (-1,-1), 10),
                    ('RIGHTPADDING', (0,0), (-1,-1), 10),
                ]))
                self.flowables.append(t)
                self.flowables.append(Spacer(1, 8))
                i += 1
            elif token.type == "table_open":
                table_data = []
                i += 1
                while i < n and tokens[i].type != "table_close":
                    t = tokens[i]
                    if t.type == "tr_open":
                        row_cells = []
                        i += 1
                        while i < n and tokens[i].type != "tr_close":
                            tc = tokens[i]
                            if tc.type in ("th_open", "td_open"):
                                is_header = tc.type == "th_open"
                                cell_tokens = []
                                i += 1
                                while i < n and tokens[i].type not in ("th_close", "td_close"):
                                    cell_tokens.append(tokens[i])
                                    i += 1
                                
                                cell_text = ""
                                for ct in cell_tokens:
                                    if ct.type == "inline":
                                        cell_text += render_inline(ct)
                                
                                style = self.styles['table_header'] if is_header else self.styles['table_cell']
                                row_cells.append(Paragraph(cell_text, style))
                            i += 1
                        table_data.append(row_cells)
                    i += 1
                
                if table_data:
                    col_count = max(len(row) for row in table_data)
                    col_width = 500 / col_count if col_count > 0 else 500
                    col_widths = [col_width] * col_count
                    
                    t = Table(table_data, colWidths=col_widths, repeatRows=1)
                    t_style = [
                        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                        ('TOPPADDING', (0,0), (-1,-1), 6),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                        ('LEFTPADDING', (0,0), (-1,-1), 8),
                        ('RIGHTPADDING', (0,0), (-1,-1), 8),
                    ]
                    if len(table_data) > 0:
                        t_style.append(('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')))
                    
                    t.setStyle(TableStyle(t_style))
                    self.flowables.append(t)
                    self.flowables.append(Spacer(1, 8))
                i += 1
            else:
                i += 1


class ChatExportService:

    @staticmethod
    def get_style_sheet():
        styles = getSampleStyleSheet()
        
        # Heading styles
        h1 = ParagraphStyle(
            'H1',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True
        )
        h2 = ParagraphStyle(
            'H2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=12,
            spaceAfter=5,
            keepWithNext=True
        )
        h3 = ParagraphStyle(
            'H3',
            parent=styles['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=10,
            spaceAfter=4,
            keepWithNext=True
        )
        
        # Body and elements
        body = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155'),
            spaceAfter=8
        )
        bullet = ParagraphStyle(
            'Bullet',
            parent=body,
            leftIndent=20,
            firstLineIndent=-10,
            spaceAfter=4
        )
        ordered = ParagraphStyle(
            'Ordered',
            parent=body,
            leftIndent=20,
            firstLineIndent=-10,
            spaceAfter=4
        )
        blockquote = ParagraphStyle(
            'Blockquote',
            parent=body,
            fontName='Helvetica-Oblique',
            textColor=colors.HexColor('#475569'),
            leftIndent=0,
            spaceAfter=0
        )
        code_block = ParagraphStyle(
            'CodeBlock',
            parent=styles['Normal'],
            fontName='Courier',
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor('#0f172a')
        )
        
        # Tables
        table_header = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#1e293b'),
        )
        table_cell = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#334155'),
        )
        
        # Roles and badges
        role_user = ParagraphStyle(
            'RoleUser',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#0f172a'),
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True
        )
        role_assistant = ParagraphStyle(
            'RoleAssistant',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#4f46e5'), # purple-600
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True
        )
        
        custom_styles = {
            'h1': h1, 'h2': h2, 'h3': h3,
            'body': body, 'bullet': bullet, 'ordered': ordered,
            'blockquote': blockquote, 'code_block': code_block,
            'table_header': table_header, 'table_cell': table_cell,
            'role_user': role_user, 'role_assistant': role_assistant
        }
        return custom_styles

    @classmethod
    def generate_pdf(cls, db: Session, export_id: str) -> None:
        """Background worker that generates the PDF and updates the database record status."""
        export_rec = db.query(ChatExportDb).filter(ChatExportDb.id == export_id).first()
        if not export_rec:
            logger.error("Export record %s not found.", export_id)
            return

        export_rec.status = "processing"
        db.commit()

        try:
            conversation = db.query(KnowledgeConversationDb).filter(
                KnowledgeConversationDb.id == export_rec.conversation_id
            ).first()
            if not conversation:
                raise ValueError("Conversation not found")

            # Create output directory
            EXPORT_DIR.mkdir(parents=True, exist_ok=True)
            unique_filename = f"{export_id}.pdf"
            file_path = EXPORT_DIR / unique_filename

            # Get user and exam context
            user = db.query(UserDb).filter(UserDb.id == export_rec.user_id).first()
            workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.id == conversation.workspace_id).first()
            exam_context = workspace.target_exam if workspace else "General Study Session"

            # Setup ReportLab Doc
            doc = SimpleDocTemplate(
                str(file_path),
                pagesize=letter,
                leftMargin=54,
                rightMargin=54,
                topMargin=54,
                bottomMargin=54
            )

            styles = cls.get_style_sheet()
            flowables = []

            # ----------------------------------------------------
            # PAGE 1: COVER PAGE
            # ----------------------------------------------------
            flowables.append(Spacer(1, 100))
            
            # Subtitle/Branding prefix
            flowables.append(Paragraph(
                '<font size="12" color="#6366f1"><b>Aptora ASSISTANT</b></font>',
                styles['body']
            ))
            
            # Thick purple divider line
            divider = Table([['']], colWidths=[500], rowHeights=[3])
            divider.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#6366f1')),
                ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
            ]))
            flowables.append(divider)
            flowables.append(Spacer(1, 15))

            # Main Title
            title_style = ParagraphStyle(
                'CoverTitle',
                fontName='Helvetica-Bold',
                fontSize=28,
                leading=34,
                textColor=colors.HexColor('#0f172a'),
            )
            flowables.append(Paragraph(conversation.title, title_style))
            flowables.append(Spacer(1, 40))

            # Metadata Table
            date_str = datetime.datetime.utcnow().strftime("%B %d, %Y")
            metadata_data = [
                [Paragraph("<b>Document Type:</b>", styles['table_header']), Paragraph("Study Session Export", styles['table_cell'])],
                [Paragraph("<b>Date Generated:</b>", styles['table_header']), Paragraph(date_str, styles['table_cell'])],
                [Paragraph("<b>Total Messages:</b>", styles['table_header']), Paragraph(str(len(conversation.messages)), styles['table_cell'])],
                [Paragraph("<b>Exam Context:</b>", styles['table_header']), Paragraph(exam_context, styles['table_cell'])],
                [Paragraph("<b>Student:</b>", styles['table_header']), Paragraph(user.name if user else "Student", styles['table_cell'])]
            ]
            
            metadata_table = Table(metadata_data, colWidths=[120, 380])
            metadata_table.setStyle(TableStyle([
                ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#f1f5f9')),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
            ]))
            flowables.append(metadata_table)
            
            flowables.append(PageBreak())

            # ----------------------------------------------------
            # PAGES 2+: CHAT CONTENT
            # ----------------------------------------------------
            converter = MarkdownToReportLabConverter(styles)
            
            for msg in conversation.messages:
                # Message Role Label
                role_label = "STUDENT" if msg.role == "user" else "Aptora ASSISTANT"
                role_style = styles['role_user'] if msg.role == "user" else styles['role_assistant']
                
                # Keep the label and first few lines of content together to avoid orphan labels
                msg_elements = []
                msg_elements.append(Spacer(1, 10))
                msg_elements.append(Paragraph(role_label, role_style))
                
                # Thick role divider
                line_color = '#e2e8f0' if msg.role == 'user' else '#c7d2fe'
                msg_divider = Table([['']], colWidths=[500], rowHeights=[1])
                msg_divider.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(line_color)),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 0),
                    ('TOPPADDING', (0,0), (-1,-1), 0),
                ]))
                msg_elements.append(msg_divider)
                msg_elements.append(Spacer(1, 8))
                
                # Convert Markdown message body
                body_flowables = converter.convert(msg.content or "")
                msg_elements.extend(body_flowables)

                # Sources if present (Grounding/RAG)
                if msg.role == "assistant" and msg.sources:
                    sources_title = Paragraph("<b>Sources & References:</b>", styles['table_header'])
                    msg_elements.append(Spacer(1, 6))
                    msg_elements.append(sources_title)
                    for src in msg.sources:
                        title = src.get("title") or src.get("file_name") or "Unknown Document"
                        page = src.get("page")
                        page_suffix = f" (Page {page})" if page else ""
                        snippet = src.get("snippet") or ""
                        snippet_block = f': "{snippet[:100]}..."' if snippet else ""
                        
                        src_text = f'<font color="#4f46e5">&bull;</font> {title}{page_suffix}{snippet_block}'
                        msg_elements.append(Paragraph(src_text, styles['table_cell']))
                # Avoid wrapping the entire message in KeepTogether as long chat responses must be allowed to break across pages.
                flowables.extend(msg_elements)
                flowables.append(Spacer(1, 15))

            # Build Document using NumberedCanvas
            doc.build(flowables, canvasmaker=NumberedCanvas)

            # Update DB export status to completed
            export_rec.status = "completed"
            export_rec.file_name = f"Aptora_Export_{conversation.title.replace(' ', '_')[:50]}.pdf"
            export_rec.storage_path = str(file_path)
            export_rec.file_size = file_path.stat().st_size
            export_rec.completed_at = datetime.datetime.utcnow()
            db.commit()
            
            logger.info("PDF Export completed successfully for record %s", export_id)

        except Exception as e:
            logger.exception("PDF generation failed for export %s", export_id)
            export_rec.status = "failed"
            export_rec.error_message = str(e)
            export_rec.completed_at = datetime.datetime.utcnow()
            db.commit()
