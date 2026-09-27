"""
Aptora — Auth Service
Central authentication service coordinating dual authentication modes (Classic & Passwordless),
OTP verification, password workflows, JWT token management, cookie sessions, and Google OAuth.
"""
from typing import Optional, Tuple, Dict, Any
import logging
from fastapi import Response, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.auth import (
    SignupPayload, SignupResponse,
    LoginPayload, LoginResponse,
    OtpPayload, OtpResponse,
    ForgotPayload, ForgotResponse,
    ResetPasswordPayload, ResetPasswordResponse,
    ChangePasswordPayload,
    GoogleLoginPayload, GoogleLoginResponse,
    ErrorResponse, ErrorDetail
)
from app.services.user_service import UserService
from app.services.password_service import PasswordService
from app.services.otp_service import OTPService
from app.services.jwt_service import JWTService
from app.services.session_service import SessionService
from app.services.google_service import GoogleService
from app.services.email_service import generate_otp_email_html, send_real_email

logger = logging.getLogger("backend")


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)
        self.otp_service = OTPService(db)
        self.session_service = SessionService(db)
        self.google_service = GoogleService(db)

    def signup(self, payload: SignupPayload, response: Response) -> Tuple[bool, Any]:
        """
        Classic Signup flow:
        Validate Passwords -> Hash Password -> Create User -> Generate OTP -> Send OTP -> Return
        """
        if payload.password != payload.confirm_password:
            return False, ErrorResponse(
                success=False,
                message="Passwords do not match.",
                code="PASSWORD_MISMATCH",
                errors=[ErrorDetail(field="confirm_password", message="Passwords do not match.")]
            )

        valid, strength_msg = PasswordService.validate_strength(payload.password)
        if not valid:
            return False, ErrorResponse(
                success=False,
                message=strength_msg,
                code="WEAK_PASSWORD",
                errors=[ErrorDetail(field="password", message=strength_msg)]
            )

        existing = self.user_service.get_by_email(payload.email)
        if existing:
            # If user exists, update password and name if previously created in auto mode
            valid_pw_msg, err = self.user_service.update_password(payload.email, payload.password)
            if not valid_pw_msg:
                return False, ErrorResponse(success=False, message=err, code="SIGNUP_ERROR")
            user = self.user_service.get_by_email(payload.email)
            if user:
                user.name = payload.name
                self.db.commit()
        else:
            # Create user through UserService (Single source of truth)
            is_active = (settings.AUTH_MODE == "passwordless")
            user, err = self.user_service.create_user(
                name=payload.name,
                email=payload.email,
                password=payload.password,
                is_active=is_active
            )
            if err or not user:
                return False, ErrorResponse(
                    success=False,
                    message=err or "Signup failed.",
                    code="USER_CREATION_FAILED"
                )

        # Generate OTP code using reusable OTPService
        otp_code = self.otp_service.generate_otp(payload.email)

        # Send OTP email
        if not payload.skip_email:
            email_html = generate_otp_email_html(payload.name, otp_code)
            try:
                with open("last_email.html", "w", encoding="utf-8") as f:
                    f.write(email_html)
                send_real_email(payload.email, "Welcome to Aptora - Verify OTP", email_html)
            except Exception as e:
                logger.warning(f"Could not dispatch email: {e}")

        # Set CSRF cookie
        self.session_service.set_auth_cookies(
            response=response,
            email=payload.email,
            access_token="",
            refresh_token=""
        )

        return True, SignupResponse(
            success=True,
            message="Account created! OTP generated and printed in logs.",
            email=payload.email
        )

    def login(
        self,
        payload: LoginPayload,
        response: Response,
        request: Optional[Request] = None
    ) -> Tuple[bool, Any]:
        """
        Dispatches to Classic Login or Passwordless Login based on configured AUTH_MODE or payload context.
        """
        auth_mode = getattr(settings, "AUTH_MODE", "passwordless").lower()

        if auth_mode == "password" and payload.password:
            return self._classic_login(payload, response, request)
        else:
            return self.passwordless_login(payload, response, request)

    def _classic_login(
        self,
        payload: LoginPayload,
        response: Response,
        request: Optional[Request] = None
    ) -> Tuple[bool, Any]:
        """Classic Email/Password Login flow."""
        user = self.user_service.get_by_email(payload.email)
        if not user:
            return False, ErrorResponse(
                success=False,
                message="Invalid email or password.",
                code="INVALID_CREDENTIALS"
            )

        if not PasswordService.verify_password(payload.password or "", user.password):
            return False, ErrorResponse(
                success=False,
                message="Invalid email or password.",
                code="INVALID_CREDENTIALS"
            )

        otp_code = self.otp_service.generate_otp(payload.email)

        if not payload.skip_email:
            email_html = generate_otp_email_html(user.name, otp_code)
            try:
                send_real_email(payload.email, "Aptora - Login OTP", email_html)
            except Exception as e:
                logger.warning(f"Could not send email: {e}")

        return True, LoginResponse(
            success=True,
            message="Credentials verified! OTP generated and sent to email.",
            email=payload.email,
            name=user.name
        )

    def passwordless_login(
        self,
        payload: LoginPayload,
        response: Response,
        request: Optional[Request] = None
    ) -> Tuple[bool, Any]:
        """
        Mode 2 — Passwordless Login / Auto Registration Login:
        If user exists -> Generate OTP.
        If user does NOT exist -> Create User via UserService -> Generate OTP.
        """
        logger.info(f"Passwordless login request for: {payload.email}")
        user = self.user_service.get_by_email(payload.email)
        if not user:
            name = payload.email.split("@")[0].capitalize()
            user, err = self.user_service.create_user(
                name=name,
                email=payload.email,
                password="",
                is_active=True
            )
            if err or not user:
                return False, ErrorResponse(
                    success=False,
                    message=err or "Passwordless user creation failed.",
                    code="USER_CREATION_FAILED"
                )
            logger.info(f"Auto-registered passwordless user: {payload.email}")

        otp_code = self.otp_service.generate_otp(payload.email)

        if not payload.skip_email:
            email_html = generate_otp_email_html(user.name, otp_code)
            try:
                with open("last_email.html", "w", encoding="utf-8") as f:
                    f.write(email_html)
                send_real_email(payload.email, "Aptora - Login OTP", email_html)
            except Exception as e:
                logger.warning(f"Could not send email: {e}")

        # Set CSRF cookie
        self.session_service.set_auth_cookies(
            response=response,
            email=payload.email,
            access_token="",
            refresh_token=""
        )

        return True, LoginResponse(
            success=True,
            message="Login successful! OTP generated and printed in logs.",
            email=payload.email,
            name=user.name
        )

    def verify_otp(
        self,
        payload: OtpPayload,
        response: Response,
        request: Optional[Request] = None
    ) -> Tuple[bool, Any]:
        """Verifies OTP, activates user, issues JWTs, sets cookies, registers session."""
        success, msg = self.otp_service.verify_otp(payload.email, payload.otp)
        if not success:
            return False, ErrorResponse(
                success=False,
                message=msg,
                code="INVALID_OTP",
                errors=[ErrorDetail(field="otp", message=msg)]
            )

        # Activate user if registered
        user = self.user_service.get_by_email(payload.email)
        user_name = user.name if user else payload.email.split("@")[0]
        user_id = user.id if user else 1

        if user and not user.is_active:
            self.user_service.activate_user(payload.email)

        # Generate tokens
        access_token = JWTService.create_access_token(user_id=user_id, email=payload.email, name=user_name)
        refresh_token = JWTService.create_refresh_token(user_id=user_id, email=payload.email)
        legacy_token = JWTService.generate_legacy_compatibility_token(payload.email)

        # Set cookies
        self.session_service.set_auth_cookies(
            response=response,
            email=payload.email,
            access_token=access_token,
            refresh_token=refresh_token
        )

        # Register session in DB
        if user:
            self.session_service.register_session(
                user_id=user.id,
                refresh_token=refresh_token,
                request=request
            )

        return True, OtpResponse(
            success=True,
            message="OTP verified successfully! Welcome to Aptora.",
            token=legacy_token,
            access_token=access_token,
            refresh_token=refresh_token,
            name=user_name
        )

    def forgot_password(self, payload: ForgotPayload) -> Tuple[bool, Any]:
        user = self.user_service.get_by_email(payload.email)
        if not user:
            return False, ErrorResponse(
                success=False,
                message="Account not found with this email.",
                code="USER_NOT_FOUND"
            )

        otp_code = self.otp_service.generate_otp(payload.email)
        email_html = generate_otp_email_html(user.name, otp_code)
        try:
            send_real_email(payload.email, "Aptora - Password Reset OTP", email_html)
        except Exception as e:
            logger.warning(f"Could not send email: {e}")

        return True, ForgotResponse(
            success=True,
            message="OTP sent to your email for password reset."
        )

    def reset_password(self, payload: ResetPasswordPayload) -> Tuple[bool, Any]:
        # Verify OTP first
        success, msg = self.otp_service.verify_otp(payload.email, payload.otp)
        if not success:
            return False, ErrorResponse(
                success=False,
                message=msg,
                code="INVALID_OTP",
                errors=[ErrorDetail(field="otp", message=msg)]
            )

        updated, err = self.user_service.update_password(payload.email, payload.new_password)
        if not updated:
            return False, ErrorResponse(
                success=False,
                message=err,
                code="PASSWORD_RESET_FAILED"
            )

        return True, ResetPasswordResponse(
            success=True,
            message="Password reset successful! You can now login with your new password."
        )

    def change_password(self, payload: ChangePasswordPayload) -> Tuple[bool, Any]:
        user = self.user_service.get_by_email(payload.email)
        if not user:
            return False, ErrorResponse(success=False, message="User not found.", code="USER_NOT_FOUND")

        if not PasswordService.verify_password(payload.current_password, user.password):
            return False, ErrorResponse(success=False, message="Current password incorrect.", code="INVALID_PASSWORD")

        updated, err = self.user_service.update_password(payload.email, payload.new_password)
        if not updated:
            return False, ErrorResponse(success=False, message=err, code="PASSWORD_UPDATE_FAILED")

        return True, ResetPasswordResponse(success=True, message="Password updated successfully.")

    def google_login(
        self,
        payload: GoogleLoginPayload,
        response: Response,
        request: Optional[Request] = None
    ) -> Tuple[bool, Any]:
        user, msg = self.google_service.authenticate_google_user(payload.access_token)
        if not user:
            return False, ErrorResponse(success=False, message=msg, code="GOOGLE_AUTH_FAILED")

        access_token = JWTService.create_access_token(user_id=user.id, email=user.email, name=user.name)
        refresh_token = JWTService.create_refresh_token(user_id=user.id, email=user.email)

        self.session_service.set_auth_cookies(
            response=response,
            email=user.email,
            access_token=access_token,
            refresh_token=refresh_token
        )
        self.session_service.register_session(user_id=user.id, refresh_token=refresh_token, request=request)

        return True, GoogleLoginResponse(
            success=True,
            message=msg,
            email=user.email,
            name=user.name,
            access_token=access_token,
            refresh_token=refresh_token
        )

    def logout(self, response: Response, refresh_token_str: Optional[str] = None) -> Dict[str, Any]:
        self.session_service.clear_auth_cookies(response)
        if refresh_token_str:
            self.session_service.revoke_token_session(refresh_token_str)
            JWTService.blacklist_token(refresh_token_str)
        return {"success": True, "message": "Logged out successfully from session.", "code": "SUCCESS"}
