"""
ExamForge AI — Central API Router
Aggregates all versioned API routers.
"""
from fastapi import APIRouter

from app.api.v1 import ( auth, profile, billing, newsletter, admin, contact, account, workspace, onboarding_profile, 
                        timeline, study_slot, lifestyle, learning_mode, gap_analysis, resource, chat, summary, flashcard, 
                        question, prediction, knowledge, mcq, study_advisor, concept, notification)
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
api_router.include_router(resource.router)
api_router.include_router(chat.router)
api_router.include_router(summary.router)
api_router.include_router(flashcard.router)
api_router.include_router(question.router)
api_router.include_router(prediction.router)
api_router.include_router(knowledge.router)
api_router.include_router(mcq.router)
api_router.include_router(study_advisor.router)
api_router.include_router(concept.router)
api_router.include_router(notification.router)