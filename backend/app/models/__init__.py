"""
Aptora — Models Package
"""

# User Models
from app.models.user import UserDb, OtpDb, SessionDb

# User Profile
from app.models.user_profile import UserProfileDb

# Workspace Models
from app.models.workspace import GoalWorkspaceDb
from app.models.timeline import GoalTimelineDb
from app.models.lifestyle import StudyLifestyleDb
from app.models.study_slot import StudyTimeSlotDb
from app.models.learning_mode import LearningModeDb
from app.models.gap_analysis import GapAnalysisDb
from .workspace_subject import WorkspaceSubjectDb
from .resource import ResourceDb
from .resource_chunk import ResourceChunkDb
from app.models.resource_content import ResourceContentDb

# Billing
from app.models.billing import OrderDb

# Contact
from app.models.contact import ContactDb

# Newsletter
from app.models.newsletter import NewsletterDb

# Account
from app.models.account import AccountDeletionRequestDb
from app.models.onboarding_profile import UserOnboardingProfileDb
from app.models.knowledge_conversation import KnowledgeConversationDb, KnowledgeMessageDb
from app.models.notification import NotificationDb
from app.models.ai_study_source import AiStudySourceDb
from app.models.llm_usage import LlmUsageDb
from app.models.audit_event import AuditEventDb
from app.models.chat_export import ChatExportDb


__all__ = [
    "UserDb",
    "OtpDb",
    "SessionDb",
    "UserProfileDb",
    "GoalWorkspaceDb",
    "GoalTimelineDb",
    "StudyLifestyleDb",
    "StudyTimeSlotDb",
    "LearningModeDb",
    "GapAnalysisDb",
    "WorkspaceSubjectDb",
    "ResourceDb",
    "ResourceChunkDb",
    "ResourceContentDb",
    "OrderDb",
    "ContactDb",
    "NewsletterDb",
    "AccountDeletionRequestDb",
    "UserOnboardingProfileDb",
    "KnowledgeConversationDb",
    "KnowledgeMessageDb",
    "NotificationDb",
    "AiStudySourceDb",
    "LlmUsageDb",
    "AuditEventDb",
    "ChatExportDb",
]

