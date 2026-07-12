"""
ExamForge AI — Auth Schemas
Request/response models for authentication endpoints.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginPayload(BaseModel):
    email: EmailStr
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
