"""
ExamForge AI — Central API Router
Aggregates all versioned API routers.
"""
from fastapi import APIRouter

from app.api.v1 import auth, profile, billing, newsletter, admin, contact, account, workspace, onboarding_profile, timeline, study_slot, lifestyle, learning_mode, gap_analysis

api_router = APIRouter()

# V1 API routes
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(billing.router)
api_router.include_router(newsletter.router)
api_router.include_router(admin.router)
api_router.include_router(contact.router)
api_router.include_router(account.router)
api_router.include_router(workspace.router)
api_router.include_router(onboarding_profile.router)
api_router.include_router(timeline.router)
api_router.include_router(lifestyle.router)
api_router.include_router(study_slot.router)
api_router.include_router(learning_mode.router)
api_router.include_router(gap_analysis.router)
