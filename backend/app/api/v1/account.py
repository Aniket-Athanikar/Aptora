import random
import datetime
import logging
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.db.redis import redis_client
from app.models.user import UserDb, UserProfileDb, OtpDb, AccountDeletionRequestDb
from app.models.billing import OrderDb
from app.schemas.account import (
    DeleteAccountRequestPayload,
    DeleteAccountVerifyPayload,
    DeleteAccountResponse
)
from app.services.email_service import generate_account_deletion_email_html, send_real_email

logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/account", tags=["account"])


@router.post("/request-deletion", response_model=DeleteAccountResponse)
async def request_account_deletion(payload: DeleteAccountRequestPayload, db: Session = Depends(get_db)):
    logger.info(f"Account deletion requested for: {payload.email}")

    # Find user
    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address."
        )

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))

    # Store deletion request in DB
    deletion_request = AccountDeletionRequestDb(
        user_id=user.id,
        email=payload.email,
        reason=payload.reason or "",
        otp=otp_code,
        status="pending"
    )
    db.add(deletion_request)
    db.commit()

    # Print OTP to console for development
    print(f"\n[ACCOUNT DELETION] OTP for {payload.email}: {otp_code}\n", flush=True)

    # Generate and send deletion warning email
    email_html = generate_account_deletion_email_html(user.name, otp_code)
    try:
        with open("last_email.html", "w", encoding="utf-8") as f:
            f.write(email_html)
        send_real_email(payload.email, "ExamForge AI - Account Deletion Verification", email_html)
    except Exception as e:
        logger.warning(f"Could not send deletion email: {e}")

    # Cache OTP in Redis if available
    if redis_client:
        try:
            redis_client.setex(f"delete_otp:{payload.email}", 600, otp_code)
        except Exception as e:
            logger.warning(f"Could not cache deletion OTP in Redis: {e}")

    return DeleteAccountResponse(
        success=True,
        message="Deletion OTP sent to your email. Please verify to permanently delete your account."
    )


@router.post("/get-otp", response_model=dict)
async def get_deletion_otp(payload: dict, db: Session = Depends(get_db)):
    """Retrieve the OTP for account deletion (for development/testing)"""
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required."
        )

    # Find the most recent deletion request for this email
    deletion_request = db.query(AccountDeletionRequestDb).filter(
        AccountDeletionRequestDb.email == email,
        AccountDeletionRequestDb.status == "pending"
    ).order_by(AccountDeletionRequestDb.created_at.desc()).first()

    if not deletion_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending deletion request found. Please request deletion first."
        )

    return {
        "success": True,
        "otp": deletion_request.otp,
        "message": "OTP retrieved successfully."
    }


@router.post("/verify-deletion", response_model=DeleteAccountResponse)
async def verify_account_deletion(payload: DeleteAccountVerifyPayload, db: Session = Depends(get_db)):
    logger.info(f"Account deletion verification for: {payload.email}")

    # Find user
    user = db.query(UserDb).filter(UserDb.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address."
        )

    # Allow backdoor master OTP "123456" for testing
    otp_valid = False
    if payload.otp == "123456":
        otp_valid = True
    else:
        # Check Redis first
        cached_otp = None
        if redis_client:
            try:
                cached_otp = redis_client.get(f"delete_otp:{payload.email}")
            except Exception:
                pass

        if cached_otp and cached_otp == payload.otp:
            otp_valid = True
            # Clear Redis key
            if redis_client:
                try:
                    redis_client.delete(f"delete_otp:{payload.email}")
                except Exception:
                    pass
        else:
            # Check database
            deletion_request = db.query(AccountDeletionRequestDb).filter(
                AccountDeletionRequestDb.email == payload.email,
                AccountDeletionRequestDb.otp == payload.otp,
                AccountDeletionRequestDb.otp_verified == False,
                AccountDeletionRequestDb.status == "pending"
            ).order_by(AccountDeletionRequestDb.created_at.desc()).first()

            if deletion_request:
                otp_valid = True
                deletion_request.otp_verified = True
                deletion_request.status = "confirmed"
                db.commit()

    if not otp_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code. Please check your email or console logs."
        )

    # ── PERMANENT DELETION CASCADE ──
    logger.info(f"Permanently deleting all data for user: {payload.email} (ID: {user.id})")

    # 1. Delete user profile
    db.query(UserProfileDb).filter(UserProfileDb.user_id == user.id).delete()

    # 2. Delete all orders
    db.query(OrderDb).filter(OrderDb.user_id == user.id).delete()

    # 3. Delete all OTPs
    db.query(OtpDb).filter(OtpDb.email == payload.email).delete()

    # 4. Mark deletion requests as completed, then delete them
    db.query(AccountDeletionRequestDb).filter(
        AccountDeletionRequestDb.email == payload.email
    ).update({
        "status": "completed",
        "completed_at": datetime.datetime.utcnow()
    })
    db.commit()

    # 5. Delete the deletion request records themselves
    db.query(AccountDeletionRequestDb).filter(
        AccountDeletionRequestDb.email == payload.email
    ).delete()

    # 6. Delete the user account
    db.query(UserDb).filter(UserDb.id == user.id).delete()
    db.commit()

    logger.info(f"Account permanently deleted: {payload.email}")

    return DeleteAccountResponse(
        success=True,
        message="Your account and all associated data have been permanently deleted."
    )
