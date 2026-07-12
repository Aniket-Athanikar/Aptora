"""
ExamForge AI — Contact & Newsletter Schemas
"""
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
