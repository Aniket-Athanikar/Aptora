"""
Aptora — OTP Repository
Handles DB persistence for OTPs.
Never commits transactions.
"""
from typing import Optional
import datetime
from sqlalchemy.orm import Session
from app.models import OtpDb


class OtpRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_otp(self, email: str, otp_code: str) -> OtpDb:
        otp_record = OtpDb(
            email=email,
            otp=otp_code,
            is_used=False,
            created_at=datetime.datetime.utcnow()
        )
        self.db.add(otp_record)
        return otp_record

    def get_latest_valid_otp(self, email: str) -> Optional[OtpDb]:
        return (
            self.db.query(OtpDb)
            .filter(OtpDb.email == email, OtpDb.is_used == False)
            .order_by(OtpDb.created_at.desc())
            .first()
        )

    def mark_as_used(self, otp_record: OtpDb) -> OtpDb:
        otp_record.is_used = True
        self.db.add(otp_record)
        return otp_record

    def cleanup_expired(self, minutes_threshold: int = 15) -> int:
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=minutes_threshold)
        deleted_count = (
            self.db.query(OtpDb)
            .filter((OtpDb.created_at < cutoff) | (OtpDb.is_used == True))
            .delete(synchronize_session=False)
        )
        return deleted_count
