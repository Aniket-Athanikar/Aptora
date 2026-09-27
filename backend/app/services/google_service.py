"""
Aptora — Google Service
Handles Google OAuth authentication, token verification, and integration with
UserService for account registration/lookup.
"""
from typing import Dict, Optional, Tuple
import logging
from sqlalchemy.orm import Session
import requests

from app.models import UserDb
from app.services.user_service import UserService

logger = logging.getLogger("backend")


class GoogleService:
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)

    def verify_google_access_token(self, access_token: str) -> Optional[Dict[str, str]]:
        """
        Validates Google OAuth access token against Google's userinfo endpoint.
        Returns user info dictionary (email, name) if valid.
        """
        if not access_token:
            return None
        
        # Mock token handling for testing/demo environments
        if access_token.startswith("mock-google-token-"):
            email_prefix = access_token.replace("mock-google-token-", "")
            return {
                "email": f"{email_prefix}@gmail.com",
                "name": email_prefix.capitalize(),
                "verified_email": True
            }

        try:
            url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={access_token}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                return {
                    "email": data.get("email", ""),
                    "name": data.get("name") or data.get("given_name") or data.get("email", "").split("@")[0],
                    "verified_email": data.get("email_verified", True)
                }
            logger.warning(f"Google token verification failed: HTTP {response.status_code}")
            return None
        except Exception as e:
            logger.warning(f"Google token verification request error: {e}")
            return None

    def authenticate_google_user(self, access_token: str) -> Tuple[Optional[UserDb], str]:
        """
        Main workflow for Google OAuth authentication:
        1. Verify token
        2. Get or create user via UserService
        3. Return user record
        """
        user_info = self.verify_google_access_token(access_token)
        if not user_info or not user_info.get("email"):
            return None, "Invalid or expired Google OAuth token."

        email = user_info["email"]
        name = user_info["name"]

        # Delegate lookup and creation strictly to UserService
        user, is_created, err = self.user_service.get_or_create_google_user(email=email, name=name)
        if err or not user:
            return None, err or "Failed to authenticate Google user."

        action = "registered and logged in" if is_created else "logged in"
        return user, f"Successfully {action} via Google OAuth."
