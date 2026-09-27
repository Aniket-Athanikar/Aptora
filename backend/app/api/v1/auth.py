"""
Aptora — Authentication Controller (API v1)
Standardized, layered authentication endpoints backed by AuthService and Pydantic v2 schemas.
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import (
    LoginPayload, LoginResponse,
    SignupPayload, SignupResponse,
    OtpPayload, OtpResponse,
    ForgotPayload, ForgotResponse,
    ResetPasswordPayload, ResetPasswordResponse,
    ChangePasswordPayload,
    GoogleLoginPayload, GoogleLoginResponse,
    ErrorResponse
)
from app.services.auth_service import AuthService
from app.services.otp_service import OTPService, LATEST_DEVELOPMENT_OTP
from app.services.jwt_service import JWTService
from app.repositories.user_repository import UserRepository
from app.models import UserDb


logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginPayload,
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    logger.info(f"Auth login request: {payload.email}")
    auth_service = AuthService(db)
    ok, result = auth_service.login(payload, response, request)
    if not ok:
        err: ErrorResponse = result
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=err.model_dump())
    return result


@router.post("/signup", response_model=SignupResponse)
async def signup(
    payload: SignupPayload,
    response: Response,
    db: Session = Depends(get_db)
):
    logger.info(f"Auth signup request: {payload.email}")
    auth_service = AuthService(db)
    ok, result = auth_service.signup(payload, response)
    if not ok:
        err: ErrorResponse = result
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=err.model_dump())
    return result


@router.post("/verify-otp", response_model=OtpResponse)
async def verify_otp(
    payload: OtpPayload,
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    logger.info(f"Auth verify OTP request: {payload.email}")
    auth_service = AuthService(db)
    ok, result = auth_service.verify_otp(payload, response, request)
    if not ok:
        err: ErrorResponse = result
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=err.model_dump())
    return result


@router.post("/forgot-password", response_model=ForgotResponse)
async def forgot_password(
    payload: ForgotPayload,
    db: Session = Depends(get_db)
):
    logger.info(f"Auth forgot password request: {payload.email}")
    auth_service = AuthService(db)
    ok, result = auth_service.forgot_password(payload)
    if not ok:
        err: ErrorResponse = result
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=err.model_dump())
    return result


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    payload: ResetPasswordPayload,
    db: Session = Depends(get_db)
):
    logger.info(f"Auth reset password request: {payload.email}")
    auth_service = AuthService(db)
    ok, result = auth_service.reset_password(payload)
    if not ok:
        err: ErrorResponse = result
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=err.model_dump())
    return result


@router.post("/change-password", response_model=ResetPasswordResponse)
async def change_password(
    payload: ChangePasswordPayload,
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    ok, result = auth_service.change_password(payload)
    if not ok:
        err: ErrorResponse = result
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=err.model_dump())
    return result


@router.post("/google", response_model=GoogleLoginResponse)
async def google_login(
    payload: GoogleLoginPayload,
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    ok, result = auth_service.google_login(payload, response, request)
    if not ok:
        err: ErrorResponse = result
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=err.model_dump())
    return result


@router.get("/latest-otp")
async def get_latest_otp(
    email: str,
    db: Session = Depends(get_db)
):
    otp_service = OTPService(db)
    otp_code = otp_service.get_latest_otp(email)
    if not otp_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No OTP found for this email address."
        )
    return {"success": True, "email": email, "otp": otp_code}


@router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    refresh_token_str = request.cookies.get("refresh_token")
    return auth_service.logout(response, refresh_token_str)


@router.get("/me")
async def get_me(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Returns authenticated user profile info for frontend auth context.
    """
    token = None
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    if not token:
        token = request.cookies.get("access_token") or request.cookies.get("ef_user_email")

    user = None
    if token:
        payload = JWTService.verify_access_token(token)
        if payload and payload.get("email"):
            user_repo = UserRepository(db)
            user = user_repo.get_by_email(payload["email"])
        elif "@" in token:
            user_repo = UserRepository(db)
            user = user_repo.get_by_email(token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated."
        )

    return {
        "success": True,
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_active": getattr(user, "is_active", True)
    }

