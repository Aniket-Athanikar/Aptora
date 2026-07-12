"""
ExamForge AI — Account Management Schemas
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class DeleteAccountRequestPayload(BaseModel):
    email: EmailStr
    reason: Optional[str] = ""


class DeleteAccountVerifyPayload(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class DeleteAccountResponse(BaseModel):
    success: bool
    message: str
