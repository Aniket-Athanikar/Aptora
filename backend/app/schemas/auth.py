"""
Aptora — Auth Schemas (Enterprise Architecture v2)
Request, response, and error models for authentication endpoints.
"""
from typing import Any, List, Optional
from pydantic import BaseModel, EmailStr, Field


class StandardResponse(BaseModel):
    success: bool = True
    message: str = ""
    code: str = "SUCCESS"
    data: Optional[Any] = None


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    code: str = "AUTH_ERROR"
    errors: List[ErrorDetail] = Field(default_factory=list)


class LoginPayload(BaseModel):
    email: EmailStr
    password: Optional[str] = None
    skip_email: Optional[bool] = False


class LoginResponse(BaseModel):
    success: bool = True
    message: str
    email: str
    name: str
    code: str = "SUCCESS"
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None


class SignupPayload(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    skip_email: Optional[bool] = False


class SignupResponse(BaseModel):
    success: bool = True
    message: str
    email: str
    code: str = "SUCCESS"


class OtpPayload(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class OtpResponse(BaseModel):
    success: bool = True
    message: str
    token: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    name: str
    code: str = "SUCCESS"


class ForgotPayload(BaseModel):
    email: EmailStr


class ForgotResponse(BaseModel):
    success: bool = True
    message: str
    code: str = "SUCCESS"


class ResetPasswordPayload(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)


class ResetPasswordResponse(BaseModel):
    success: bool = True
    message: str
    code: str = "SUCCESS"


class ChangePasswordPayload(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str = Field(..., min_length=6)


class RefreshTokenPayload(BaseModel):
    refresh_token: str


class GoogleLoginPayload(BaseModel):
    access_token: str


class GoogleLoginResponse(BaseModel):
    success: bool = True
    message: str
    email: str
    name: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    code: str = "SUCCESS"
