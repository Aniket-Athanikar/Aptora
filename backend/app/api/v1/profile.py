import logging
import os
import uuid
import io
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from sqlalchemy.orm import Session
from PIL import Image

from app.core.dependencies import get_db, get_current_user
from app.models.user import UserDb
from app.models.user_profile import UserProfileDb
from app.schemas.user import ProfileResponse, ProfileUpdatePayload, EventLogPayload
from app.core.websocket import ws_manager

logger = logging.getLogger("backend")
router = APIRouter(prefix="/api/profile", tags=["profile"])

UPLOAD_DIR = "app/uploads/profile"

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


def sync_profile_to_onboarding(profile: UserProfileDb, user: UserDb, db: Session, update_data: dict):
    from app.models.workspace import GoalWorkspaceDb
    from app.models.onboarding_profile import UserOnboardingProfileDb
    from app.models.timeline import GoalTimelineDb
    from app.models.gap_analysis import GapAnalysisDb
    from app.models.learning_mode import LearningModeDb
    import datetime

    workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.user_id == user.id).first()
    if not workspace:
        workspace = GoalWorkspaceDb(
            user_id=user.id,
            target_exam=update_data.get("target_exam") or "Competitive Exam",
            exam_category="General"
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
    else:
        if "target_exam" in update_data and update_data["target_exam"]:
            workspace.target_exam = update_data["target_exam"]

    onboarding = db.query(UserOnboardingProfileDb).filter(UserOnboardingProfileDb.workspace_id == workspace.id).first()
    if not onboarding:
        onboarding = UserOnboardingProfileDb(workspace_id=workspace.id, full_name=user.name)
        db.add(onboarding)
        db.commit()
        db.refresh(onboarding)

    if "education" in update_data:
        onboarding.education = update_data["education"]
    if "occupation" in update_data:
        onboarding.occupation = update_data["occupation"]
    if "name" in update_data:
        onboarding.full_name = update_data["name"]
    if "gender" in update_data:
        onboarding.gender = update_data["gender"]
    if "phone" in update_data:
        onboarding.phone = update_data["phone"]
    if "location" in update_data and update_data["location"]:
        parts = update_data["location"].split(",")
        city = parts[0].strip() if parts else update_data["location"]
        onboarding.city = city

    timeline = db.query(GoalTimelineDb).filter(GoalTimelineDb.workspace_id == workspace.id).first()
    if not timeline:
        timeline = GoalTimelineDb(
            workspace_id=workspace.id,
            exam_date=datetime.date.today() + datetime.timedelta(days=365),
            daily_study_hours=int(update_data.get("study_hours_goal") or 4)
        )
        db.add(timeline)
        db.commit()
        db.refresh(timeline)
    else:
        if "study_hours_goal" in update_data and update_data["study_hours_goal"] is not None:
            timeline.daily_study_hours = int(update_data["study_hours_goal"])
        if "target_date" in update_data and update_data["target_date"]:
            try:
                date_str = update_data["target_date"].split("T")[0]
                timeline.exam_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
            except Exception as e:
                logger.error(f"Error parsing target_date {update_data['target_date']}: {e}")

    if "weak_subjects" in update_data and update_data["weak_subjects"] is not None:
        db.query(GapAnalysisDb).filter(GapAnalysisDb.workspace_id == workspace.id).delete()
        for sub in update_data["weak_subjects"]:
            gap = GapAnalysisDb(workspace_id=workspace.id, subject=sub, confidence=2, difficulty="Medium")
            db.add(gap)

    if "favorite_subjects" in update_data and update_data["favorite_subjects"] is not None:
        db.query(LearningModeDb).filter(LearningModeDb.workspace_id == workspace.id).delete()
        for mode in update_data["favorite_subjects"]:
            learning_mode = LearningModeDb(workspace_id=workspace.id, learning_mode=mode)
            db.add(learning_mode)

    db.commit()


@router.get("", response_model=ProfileResponse)
async def get_profile(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == current_user.id).first()
    if not profile:
        profile = UserProfileDb(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {"success": True, "profile": profile_to_dict(profile, current_user)}


@router.post("", response_model=ProfileResponse)
@router.patch("", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdatePayload,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == current_user.id).first()
    if not profile:
        profile = UserProfileDb(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    update_data = payload.dict(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        current_user.name = update_data["name"]

    for key, value in update_data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    sync_profile_to_onboarding(profile, current_user, db, update_data)
    logger.info(f"Profile updated for {current_user.email}")
    return {"success": True, "profile": profile_to_dict(profile, current_user)}


@router.post("/avatar", response_model=ProfileResponse)
async def upload_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if avatar.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats: JPEG, PNG, WEBP."
        )

    max_size = 5 * 1024 * 1024
    content = await avatar.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is too large. Maximum allowed size is 5MB."
        )

    try:
        image = Image.open(io.BytesIO(content))
        image = image.resize((512, 512), Image.Resampling.LANCZOS)
        output_buffer = io.BytesIO()
        image.save(output_buffer, format="WEBP", quality=85)
        processed_content = output_buffer.getvalue()
    except Exception as e:
        logger.error(f"Image processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Failed to process image. Make sure it is a valid image file."
        )

    user_upload_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)

    try:
        for file in os.listdir(user_upload_dir):
            os.remove(os.path.join(user_upload_dir, file))
    except Exception as e:
        logger.warning(f"Failed to clear old avatar files: {e}")

    safe_filename = f"avatar-{uuid.uuid4().hex}.webp"
    filepath = os.path.join(user_upload_dir, safe_filename)
    with open(filepath, "wb") as f:
        f.write(processed_content)

    profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == current_user.id).first()
    if not profile:
        profile = UserProfileDb(user_id=current_user.id)
        db.add(profile)

    avatar_url = f"/uploads/profile/{current_user.id}/{safe_filename}"
    profile.avatar_url = avatar_url
    db.commit()
    db.refresh(profile)

    return {"success": True, "profile": profile_to_dict(profile, current_user)}


@router.delete("/avatar", response_model=ProfileResponse)
async def delete_avatar(
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    if profile.avatar_url:
        clean_url = profile.avatar_url.lstrip("/")
        possible_paths = [clean_url, os.path.join("app", clean_url)]
        for p in possible_paths:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception as e:
                    logger.error(f"Failed to delete physical avatar file at {p}: {e}")

    profile.avatar_url = ""
    db.commit()
    db.refresh(profile)

    return {"success": True, "profile": profile_to_dict(profile, current_user)}


@router.post("/event")
async def report_event(
    payload: EventLogPayload,
    db: Session = Depends(get_db),
    current_user: UserDb = Depends(get_current_user),
):
    profile = db.query(UserProfileDb).filter(UserProfileDb.user_id == current_user.id).first()
    if not profile:
        profile = UserProfileDb(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    event_type = payload.event_type
    details = payload.details or {}

    title = ""
    description = ""
    badge = ""
    color = "indigo"

    if event_type == "TIMER_STARTED":
        title = "Focus Timer Started"
        description = f"{current_user.name} started a focus session for '{details.get('subject', 'General Study')}'."
        badge = "Timer"
        color = "indigo"
    elif event_type == "TIMER_PAUSED":
        title = "Focus Timer Paused"
        description = f"{current_user.name} paused the study timer."
        badge = "Timer"
        color = "amber"
    elif event_type == "TIMER_COMPLETED" or event_type == "SESSION_COMPLETED":
        duration = int(details.get("duration_minutes", 25))
        xp_gain = 100
        profile.xp += xp_gain
        profile.study_hours_total += (duration / 60.0)
        # Recalculate level
        profile.level = int(profile.xp / 1000) + 1
        db.commit()

        title = "Study Session Completed"
        description = f"{current_user.name} completed a {duration}m session: +{xp_gain} XP earned!"
        badge = "Success"
        color = "emerald"
    elif event_type == "BREAK_STARTED":
        title = "Break Started"
        description = f"{current_user.name} started a well-deserved break."
        badge = "Recess"
        color = "purple"
    elif event_type == "BREAK_COMPLETED":
        title = "Break Completed"
        description = f"{current_user.name} finished the break. Ready for next session!"
        badge = "Recess"
        color = "emerald"
    elif event_type == "STREAK_UPDATED":
        profile.streak += 1
        db.commit()
        title = "Streak Updated"
        description = f"{current_user.name} reached a {profile.streak}-day study streak!"
        badge = "Streak"
        color = "orange"
    elif event_type == "ACHIEVEMENT_UNLOCKED":
        title = "Achievement Unlocked"
        description = f"{current_user.name} unlocked: '{details.get('name', 'Milestone Master')}'!"
        badge = "Trophy"
        color = "amber"
    elif event_type == "COACH_NOTIFICATION":
        title = "AI Coach Notification"
        description = f"Coach: '{details.get('message', 'Keep up the good work!')}'"
        badge = "AI Coach"
        color = "purple"
    else:
        title = event_type.replace("_", " ").title()
        description = details.get("description", "")
        badge = details.get("badge", "System")
        color = details.get("color", "indigo")

    broadcast_payload = {
        "type": "realtime_update",
        "title": title,
        "description": description,
        "badge": badge,
        "color": color,
        "xp": profile.xp,
        "streak": profile.streak,
        "level": profile.level
    }

    await ws_manager.broadcast(broadcast_payload)
    return {"success": True, "event": broadcast_payload}
