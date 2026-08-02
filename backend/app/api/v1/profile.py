import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.user import UserDb
from app.models.user_profile import UserProfileDb
from app.schemas.user import ProfileResponse, ProfileUpdatePayload

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

def sync_onboarding_to_profile(profile: UserProfileDb, user: UserDb, db: Session, commit: bool = True):
    from app.models.workspace import GoalWorkspaceDb
    from app.models.onboarding_profile import UserOnboardingProfileDb
    from app.models.timeline import GoalTimelineDb
    from app.models.gap_analysis import GapAnalysisDb
    from app.models.learning_mode import LearningModeDb

    workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.user_id == user.id).first()
    if not workspace:
        return

    # 1. target_exam
    if not profile.target_exam and workspace.target_exam:
        profile.target_exam = workspace.target_exam

    # 2. onboarding profile
    onboarding = db.query(UserOnboardingProfileDb).filter(UserOnboardingProfileDb.workspace_id == workspace.id).first()
    if onboarding:
        if not profile.avatar_url and onboarding.avatar:
            profile.avatar_url = onboarding.avatar
        if not profile.education and onboarding.education:
            profile.education = onboarding.education
        if not profile.occupation and onboarding.occupation:
            profile.occupation = onboarding.occupation
        # city / location
        if not profile.location and onboarding.city:
            profile.location = onboarding.city

    # 3. timeline (exam_date, daily_study_hours)
    timeline = db.query(GoalTimelineDb).filter(GoalTimelineDb.workspace_id == workspace.id).first()
    if timeline:
        if not profile.study_hours_goal and timeline.daily_study_hours:
            profile.study_hours_goal = float(timeline.daily_study_hours)
        if not profile.target_date and timeline.exam_date:
            profile.target_date = timeline.exam_date.isoformat()

    # 4. gap analysis (weak subjects)
    gaps = db.query(GapAnalysisDb).filter(GapAnalysisDb.workspace_id == workspace.id).all()
    if gaps and not profile.weak_subjects:
        profile.weak_subjects = [g.subject for g in gaps]

    # 5. learning modes (favorite subjects)
    modes = db.query(LearningModeDb).filter(LearningModeDb.workspace_id == workspace.id).all()
    if modes and not profile.favorite_subjects:
        profile.favorite_subjects = [m.learning_mode for m in modes]

    if commit:
        db.commit()


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

    if "avatar_url" in update_data:
        onboarding.avatar = update_data["avatar_url"]
    if "education" in update_data:
        onboarding.education = update_data["education"]
    if "occupation" in update_data:
        onboarding.occupation = update_data["occupation"]
    if "name" in update_data:
        onboarding.full_name = update_data["name"]
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

    # Sync any updates from the onboarding wizard tables
    sync_onboarding_to_profile(profile, user, db)

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

    # Sync fields to onboarding wizard tables
    sync_profile_to_onboarding(profile, user, db, update_data)

    logger.info(f"Profile updated for {email}: {list(update_data.keys())}")
    return {"success": True, "profile": profile_to_dict(profile, user)}
