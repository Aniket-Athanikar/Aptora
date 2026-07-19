"""
ExamForge AI — Models Package
"""

# User Models
from app.models.user import UserDb, OtpDb

# User Profile
from app.models.user_profile import UserProfileDb

# Workspace Models
from app.models.workspace import GoalWorkspaceDb
from app.models.timeline import GoalTimelineDb
from app.models.lifestyle import StudyLifestyleDb
from app.models.study_slot import StudyTimeSlotDb
from app.models.learning_mode import LearningModeDb
from app.models.gap_analysis import GapAnalysisDb

# Billing
from app.models.billing import OrderDb

# Contact
from app.models.contact import ContactDb

# Newsletter
from app.models.newsletter import NewsletterDb

# Account
from app.models.account import AccountDeletionRequestDb
from app.models.onboarding_profile import UserOnboardingProfileDb

__all__ = [
    "UserDb",
    "OtpDb",
    "UserProfileDb",
    "GoalWorkspaceDb",
    "GoalTimelineDb",
    "StudyLifestyleDb",
    "StudyTimeSlotDb",
    "LearningModeDb",
    "GapAnalysisDb",
    "OrderDb",
    "ContactDb",
    "NewsletterDb",
    "AccountDeletionRequestDb",
    "UserOnboardingProfileDb",
]