"""
ExamForge AI — User Service
Single source of truth for User entity lifecycle operations (creation, updates,
lookup, and deletion). Encapsulates UserRepository and database transaction safety.
"""
from typing import Optional, Tuple
import logging
from sqlalchemy.orm import Session

from app.models import UserDb
from app.repositories.user_repository import UserRepository
from app.services.password_service import PasswordService

logger = logging.getLogger("backend")


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def get_by_id(self, user_id: int) -> Optional[UserDb]:
        return self.user_repo.get_by_id(user_id)

    def get_by_email(self, email: str) -> Optional[UserDb]:
        return self.user_repo.get_by_email(email)

    def create_user(
        self,
        name: str,
        email: str,
        password: str = "",
        is_active: bool = True
    ) -> Tuple[Optional[UserDb], Optional[str]]:
        """
        Creates a new user record through UserRepository wrapped in explicit transaction commit/rollback.
        All user registrations MUST go through this method.
        """
        existing = self.user_repo.get_by_email(email)
        if existing:
            return None, "Email address is already registered."

        password_hash = PasswordService.hash_password(password) if password else ""

        try:
            user = self.user_repo.create(
                name=name,
                email=email,
                password_hash=password_hash,
                is_active=is_active
            )
            self.db.commit()
            self.db.refresh(user)
            logger.info(f"User created successfully: {email} (ID: {user.id})")
            return user, None
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating user {email}: {e}")
            return None, "Database error during user creation."

    def get_or_create_google_user(self, email: str, name: str) -> Tuple[Optional[UserDb], bool, Optional[str]]:
        """
        Gets existing user or creates a new Google-authenticated user.
        Returns (user, is_created, error_message).
        """
        user = self.user_repo.get_by_email(email)
        if user:
            return user, False, None

        new_user, err = self.create_user(name=name, email=email, password="", is_active=True)
        if err or not new_user:
            return None, False, err
        return new_user, True, None

    def update_password(self, email: str, new_password: str) -> Tuple[bool, str]:
        """Hashes new password and updates user record with transaction management."""
        user = self.user_repo.get_by_email(email)
        if not user:
            return False, "User account not found."

        valid, msg = PasswordService.validate_strength(new_password)
        if not valid:
            return False, msg

        password_hash = PasswordService.hash_password(new_password)
        user.password = password_hash

        try:
            self.user_repo.update(user)
            self.db.commit()
            self.db.refresh(user)
            logger.info(f"Password updated for user: {email}")
            return True, "Password reset successfully."
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating password for {email}: {e}")
            return False, "Database error during password update."

    def activate_user(self, email: str) -> bool:
        user = self.user_repo.get_by_email(email)
        if not user:
            return False
        user.is_active = True
        try:
            self.user_repo.update(user)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error activating user {email}: {e}")
            return False

    def delete_user(self, email: str) -> Tuple[bool, str]:
        user = self.user_repo.get_by_email(email)
        if not user:
            return False, "User not found."

        try:
            self.user_repo.delete(user)
            self.db.commit()
            logger.info(f"User deleted: {email}")
            return True, "User account deleted successfully."
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting user {email}: {e}")
            return False, "Database error during account deletion."
