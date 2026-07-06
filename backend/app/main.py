import os
import logging
from typing import List, Optional
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
    title=os.getenv("PROJECT_NAME", "FastAPI-NextJS-Premium"),
    description="Asynchronous backend API for premium landing pages and authentication",
    version="1.0.0"
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

# Contact Models
class ContactForm(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, example="John Doe")
    email: EmailStr = Field(..., example="john.doe@example.com")
    message: str = Field(..., min_length=10, max_length=1000, example="I would love to build a premium web application together!")

class ContactResponse(BaseModel):
    success: bool
    message: str
    data: ContactForm

# Auth Models
class LoginPayload(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    email: str

class OtpPayload(BaseModel):
    otp: str = Field(..., min_length=6, max_length=6, example="123456")
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

# Endpoints
@app.get("/", status_code=status.HTTP_200_OK)
async def read_root():
    logger.info("Root endpoint accessed asynchronously")
    return {
        "status": "healthy",
        "message": "Welcome to the Premium FastAPI Backend",
        "features": ["Asynchronous Endpoints", "CORS Middleware", "Pydantic Validation", "Secure Auth Mock Flow"]
    }

@app.post("/api/contact", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(payload: ContactForm):
    logger.info(f"Received form submission from {payload.name} ({payload.email})")
    return ContactResponse(
        success=True,
        message="Form submitted successfully! We will get back to you shortly.",
        data=payload
    )

# Async Auth Flow Endpoints
@app.post("/api/auth/login", response_model=LoginResponse)
async def auth_login(payload: LoginPayload, response: Response):
    logger.info(f"Logging in user: {payload.email}")
    # Simulating secure CSRF Token set in Cookie
    response.set_cookie(
        key="csrf_token",
        value="secured-csrf-verification-token-102938",
        httponly=True,
        samesite="lax",
        secure=False # Set true in production
    )
    return LoginResponse(
        success=True,
        message="Welcome Back! Verification email has been sent.",
        email=payload.email
    )

@app.post("/api/auth/verify-otp", response_model=OtpResponse)
async def verify_otp(payload: OtpPayload, csrf_token: Optional[str] = Cookie(None)):
    logger.info(f"Verifying OTP for {payload.email}")
    
    # Simple check for demo purposes (accepts 123456 or any 6-digit number starting with 1)
    if not (payload.otp == "123456" or (len(payload.otp) == 6 and payload.otp.startswith("1"))):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. For testing, use 123456."
        )
        
    return OtpResponse(
        success=True,
        message="OTP Verification successful! Redirecting to dashboard...",
        token="authenticated-session-jwt-token-998877"
    )

@app.post("/api/auth/forgot-password", response_model=ForgotResponse)
async def forgot_password(payload: ForgotPayload):
    logger.info(f"Requesting password reset for {payload.email}")
    return ForgotResponse(
        success=True,
        message="Reset link successfully generated and dispatched to your email."
    )
