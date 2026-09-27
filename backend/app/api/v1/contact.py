import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.contact import ContactDb
from app.schemas.contact import ContactForm, ContactResponse
from app.services.email_service import send_real_email

logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/contact", tags=["contact"])

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(payload: ContactForm, db: Session = Depends(get_db)):
    logger.info(f"Contact form submission: {payload.name} ({payload.email})")
    
    # Store in database
    db_contact = ContactDb(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    
    # Generate auto-responder and admin alert email template
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aptora - Contact Form Submission Received</title>
  <style>
    body {{
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #FAF9F6;
      padding: 32px 16px;
      color: #0F172A;
      margin: 0;
    }}
    .container {{
      max-width: 540px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 24px;
      padding: 36px 30px;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04);
    }}
    .header-logo {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 24px;
    }}
    .logo-text {{
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0F172A;
    }}
    h1 {{
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }}
    .field {{ margin-bottom: 15px; font-size: 13.5px; }}
    .label {{ color: #64748B; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }}
    .val {{ color: #0F172A; font-weight: 700; margin-top: 4px; }}
    .msg-box {{ background: #FAF9F6; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px; font-style: italic; font-weight: 500; }}
    .footer {{ font-size: 11px; color: #94A3B8; margin-top: 36px; border-top: 1px solid #F1F5F9; padding-top: 20px; text-align: center; font-weight: 600; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header-logo">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
        <path d="M16 3L4 27H11.5L16 17.5L20.5 27H28L16 3Z" fill="#084c38" />
        <path d="M16 11L12.5 19H19.5L16 11Z" fill="#ffffff" />
      </svg>
      <span class="logo-text">Aptora</span>
    </div>
    <h1>Message Received Successfully</h1>
    <p style="font-size: 14px; font-weight: 500; color: #475569; line-height: 1.6;">
      Hi {payload.name}, thanks for reaching out. We have logged your support message in our system and our team will get back to you within 24 hours. Here is a copy of your ticket:
    </p>
    <div class="field">
      <div class="label">Subject</div>
      <div class="val">{payload.subject}</div>
    </div>
    <div class="field">
      <div class="label">Message Context</div>
      <div class="val msg-box">{payload.message}</div>
    </div>
    <div class="footer">
      &copy; 2026 Aptora. Smart educational platform.
    </div>
  </div>
</body>
</html>
"""
    try:
        with open("last_email.html", "w", encoding="utf-8") as f:
            f.write(html_content)
        logger.info("Contact form email mockup logged locally to backend/last_email.html")
    except Exception as e:
        logger.warning(f"Could not log email locally: {e}")

    # Dispatch to sender
    send_real_email(payload.email, f"Re: {payload.subject} - Aptora Ticket", html_content)
    # Dispatch alert to admin
    send_real_email("agentforge29@gmail.com", f"Support Alert: {payload.subject} from {payload.name}", html_content)

    return ContactResponse(
        success=True,
        message="Form submitted successfully! We will get back to you shortly.",
        data=payload
    )
