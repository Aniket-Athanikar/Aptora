import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.newsletter import NewsletterDb
from app.schemas.contact import NewsletterPayload
from app.services.email_service import send_real_email

logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])

@router.post("/subscribe")
async def subscribe_newsletter(payload: NewsletterPayload, db: Session = Depends(get_db)):
    # Check if subscriber already exists
    existing = db.query(NewsletterDb).filter(NewsletterDb.email == payload.email).first()
    if existing:
        return {"success": True, "message": "Email is already subscribed to our newsletter."}
    
    # Save new subscriber
    db_sub = NewsletterDb(email=payload.email)
    db.add(db_sub)
    db.commit()
    
    # Generate and send welcome email
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to ExamForge AI Newsletter!</title>
  <style>
    body {{ font-family: 'Inter', sans-serif; background-color: #F9FAFB; padding: 40px; color: #374151; text-align: center; }}
    .container {{ max-width: 500px; margin: 0 auto; background: white; border: 1.5px solid #E5E7EB; border-radius: 24px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }}
    .logo {{ font-size: 26px; font-weight: 900; color: #111827; }}
    .logo-ai {{ color: #6D4AFF; }}
    h1 {{ font-size: 22px; font-weight: 900; color: #111827; margin-top: 20px; }}
    p {{ color: #4B5563; font-size: 14px; line-height: 1.6; font-weight: 500; margin-bottom: 25px; }}
    .footer {{ font-size: 11px; color: #9CA3AF; margin-top: 40px; border-top: 1.5px solid #F3F4F6; padding-top: 20px; font-weight: 600; }}
  </style>
</head>
<body>
  <div class="container">
    <span class="logo">EXAM FORGE<span class="logo-ai"> AI</span></span>
    <h1>You are Subscribed! 🎉</h1>
    <p>
      Thank you for subscribing to the ExamForge AI newsletter list. We will send you weekly study hacks, PYQ analysis tricks, and major platform feature rollouts.
    </p>
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
        logger.info("Newsletter welcome email logged locally to backend/last_email.html")
    except Exception as e:
        logger.warning(f"Could not log email: {e}")
        
    send_real_email(payload.email, "Subscribed to ExamForge AI Newsletter", html_content)
    
    return {"success": True, "message": "Successfully subscribed to our newsletter!"}
