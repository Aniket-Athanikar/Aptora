"""
Aptora — Password Service
Handles secure password hashing, constant-time verification, strength validation,
and password reset business rules.
"""
from typing import Tuple
import hmac
import hashlib
import os

try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    HAS_BCRYPT = False


class PasswordService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hashes raw password using bcrypt with salt."""
        if not password:
            return ""
        if HAS_BCRYPT:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
            return hashed.decode("utf-8")
        else:
            # Fallback secure salted SHA256 if bcrypt module is not present
            salt = os.urandom(16).hex()
            key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
            return f"pbkdf2:sha256:100000${salt}${key.hex()}"

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Constant-time verification of password against stored hash."""
        if not plain_password or not hashed_password:
            return False
        
        if HAS_BCRYPT and hashed_password.startswith("$2"):
            try:
                return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
            except Exception:
                return False
        
        if hashed_password.startswith("pbkdf2:sha256:"):
            try:
                parts = hashed_password.split("$")
                if len(parts) != 3:
                    return False
                salt = parts[1]
                stored_key = parts[2]
                key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000)
                return hmac.compare_digest(stored_key, key.hex())
            except Exception:
                return False
        
        # Fallback raw constant time comparison (for plain passwords during legacy migration)
        return hmac.compare_digest(plain_password, hashed_password)

    @staticmethod
    def validate_strength(password: str) -> Tuple[bool, str]:
        """Validates password complexity requirements."""
        if len(password) < 6:
            return False, "Password must be at least 6 characters long."
        return True, "Password meets requirements."
