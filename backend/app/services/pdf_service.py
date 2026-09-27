"""
Aptora — Premium Invoice PDF Generator Service
Generates pixel-perfect, highly styled PDF invoices using ReportLab.
"""
import io
import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

# Aptora Brand Palette
PRIMARY_COLOR = colors.HexColor("#084C38")      # Deep Emerald
ACCENT_MINT = colors.HexColor("#ECFDF5")        # Soft Mint Background
ACCENT_BORDER = colors.HexColor("#D1FAE5")      # Mint Border
TEXT_DARK = colors.HexColor("#0F172A")          # Slate 900
TEXT_MUTED = colors.HexColor("#64748B")         # Slate 500
BG_OFFWHITE = colors.HexColor("#FAF9F6")        # Warm Off-White
CARD_BG = colors.HexColor("#F8FAFC")            # Soft Slate 50
BORDER_COLOR = colors.HexColor("#E2E8F0")       # Light Slate Border

def generate_invoice_pdf(
    email: str,
    plan_name: str,
    cycle: str,
    amount: str,
    txn_id: str,
    user_name: str = "Valued Customer"
) -> bytes:
    """
    Generates a modern, premium PDF invoice and returns the raw bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=TEXT_DARK,
        alignment=TA_LEFT
    )

    brand_badge_style = ParagraphStyle(
        'BrandBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=PRIMARY_COLOR,
        alignment=TA_RIGHT
    )

    tagline_style = ParagraphStyle(
        'Tagline',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=TA_LEFT
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=PRIMARY_COLOR,
        alignment=TA_LEFT
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=TEXT_MUTED,
        alignment=TA_LEFT
    )

    meta_value = ParagraphStyle(
        'MetaValue',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=TEXT_DARK,
        alignment=TA_LEFT
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=TA_LEFT
    )

    table_header_right = ParagraphStyle(
        'TableHeaderRight',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=TA_RIGHT
    )

    item_title = ParagraphStyle(
        'ItemTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=TEXT_DARK,
        alignment=TA_LEFT
    )

    item_desc = ParagraphStyle(
        'ItemDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=TEXT_MUTED,
        alignment=TA_LEFT
    )

    item_amount = ParagraphStyle(
        'ItemAmount',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=TEXT_DARK,
        alignment=TA_RIGHT
    )

    total_label = ParagraphStyle(
        'TotalLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=PRIMARY_COLOR,
        alignment=TA_LEFT
    )

    total_amount = ParagraphStyle(
        'TotalAmount',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=18,
        textColor=PRIMARY_COLOR,
        alignment=TA_RIGHT
    )

    footer_text = ParagraphStyle(
        'FooterText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_MUTED,
        alignment=TA_CENTER
    )

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>APTORA</b>", title_style),
            Paragraph("<font color='#084C38'><b>OFFICIAL TAX INVOICE</b></font><br/><font color='#64748B' size='8'>STUADY KATTA AI PREP</font>", brand_badge_style)
        ],
        [
            Paragraph("Smart AI Educational Ecosystem & Exam Engine", tagline_style),
            Paragraph("Status: <font color='#084C38'><b>PAID & VERIFIED ✔</b></font>", brand_badge_style)
        ]
    ]

    header_table = Table(header_data, colWidths=[320, 202])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 15))

    # Divider Line
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY_COLOR, spaceBefore=0, spaceAfter=15))

    # 2. Customer & Transaction Metadata Box
    date_str = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")
    
    meta_box_data = [
        [
            Paragraph("CUSTOMER INFORMATION", section_heading),
            Paragraph("PAYMENT DETAILS", section_heading)
        ],
        [
            Paragraph("Customer Name", meta_label),
            Paragraph("Billing Date & Time", meta_label)
        ],
        [
            Paragraph(f"<b>{user_name}</b>", meta_value),
            Paragraph(f"<b>{date_str}</b>", meta_value)
        ],
        [
            Paragraph("Registered Email", meta_label),
            Paragraph("Transaction ID", meta_label)
        ],
        [
            Paragraph(f"<b>{email}</b>", meta_value),
            Paragraph(f"<font name='Courier-Bold'>{txn_id}</font>", meta_value)
        ],
        [
            Paragraph("Account Tier", meta_label),
            Paragraph("Payment Gateway", meta_label)
        ],
        [
            Paragraph(f"<b>{plan_name.capitalize()} Member</b>", meta_value),
            Paragraph("<b>Aptora SecurePay (UPI/Card)</b>", meta_value)
        ]
    ]

    meta_table = Table(meta_box_data, colWidths=[261, 261])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    story.append(meta_table)
    story.append(Spacer(1, 20))

    # 3. Itemized Invoice Breakdown
    try:
        total_val = int(float(amount))
        gst_val = round(total_val * 0.18 / 1.18)
        base_val = total_val - gst_val
    except Exception:
        total_val = 0
        gst_val = 0
        base_val = 0

    items_data = [
        [
            Paragraph("ITEM DESCRIPTION", table_header),
            Paragraph("BILLING CYCLE", table_header),
            Paragraph("AMOUNT (INR)", table_header_right)
        ],
        [
            Paragraph(f"<b>Aptora {plan_name.capitalize()} Plan</b><br/><font size='8' color='#64748B'>Full access to AI Question Generator, Notes, Mock Tests & 24/7 AI Coach.</font>", item_title),
            Paragraph(f"<b>{cycle.capitalize()}</b>", item_title),
            Paragraph(f"₹{base_val:.2f}", item_amount)
        ],
        [
            Paragraph("<b>GST / IGST (18% Tax Rate)</b>", item_desc),
            Paragraph("Inclusive Tax", item_desc),
            Paragraph(f"₹{gst_val:.2f}", ParagraphStyle('RightMuted', parent=item_desc, alignment=TA_RIGHT))
        ]
    ]

    items_table = Table(items_data, colWidths=[310, 112, 100])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    story.append(items_table)
    story.append(Spacer(1, 10))

    # Grand Total Banner
    total_data = [
        [
            Paragraph("<b>TOTAL AMOUNT PAID</b>", total_label),
            Paragraph(f"<b>₹{total_val:.2f}</b>", total_amount)
        ]
    ]
    total_table = Table(total_data, colWidths=[350, 172])
    total_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT_MINT),
        ('BOX', (0,0), (-1,-1), 1, ACCENT_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 16),
        ('RIGHTPADDING', (0,0), (-1,-1), 16),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    story.append(total_table)
    story.append(Spacer(1, 30))

    # 4. Features Included & Support Notes
    features_data = [
        [
            Paragraph("<font color='#084C38'><b>WHAT'S INCLUDED IN YOUR SUBSCRIPTION</b></font>", section_heading)
        ],
        [
            Paragraph(
                "• <b>Unlimited AI Study Material Generation:</b> Transform textbooks, PYQs, and notes into instant summaries.<br/>"
                "• <b>Custom Mock Exam Engine:</b> Practice with exam-style questions adapted to your syllabus.<br/>"
                "• <b>24/7 AI Personal Coach:</b> Instant query resolution & performance feedback.<br/>"
                "• <b>Priority Multi-Device Sync:</b> Access your study katta across mobile, tablet, and desktop.",
                item_desc
            )
        ]
    ]

    features_table = Table(features_data, colWidths=[522])
    features_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FAFAF9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E7E5E4")),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ]))

    story.append(features_table)
    story.append(Spacer(1, 35))

    # 5. Footer & Legal Information
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_COLOR, spaceBefore=0, spaceAfter=12))
    story.append(Paragraph(
        "Thank you for choosing <b>Aptora</b>! Your subscription supports AI-driven education.<br/>"
        "Need help or have billing questions? Contact us at <b>agentforge29@gmail.com</b> or visit <b>https://aptora.ai/support</b>.<br/>"
        "© 2026 Aptora Inc. All rights reserved. Registered Tax Invoice.",
        footer_text
    ))

    # Build PDF
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
