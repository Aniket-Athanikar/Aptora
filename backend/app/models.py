import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserDb(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OtpDb(Base):
    __tablename__ = "otps"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False)
    otp = Column(String(6), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_used = Column(Boolean, default=False)

class SessionDb(Base):
    __tablename__ = "user_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    refresh_token = Column(String(500), unique=True, nullable=False)
    device_info = Column(String(255), default="")
    ip_address = Column(String(50), default="")
    is_revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


from app.models.user_profile import UserProfileDb

class OrderDb(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_name = Column(String(50), nullable=False)
    cycle = Column(String(50), nullable=False)
    amount = Column(String(50), nullable=False)
    txn_id = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ContactDb(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class NewsletterDb(Base):
    __tablename__ = "newsletter_subscribers"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AccountDeletionRequestDb(Base):
    __tablename__ = "account_deletion_requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    email = Column(String(100), nullable=False)
    reason = Column(Text, default="")
    otp = Column(String(6), nullable=False)
    otp_verified = Column(Boolean, default=False)
    status = Column(String(20), default="pending")  # pending, confirmed, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
