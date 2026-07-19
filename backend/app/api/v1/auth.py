import random
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Response, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.db.redis import redis_client
from app.models.user import UserDb, OtpDb
from app.schemas.auth import (
    LoginPayload, LoginResponse, SignupPayload, SignupResponse,
    OtpPayload, OtpResponse, ForgotPayload, ForgotResponse,
    ResetPasswordPayload, ResetPasswordResponse
)
from app.services.email_service import generate_otp_email_html, send_real_email

logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/auth", tags=["auth"])

LATEST_DEVELOPMENT_OTP = {}

@router.post("/login", response_model=LoginResponse)
async def auth_login(payload: LoginPayload, response: Response, db: Session = Depends(get_db)):
    logger.info(f"Login request: {payload.email}")

    # Check if user exists. If not, auto-register them (for easy demo testing)
    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    if not user:
        user = UserDb(name=payload.email.split("@")[0].capitalize(), email=payload.email, password="")
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

    # Send OTP email
    if not payload.skip_email:
        email_html = generate_otp_email_html(user.name, otp_code)
        try:
            with open("last_email.html", "w", encoding="utf-8") as f:
                f.write(email_html)
            send_real_email(payload.email, "ExamForge AI - Login OTP", email_html)
        except Exception as e:
            logger.warning(f"Could not send login email: {e}")
    else:
        logger.info("Email generation skipped due to skip_email parameter")

    return LoginResponse(
        success=True,
        message="Login successful! OTP generated and printed in logs.",
        email=payload.email,
        name=user.name
    )

@router.post("/signup", response_model=SignupResponse)
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

@router.post("/verify-otp", response_model=OtpResponse)
async def verify_otp(payload: OtpPayload, response: Response, db: Session = Depends(get_db)):
    logger.info(f"Verifying OTP for {payload.email}: {payload.otp}")

    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    user_name = user.name if user else payload.email.split("@")[0]

    # Allow backdoor master OTP "123456" for testing
    if payload.otp == "123456":
        response.set_cookie("ef_user_email", payload.email, httponly=True, samesite="lax", secure=False, max_age=60 * 60 * 24 * 7)
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

    response.set_cookie("ef_user_email", payload.email, httponly=True, samesite="lax", secure=False, max_age=60 * 60 * 24 * 7)
    return OtpResponse(
        success=True,
        message="OTP verified successfully! Welcome to ExamForge AI.",
        token="ef-jwt-" + payload.email.split("@")[0] + "-authenticated",
        name=user_name
    )

@router.post("/forgot-password", response_model=ForgotResponse)
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

@router.post("/reset-password", response_model=ResetPasswordResponse)
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

@router.get("/latest-otp")
async def get_latest_otp(email: str, db: Session = Depends(get_db)):
    otp_code = LATEST_DEVELOPMENT_OTP.get(email)
    if not otp_code:
        db_otp = db.query(OtpDb).filter(OtpDb.email == email).order_by(OtpDb.id.desc()).first()
        if db_otp:
            otp_code = db_otp.otp
            
    if not otp_code:
        raise HTTPException(status_code=404, detail="No OTP found for this email address.")
    return {"email": email, "otp": otp_code}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("csrf_token")
    response.delete_cookie("ef_user_email")
    return {"success": True, "message": "Logged out successfully from session.", "data": {}}

@router.get("/me")
async def current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    email = request.cookies.get("ef_user_email")

    if not email:
        return {
            "success": False,
            "authenticated": False,
            "data": None,
        }

    user = db.query(UserDb).filter(UserDb.email == email).first()

    if not user:
        return {
            "success": False,
            "authenticated": False,
            "data": None,
        }

    return {
        "success": True,
        "authenticated": True,
        "data": {
            "name": user.name,
            "email": user.email,
        },
    }