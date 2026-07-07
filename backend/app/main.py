import os
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, status, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

app = FastAPI(
    title=os.getenv("PROJECT_NAME", "ExamForge-AI-Backend"),
    description="Asynchronous backend API for ExamForge AI authentication and services",
    version="2.0.0"
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

# ─── Models ─────────────────────────────────────────────────────────

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

class LoginResponse(BaseModel):
    success: bool
    message: str
    email: str

class SignupPayload(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class SignupResponse(BaseModel):
    success: bool
    message: str
    email: str

class OtpPayload(BaseModel):
    otp: str = Field(..., min_length=6, max_length=6)
    email: EmailStr
    phone: str = "+91 98765 43210"

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


# ─── Endpoints ──────────────────────────────────────────────────────

@app.get("/", status_code=status.HTTP_200_OK)
async def read_root():
    logger.info("Root endpoint accessed")
    return {
        "status": "healthy",
        "message": "Welcome to ExamForge AI Backend",
        "version": "2.0.0",
        "features": ["Auth Flow", "CORS", "CSRF", "OTP Verification", "Password Reset"]
    }


@app.post("/api/contact", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(payload: ContactForm):
    logger.info(f"Contact form from {payload.name} ({payload.email})")
    return ContactResponse(
        success=True,
        message="Form submitted successfully! We will get back to you shortly.",
        data=payload
    )


# ─── Auth Endpoints ─────────────────────────────────────────────────

@app.post("/api/auth/login", response_model=LoginResponse)
async def auth_login(payload: LoginPayload, response: Response):
    logger.info(f"Login attempt: {payload.email}")
    # Set CSRF cookie
    response.set_cookie(
        key="csrf_token",
        value="ef-csrf-" + payload.email.split("@")[0],
        httponly=True,
        samesite="lax",
        secure=False  # True in production
    )
    return LoginResponse(
        success=True,
        message="Login successful! OTP sent to your email.",
        email=payload.email
    )


@app.post("/api/auth/signup", response_model=SignupResponse)
async def auth_signup(payload: SignupPayload, response: Response):
    logger.info(f"Signup: {payload.name} ({payload.email})")
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
        message="Account created! OTP sent for verification.",
        email=payload.email
    )


@app.post("/api/auth/verify-otp", response_model=OtpResponse)
async def verify_otp(payload: OtpPayload, csrf_token: Optional[str] = Cookie(None)):
    logger.info(f"Verifying OTP for {payload.email}: {payload.otp}")

    # Accept 123456 or any 6-digit number starting with 1 (demo)
    if not (payload.otp == "123456" or (len(payload.otp) == 6 and payload.otp.startswith("1"))):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. For testing, use 123456."
        )

    return OtpResponse(
        success=True,
        message="OTP verified successfully! Welcome to ExamForge AI.",
        token="ef-jwt-" + payload.email.split("@")[0] + "-authenticated"
    )


@app.post("/api/auth/forgot-password", response_model=ForgotResponse)
async def forgot_password(payload: ForgotPayload):
    logger.info(f"Password reset requested for {payload.email}")
    return ForgotResponse(
        success=True,
        message="OTP sent to your email for password reset."
    )


@app.post("/api/auth/reset-password", response_model=ResetPasswordResponse)
async def reset_password(payload: ResetPasswordPayload):
    logger.info(f"Password reset for {payload.email} with OTP {payload.otp}")

    # Validate OTP (same demo logic)
    if not (payload.otp == "123456" or (len(payload.otp) == 6 and payload.otp.startswith("1"))):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. For testing, use 123456."
        )

    return ResetPasswordResponse(
        success=True,
        message="Password reset successful! You can now login with your new password."
    )
