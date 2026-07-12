import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import UserDb, UserProfileDb
from app.schemas import ProfileResponse, ProfileUpdatePayload

logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/profile", tags=["profile"])

def profile_to_dict(p: UserProfileDb, user: UserDb) -> dict:
    return {
        "id": p.id,
        "user_id": p.user_id,
        "name": user.name,
        "email": user.email,
        "member_since": user.created_at.isoformat() if user.created_at else "",
        "phone": p.phone or "",
        "dob": p.dob or "",
        "gender": p.gender or "",
        "location": p.location or "",
        "timezone": p.timezone or "Asia/Kolkata",
        "education": p.education or "",
        "college": p.college or "",
        "occupation": p.occupation or "",
        "bio": p.bio or "",
        "avatar_url": p.avatar_url or "",
        "xp": p.xp,
        "coins": p.coins,
        "level": p.level,
        "streak": p.streak,
        "target_exam": p.target_exam or "",
        "secondary_exam": p.secondary_exam or "",
        "target_score": p.target_score or "",
        "target_rank": p.target_rank or "",
        "target_date": p.target_date or "",
        "study_hours_goal": p.study_hours_goal,
        "weak_subjects": p.weak_subjects or [],
        "strong_subjects": p.strong_subjects or [],
        "favorite_subjects": p.favorite_subjects or [],
        "accuracy": p.accuracy,
        "mock_average": p.mock_average,
        "questions_solved": p.questions_solved,
        "study_hours_total": p.study_hours_total,
        "completion_pct": p.completion_pct,
        "bookmarks_count": p.bookmarks_count,
        "certificates_count": p.certificates_count,
        "social_links": p.social_links or {},
        "achievements": p.achievements or [],
        "connected_devices": p.connected_devices or [],
        "notification_settings": p.notification_settings or {},
        "privacy_settings": p.privacy_settings or {},
        "security_score": p.security_score,
        "plan": p.plan or "Free",
        "plan_renewal": p.plan_renewal or "",
        "ai_credits": p.ai_credits,
        "storage_used_mb": p.storage_used_mb,
        "updated_at": p.updated_at.isoformat() if p.updated_at else "",
    }

@router.get("", response_model=ProfileResponse)
async def get_profile(email: str, db: Session = Depends(get_db)):
    user = db.query(UserDb).filter(UserDb.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == user.id).first()
    if not profile:
        profile = UserProfileDb(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {"success": True, "profile": profile_to_dict(profile, user)}

@router.post("", response_model=ProfileResponse)
async def update_profile(email: str, payload: ProfileUpdatePayload, db: Session = Depends(get_db)):
    user = db.query(UserDb).filter(UserDb.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == user.id).first()
    if not profile:
        profile = UserProfileDb(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    update_data = payload.dict(exclude_unset=True)
    if "name" in update_data:
        user.name = update_data["name"]
        
    for key, value in update_data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    logger.info(f"Profile updated for {email}: {list(update_data.keys())}")
    return {"success": True, "profile": profile_to_dict(profile, user)}
