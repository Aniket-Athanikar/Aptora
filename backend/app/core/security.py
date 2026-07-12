"""
ExamForge AI — Security Utilities
JWT generation, password hashing, and CSRF helpers.
"""
import hashlib
import secrets


def generate_csrf_token(email: str) -> str:
    """Generate a CSRF token based on email prefix."""
    prefix = email.split("@")[0] if "@" in email else email
    return f"ef-csrf-{prefix}"


def generate_jwt_token(email: str) -> str:
    """
    Generate a simple JWT-like token for authentication.
    NOTE: In production, use a proper JWT library (python-jose, PyJWT).
    """
    prefix = email.split("@")[0] if "@" in email else email
    return f"ef-jwt-{prefix}-authenticated"


def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)
