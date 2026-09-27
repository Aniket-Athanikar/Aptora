import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import NewsletterDb
from app.schemas import NewsletterPayload
from app.utils.email import send_real_email

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
  <title>Welcome to Aptora Newsletter!</title>
  <style>
    body {{
      font-family: 'Inter', -apple-system, sans-serif;
      background-color: #FAF9F6;
      padding: 32px 16px;
      color: #0F172A;
      text-align: center;
      margin: 0;
    }}
    .container {{
      max-width: 520px;
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
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin-top: 16px;
      margin-bottom: 12px;
    }}
    p {{
      color: #475569;
      font-size: 14px;
      line-height: 1.6;
      font-weight: 500;
      margin-bottom: 24px;
    }}
    .footer {{
      font-size: 11px;
      color: #94A3B8;
      margin-top: 36px;
      border-top: 1px solid #F1F5F9;
      padding-top: 20px;
      font-weight: 600;
    }}
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
    <h1>You are Subscribed! 🎉</h1>
    <p>
      Thank you for subscribing to the Aptora newsletter. We will send you weekly study hacks, PYQ analysis tricks, and major platform feature rollouts.
    </p>
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
        logger.info("Newsletter welcome email logged locally to backend/last_email.html")
    except Exception as e:
        logger.warning(f"Could not log email: {e}")
        
    send_real_email(payload.email, "Subscribed to Aptora Newsletter", html_content)
    
    return {"success": True, "message": "Successfully subscribed to our newsletter!"}
