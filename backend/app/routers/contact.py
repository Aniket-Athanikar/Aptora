import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ContactDb
from app.schemas import ContactForm, ContactResponse
from app.utils.email import send_real_email

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
  <title>ExamForge AI - Contact Form Submission Received</title>
  <style>
    body {{ font-family: 'Inter', sans-serif; background-color: #F9FAFB; padding: 40px; color: #374151; }}
    .container {{ max-width: 540px; margin: 0 auto; background: white; border: 1.5px solid #E5E7EB; border-radius: 24px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }}
    .logo {{ font-size: 26px; font-weight: 900; color: #111827; }}
    .logo-ai {{ color: #6D4AFF; }}
    h1 {{ font-size: 20px; font-weight: 900; color: #111827; border-bottom: 1.5px solid #F3F4F6; padding-bottom: 15px; margin-bottom: 20px; }}
    .field {{ margin-bottom: 15px; font-size: 13.5px; }}
    .label {{ color: #6B7280; font-weight: 600; }}
    .val {{ color: #111827; font-weight: 800; margin-top: 2px; }}
    .msg-box {{ background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 15px; font-style: italic; font-weight: 500; }}
    .footer {{ font-size: 11px; color: #9CA3AF; margin-top: 40px; border-top: 1.5px solid #F3F4F6; padding-top: 20px; text-align: center; font-weight: 600; }}
  </style>
</head>
<body>
  <div class="container">
    <span class="logo">EXAM FORGE<span class="logo-ai"> AI</span></span>
    <h1>Message Received Successfully</h1>
    <p style="font-size: 14px; font-weight: 500; color: #4B5563; line-height: 1.6;">
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
      &copy; 2026 ExamForge AI. Smart educational ecosystems.
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
    send_real_email(payload.email, f"Re: {payload.subject} - ExamForge AI Ticket", html_content)
    # Dispatch alert to admin
    send_real_email("agentforge29@gmail.com", f"Support Alert: {payload.subject} from {payload.name}", html_content)

    return ContactResponse(
        success=True,
        message="Form submitted successfully! We will get back to you shortly.",
        data=payload
    )
