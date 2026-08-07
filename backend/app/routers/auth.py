"""
ExamForge AI — Authentication Router (Backward Compatibility Redirect)
Re-exports the v1 authentication router.
"""
from app.api.v1.auth import router, LATEST_DEVELOPMENT_OTP  # noqa: F401
