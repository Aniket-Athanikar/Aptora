from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class ContactForm(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=2, max_length=200)
    message: str = Field(..., min_length=10, max_length=1000)

class NewsletterPayload(BaseModel):
    email: EmailStr

class ContactResponse(BaseModel):
    success: bool
    message: str
    data: ContactForm

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

class InvoiceEmailPayload(BaseModel):
    email: str
    planName: str
    cycle: str
    amount: str
    txnId: str

class OrderUpdatePayload(BaseModel):
    plan_name: Optional[str] = None
    cycle: Optional[str] = None
    amount: Optional[str] = None
    txn_id: Optional[str] = None

class DeleteAccountRequestPayload(BaseModel):
    email: EmailStr
    reason: Optional[str] = ""

class DeleteAccountVerifyPayload(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)

class DeleteAccountResponse(BaseModel):
    success: bool
    message: str
