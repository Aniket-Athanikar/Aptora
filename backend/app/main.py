import os
import logging
import random
import time
import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from fastapi import FastAPI, HTTPException, status, Response, Cookie, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv

# Database & cache adapters
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import Session, relationship

# Load environment variables
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

app = FastAPI(
    title=os.getenv("PROJECT_NAME", "ExamForge-AI-Backend"),
    description="Full-stack containerized backend API for ExamForge AI with DB integrations",
    version="2.1.0"
)

# CORS middleware configuration
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_otp_email_html(name: str, otp: str):
    # Split the OTP code into separate visual boxes
    otp_boxes = "".join([
        f'<div style="display: inline-block; width: 44px; height: 52px; line-height: 52px; text-align: center; background: #F9FAFB; border: 2px solid #6D4AFF; border-radius: 12px; font-size: 28px; font-weight: 800; color: #6D4AFF; margin: 0 5px; box-shadow: 0 4px 10px rgba(109,74,255,0.08);">{digit}</div>' 
        for digit in otp
    ])

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to ExamForge AI - Success Intercepted!</title>
  <style>
    body {{
      background-color: transparent;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px 20px;
      color: #374151;
      text-align: center;
    }}
    .email-container {{
      max-width: 540px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1.5px solid #E5E7EB;
      border-radius: 24px;
      padding: 40px 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      position: relative;
    }}
    .logo-container {{
      margin-bottom: 25px;
    }}
    .logo {{
      font-size: 30px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #111827;
    }}
    .logo-ai {{
      color: #6D4AFF;
    }}
    h1 {{
      font-size: 26px;
      margin-bottom: 12px;
      font-weight: 900;
      color: #111827;
      letter-spacing: -0.5px;
    }}
    .cheer-message {{
      color: #6D4AFF;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.5;
    }}
    .body-text {{
      color: #4B5563;
      line-height: 1.6;
      font-size: 14.5px;
      margin-bottom: 30px;
      font-weight: 500;
    }}
    .otp-wrapper {{
      margin: 35px 0;
      text-align: center;
    }}
    .cheer-badge {{
      display: inline-flex;
      background: rgba(16, 185, 129, 0.08);
      border: 1.5px solid rgba(16, 185, 129, 0.2);
      border-radius: 50px;
      padding: 6px 18px;
      font-size: 13px;
      color: #059669;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }}
    .footer {{
      font-size: 11.5px;
      color: #9CA3AF;
      margin-top: 40px;
      border-top: 1.5px solid #F3F4F6;
      padding-top: 20px;
      font-weight: 600;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <!-- SVG Geometric Node Network (Three.js geometry layout style) -->
    <svg width="100%" height="80" viewBox="0 0 400 80" style="margin-bottom: 10px; overflow: visible;">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#6D4AFF" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#6D4AFF" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="40" r="60" fill="url(#glow)" />
      
      <!-- Connection Lines -->
      <line x1="60" y1="45" x2="140" y2="25" stroke="#6D4AFF" stroke-width="2" stroke-dasharray="5 3" />
      <line x1="140" y1="25" x2="200" y2="55" stroke="#8B5CF6" stroke-width="2.5" />
      <line x1="200" y1="55" x2="260" y2="20" stroke="#10B981" stroke-width="2" stroke-dasharray="4 4" />
      <line x1="260" y1="20" x2="340" y2="45" stroke="#4F46E5" stroke-width="2" />
      <line x1="140" y1="25" x2="260" y2="20" stroke="#4F46E5" stroke-width="1.2" opacity="0.6" />
      <line x1="60" y1="45" x2="200" y2="55" stroke="#6D4AFF" stroke-width="1.2" opacity="0.6" />
      
      <!-- Animated / Pulsing Nodes -->
      <circle cx="60" cy="45" r="6" fill="#6D4AFF" />
      <circle cx="140" cy="25" r="8" fill="#8B5CF6" />
      <circle cx="200" cy="55" r="7" fill="#10B981" />
      <circle cx="260" cy="20" r="9" fill="#4F46E5" />
      <circle cx="340" cy="45" r="6" fill="#6D4AFF" />
    </svg>

    <div class="logo-container">
      <span class="logo">EXAM FORGE<span class="logo-ai"> AI</span></span>
    </div>
    
    <div class="cheer-badge">🎉 Celebration! Success Intercepted!</div>
    
    <h1>Welcome, {name}!</h1>
    
    <div class="cheer-message">
      You are officially locked and loaded to crack your dream exams! 🚀
    </div>
    
    <p class="body-text">
      We are absolutely thrilled to welcome you to the ExamForge AI community. Your personalized AI companion is ready to transform your study materials into interactive summaries, practice question sets, and custom mock tests. 
      <br><br>
      To finalize your verification and jump straight into your dashboard, copy this secure OTP code:
    </p>
    
    <div class="otp-wrapper">
      {otp_boxes}
    </div>
    
    <p style="font-size: 13px; color: #6B7280; margin-bottom: 0; font-weight: 500;">
      This code is valid for 5 minutes. If you did not request this verification, you can safely ignore this mail.
    </p>
    
    <div class="footer">
      &copy; 2026 ExamForge AI. Smart educational ecosystems powered by Artificial Intelligence.
    </div>
  </div>
</body>
</html>"""

SMTP_HOST = os.getenv("MAIL_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("MAIL_PORT", "587"))
SMTP_USER = os.getenv("MAIL_USERNAME", "")
SMTP_PASSWORD = os.getenv("MAIL_PASSWORD", "")

def send_real_email(recipient_email: str, subject: str, html_content: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.info("Real SMTP credentials not configured. Skipping internet email transmission (saving to last_email.html instead).")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = recipient_email
        
        part = MIMEText(html_content, "html")
        msg.attach(part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, recipient_email, msg.as_string())
        logger.info(f"Real email successfully sent to {recipient_email} via SMTP!")
        return True
    except Exception as e:
        logger.warning(f"Failed to transmit email to {recipient_email} via SMTP: {e}")
        return False

# ─── DATABASE SETUP ──────────────────────────────────────────────────
from app.database import Base, engine, get_db, redis_client, qdrant_client

# ─── MODELS ──────────────────────────────────────────────────────────
class UserDb(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OtpDb(Base):
    __tablename__ = "otps"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False)
    otp = Column(String(6), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_used = Column(Boolean, default=False)

class UserProfileDb(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    phone = Column(String(20), default="")
    dob = Column(String(20), default="")
    gender = Column(String(20), default="")
    location = Column(String(150), default="")
    timezone = Column(String(50), default="Asia/Kolkata")
    education = Column(String(100), default="")
    college = Column(String(150), default="")
    occupation = Column(String(100), default="")
    bio = Column(Text, default="")
    avatar_url = Column(Text, default="")
    # Gamification
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    level = Column(Integer, default=1)
    streak = Column(Integer, default=0)
    # Exam preferences
    target_exam = Column(String(100), default="")
    secondary_exam = Column(String(100), default="")
    target_score = Column(String(20), default="")
    target_rank = Column(String(20), default="")
    target_date = Column(String(30), default="")
    study_hours_goal = Column(Float, default=4.0)
    weak_subjects = Column(JSON, default=list)
    strong_subjects = Column(JSON, default=list)
    favorite_subjects = Column(JSON, default=list)
    # Performance
    accuracy = Column(Float, default=0.0)
    mock_average = Column(Float, default=0.0)
    questions_solved = Column(Integer, default=0)
    study_hours_total = Column(Float, default=0.0)
    completion_pct = Column(Float, default=0.0)
    bookmarks_count = Column(Integer, default=0)
    certificates_count = Column(Integer, default=0)
    # Social & Meta
    social_links = Column(JSON, default=dict)
    achievements = Column(JSON, default=list)
    connected_devices = Column(JSON, default=list)
    notification_settings = Column(JSON, default=dict)
    privacy_settings = Column(JSON, default=dict)
    security_score = Column(Integer, default=50)
    # Subscription
    plan = Column(String(30), default="Free")
    plan_renewal = Column(String(30), default="")
    ai_credits = Column(Integer, default=50)
    storage_used_mb = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# Initialize database schemas
if engine:
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

# ─── REQUEST / RESPONSE MODELS ────────────────────────────────────────
class ContactForm(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=1000)

class ContactResponse(BaseModel):
    success: bool
    message: str
    data: ContactForm

class LoginPayload(BaseModel):
    email: EmailStr
    password: str
    skip_email: Optional[bool] = False

class LoginResponse(BaseModel):
    success: bool
    message: str
    email: str
    name: str

class SignupPayload(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    skip_email: Optional[bool] = False

class SignupResponse(BaseModel):
    success: bool
    message: str
    email: str

class OtpPayload(BaseModel):
    otp: str = Field(..., min_length=6, max_length=6)
    email: EmailStr

class OtpResponse(BaseModel):
    success: bool
    message: str
    token: str
    name: str

class ForgotPayload(BaseModel):
    email: EmailStr

class ForgotResponse(BaseModel):
    success: bool
    message: str

class ResetPasswordPayload(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)

class ResetPasswordResponse(BaseModel):
    success: bool
    message: str

LATEST_DEVELOPMENT_OTP = {}

# ─── ENDPOINTS ───────────────────────────────────────────────────────

@app.get("/", status_code=status.HTTP_200_OK)
async def read_root():
    logger.info("Root endpoint accessed")
    
    # Check dependencies statuses
    db_status = "connected" if engine else "disconnected"
    
    redis_status = "disconnected"
    if redis_client:
        try:
            redis_client.ping()
            redis_status = "connected"
        except:
            pass
            
    qdrant_status = "disconnected"
    if qdrant_client:
        try:
            qdrant_client.get_collections()
            qdrant_status = "connected"
        except:
            pass

    return {
        "status": "healthy",
        "message": "Welcome to ExamForge AI Backend with Postgres, Redis & Qdrant",
        "version": "2.1.0",
        "services": {
            "postgresql": db_status,
            "redis": redis_status,
            "qdrant": qdrant_status
        }
    }

@app.post("/api/contact", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(payload: ContactForm):
    logger.info(f"Contact form submission: {payload.name} ({payload.email})")
    return ContactResponse(
        success=True,
        message="Form submitted successfully! We will get back to you shortly.",
        data=payload
    )

@app.post("/api/auth/login", response_model=LoginResponse)
async def auth_login(payload: LoginPayload, response: Response, db: Session = Depends(get_db)):
    logger.info(f"Login request: {payload.email}")

    # Check if user exists. If not, auto-register them (for easy demo testing)
    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    if not user:
        user = UserDb(name=payload.email.split("@")[0].capitalize(), email=payload.email, password=payload.password)
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"Auto-registered new user: {payload.email}")

    # Generate a real random 6-digit OTP code
    otp_code = str(random.randint(100000, 999999))

    # Save OTP to Postgres DB
    db_otp = OtpDb(email=payload.email, otp=otp_code)
    db.add(db_otp)
    db.commit()

    # PRINT generated OTP to backend console so user can see it in docker logs
    print(f"\n[DATABASE OTP] Generated OTP for {payload.email} is: {otp_code}\n", flush=True)
    logger.info(f"OTP generated and printed to logs for: {payload.email}")
    LATEST_DEVELOPMENT_OTP[payload.email] = otp_code

    # Render and save HTML email mockup template locally if not opted out
    if not payload.skip_email:
        email_html = generate_otp_email_html(user.name, otp_code)
        try:
            with open("last_email.html", "w", encoding="utf-8") as f:
                f.write(email_html)
            logger.info("HTML email template generated and written to backend/last_email.html")
            
            # Send real email via SMTP if configured
            send_real_email(payload.email, "Welcome to ExamForge AI - Verify OTP", email_html)
        except Exception as e:
            logger.warning(f"Could not save HTML email mockup: {e}")
    else:
        logger.info("Email generation skipped due to skip_email parameter")

    # Save to Redis cache for fast lookup if connected
    if redis_client:
        try:
            redis_client.setex(f"otp:{payload.email}", 300, otp_code)
            logger.info("Saved OTP to Redis cache")
        except Exception as e:
            logger.warning(f"Could not save OTP to Redis: {e}")

    # Set CSRF cookie
    response.set_cookie(
        key="csrf_token",
        value="ef-csrf-" + payload.email.split("@")[0],
        httponly=True,
        samesite="lax",
        secure=False
    )

    return LoginResponse(
        success=True,
        message="Login successful! OTP generated and printed in logs.",
        email=payload.email,
        name=user.name
    )

@app.post("/api/auth/signup", response_model=SignupResponse)
async def auth_signup(payload: SignupPayload, response: Response, db: Session = Depends(get_db)):
    logger.info(f"Signup: {payload.name} ({payload.email})")

    # Validate passwords match
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Check if email is already registered
    existing_user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    if existing_user:
        # If it was an auto-registered user, let them complete signup with their real name and password
        existing_user.name = payload.name
        existing_user.password = payload.password
        db.commit()
        db.refresh(existing_user)
    else:
        # Create new user record
        new_user = UserDb(name=payload.name, email=payload.email, password=payload.password)
        db.add(new_user)
        db.commit()

    # Generate random 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    db_otp = OtpDb(email=payload.email, otp=otp_code)
    db.add(db_otp)
    db.commit()

    # PRINT generated OTP to backend console
    print(f"\n[DATABASE OTP] Generated signup OTP for {payload.email} is: {otp_code}\n", flush=True)
    LATEST_DEVELOPMENT_OTP[payload.email] = otp_code

    # Render and save HTML email mockup template locally if not opted out
    if not payload.skip_email:
        email_html = generate_otp_email_html(payload.name, otp_code)
        try:
            with open("last_email.html", "w", encoding="utf-8") as f:
                f.write(email_html)
            logger.info("HTML email template generated and written to backend/last_email.html")
            
            # Send real email via SMTP if configured
            send_real_email(payload.email, "Welcome to ExamForge AI - Verify OTP", email_html)
        except Exception as e:
            logger.warning(f"Could not save HTML email mockup: {e}")
    else:
        logger.info("Email generation skipped due to skip_email parameter")

    # Set CSRF cookie
    response.set_cookie(
        key="csrf_token",
        value="ef-csrf-signup-" + payload.email.split("@")[0],
        httponly=True,
        samesite="lax",
        secure=False
    )

    return SignupResponse(
        success=True,
        message="Account created! OTP generated and printed in logs.",
        email=payload.email
    )

@app.post("/api/auth/verify-otp", response_model=OtpResponse)
async def verify_otp(payload: OtpPayload, db: Session = Depends(get_db)):
    logger.info(f"Verifying OTP for {payload.email}: {payload.otp}")

    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    user_name = user.name if user else payload.email.split("@")[0]

    # Allow backdoor master OTP "123456" for testing
    if payload.otp == "123456":
        return OtpResponse(
            success=True,
            message="OTP verified successfully! Welcome back.",
            token="ef-jwt-" + payload.email.split("@")[0] + "-authenticated",
            name=user_name
        )

    # Check Redis cache first if available
    cached_otp = None
    if redis_client:
        try:
            cached_otp = redis_client.get(f"otp:{payload.email}")
        except Exception as e:
            logger.warning(f"Could not read from Redis: {e}")

    # If not in Redis, check Postgres DB
    if not cached_otp:
        db_otp_record = db.query(OtpDb).filter(
            OtpDb.email == payload.email,
            OtpDb.is_used == False
        ).order_by(OtpDb.created_at.desc()).first()
        
        if not db_otp_record or db_otp_record.otp != payload.otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code. Please check console logs."
            )
        
        # Mark OTP as used
        db_otp_record.is_used = True
        db.commit()
    else:
        # Match cached OTP
        if cached_otp != payload.otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code. Please check console logs."
            )
        # Clear Redis key
        if redis_client:
            try:
                redis_client.delete(f"otp:{payload.email}")
            except:
                pass

    return OtpResponse(
        success=True,
        message="OTP verified successfully! Welcome to ExamForge AI.",
        token="ef-jwt-" + payload.email.split("@")[0] + "-authenticated",
        name=user_name
    )

@app.post("/api/auth/forgot-password", response_model=ForgotResponse)
async def forgot_password(payload: ForgotPayload, db: Session = Depends(get_db)):
    logger.info(f"Password reset requested for {payload.email}")
    
    # Check if user exists
    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found with this email."
        )

    otp_code = str(random.randint(100000, 999999))
    db_otp = OtpDb(email=payload.email, otp=otp_code)
    db.add(db_otp)
    db.commit()

    print(f"\n[DATABASE OTP] Generated forgot password OTP for {payload.email} is: {otp_code}\n", flush=True)
    LATEST_DEVELOPMENT_OTP[payload.email] = otp_code

    return ForgotResponse(
        success=True,
        message="OTP sent to your email for password reset."
    )

@app.post("/api/auth/reset-password", response_model=ResetPasswordResponse)
async def reset_password(payload: ResetPasswordPayload, db: Session = Depends(get_db)):
    logger.info(f"Password reset request for {payload.email}")

    # Validate OTP from database
    db_otp_record = db.query(OtpDb).filter(
        OtpDb.email == payload.email,
        OtpDb.otp == payload.otp,
        OtpDb.is_used == False
    ).first()

    if not db_otp_record and payload.otp != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Please check console logs."
        )

    if db_otp_record:
        db_otp_record.is_used = True
        db.commit()

    # Update User password
    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    if user:
        user.password = payload.new_password
        db.commit()
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    return ResetPasswordResponse(
        success=True,
        message="Password reset successful! You can now login with your new password."
    )

@app.get("/api/auth/latest-otp")
async def get_latest_otp(email: str, db: Session = Depends(get_db)):
    otp_code = LATEST_DEVELOPMENT_OTP.get(email)
    if not otp_code:
        db_otp = db.query(OtpDb).filter(OtpDb.email == email).order_by(OtpDb.id.desc()).first()
        if db_otp:
            otp_code = db_otp.otp
            
    if not otp_code:
        raise HTTPException(status_code=404, detail="No OTP found for this email address.")
    return {"email": email, "otp": otp_code}

# ─── PROFILE ENDPOINTS ───────────────────────────────────────────────

class ProfileResponse(BaseModel):
    success: bool
    profile: dict

class ProfileUpdatePayload(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None
    education: Optional[str] = None
    college: Optional[str] = None
    occupation: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    target_exam: Optional[str] = None
    secondary_exam: Optional[str] = None
    target_score: Optional[str] = None
    target_rank: Optional[str] = None
    target_date: Optional[str] = None
    study_hours_goal: Optional[float] = None
    weak_subjects: Optional[list] = None
    strong_subjects: Optional[list] = None
    favorite_subjects: Optional[list] = None
    social_links: Optional[dict] = None
    notification_settings: Optional[dict] = None
    privacy_settings: Optional[dict] = None
    plan: Optional[str] = None

def profile_to_dict(p: UserProfileDb, user: UserDb) -> dict:
    return {
        "id": p.id,
        "user_id": p.user_id,
        "name": user.name,
        "email": user.email,
        "member_since": user.created_at.isoformat() if user.created_at else "",
        "phone": p.phone or "",
        "dob": p.dob or "",
        "gender": p.gender or "",
        "location": p.location or "",
        "timezone": p.timezone or "Asia/Kolkata",
        "education": p.education or "",
        "college": p.college or "",
        "occupation": p.occupation or "",
        "bio": p.bio or "",
        "avatar_url": p.avatar_url or "",
        "xp": p.xp,
        "coins": p.coins,
        "level": p.level,
        "streak": p.streak,
        "target_exam": p.target_exam or "",
        "secondary_exam": p.secondary_exam or "",
        "target_score": p.target_score or "",
        "target_rank": p.target_rank or "",
        "target_date": p.target_date or "",
        "study_hours_goal": p.study_hours_goal,
        "weak_subjects": p.weak_subjects or [],
        "strong_subjects": p.strong_subjects or [],
        "favorite_subjects": p.favorite_subjects or [],
        "accuracy": p.accuracy,
        "mock_average": p.mock_average,
        "questions_solved": p.questions_solved,
        "study_hours_total": p.study_hours_total,
        "completion_pct": p.completion_pct,
        "bookmarks_count": p.bookmarks_count,
        "certificates_count": p.certificates_count,
        "social_links": p.social_links or {},
        "achievements": p.achievements or [],
        "connected_devices": p.connected_devices or [],
        "notification_settings": p.notification_settings or {},
        "privacy_settings": p.privacy_settings or {},
        "security_score": p.security_score,
        "plan": p.plan or "Free",
        "plan_renewal": p.plan_renewal or "",
        "ai_credits": p.ai_credits,
        "storage_used_mb": p.storage_used_mb,
        "updated_at": p.updated_at.isoformat() if p.updated_at else "",
    }

@app.get("/api/profile")
async def get_profile(email: str, db: Session = Depends(get_db)):
    user = db.query(UserDb).filter(UserDb.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == user.id).first()
    if not profile:
        profile = UserProfileDb(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {"success": True, "profile": profile_to_dict(profile, user)}

@app.post("/api/profile")
async def update_profile(email: str, payload: ProfileUpdatePayload, db: Session = Depends(get_db)):
    user = db.query(UserDb).filter(UserDb.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == user.id).first()
    if not profile:
        profile = UserProfileDb(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    update_data = payload.dict(exclude_unset=True)
    if "name" in update_data:
        user.name = update_data["name"]
        
    for key, value in update_data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    logger.info(f"Profile updated for {email}: {list(update_data.keys())}")
    return {"success": True, "profile": profile_to_dict(profile, user)}
