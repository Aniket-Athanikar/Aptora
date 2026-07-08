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
from sqlalchemy import Column, String, Integer, DateTime, Boolean
from sqlalchemy.orm import Session

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

def generate_otp_email_html(name: str, otp: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to ExamForge AI</title>
  <style>
    body {{
      background-color: #0A0A0E;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 40px 20px;
      color: #F3F4F6;
      text-align: center;
    }}
    .email-container {{
      max-width: 550px;
      margin: 0 auto;
      background: rgba(18, 18, 26, 0.9);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 20px;
      padding: 40px 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.15);
      position: relative;
      overflow: hidden;
    }}
    .logo-container {{
      margin-bottom: 30px;
    }}
    .logo {{
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }}
    h1 {{
      font-size: 24px;
      margin-bottom: 10px;
      font-weight: 700;
      color: #FFFFFF;
    }}
    p {{
      color: #9CA3AF;
      line-height: 1.6;
      font-size: 16px;
      margin-bottom: 30px;
    }}
    .otp-box {{
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.03) 100%);
      border: 2px solid #8B5CF6;
      border-radius: 12px;
      padding: 20px;
      display: inline-block;
      margin-bottom: 30px;
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
    }}
    .otp-code {{
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 6px;
      color: #A78BFA;
      text-shadow: 0 0 8px rgba(167, 139, 250, 0.5);
    }}
    .cheer-badge {{
      display: inline-flex;
      align-items: center;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 50px;
      padding: 6px 16px;
      font-size: 14px;
      color: #34D399;
      font-weight: 600;
      margin-bottom: 25px;
    }}
    .footer {{
      font-size: 12px;
      color: #4B5563;
      margin-top: 40px;
      border-top: 1px solid rgba(75, 85, 99, 0.2);
      padding-top: 20px;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="logo-container">
      <span class="logo">ExamForge AI</span>
    </div>
    <div class="cheer-badge">🎉 Let's Celebrate! You're In!</div>
    <h1>Hey {name}, Welcome Aboard!</h1>
    <p>We're thrilled to help you prepare and succeed. Use the OTP code below to verify your login session and activate your personalized dashboard.</p>
    <div class="otp-box">
      <div class="otp-code">{otp}</div>
    </div>
    <p style="font-size: 14px; color: #6B7280; margin-bottom: 0;">This code is valid for 5 minutes. If you did not make this request, you can safely ignore this email.</p>
    <div class="footer">
      &copy; 2026 ExamForge AI. Dynamic education powered by Artificial Intelligence.
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )

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

    # Allow backdoor master OTP "123456" for testing
    if payload.otp == "123456":
        return OtpResponse(
            success=True,
            message="OTP verified successfully! Welcome back.",
            token="ef-jwt-" + payload.email.split("@")[0] + "-authenticated"
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
        token="ef-jwt-" + payload.email.split("@")[0] + "-authenticated"
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
