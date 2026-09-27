"""
Aptora — User Repository
Handles data access logic for UserDb and UserProfileDb entities.
Never commits transactions (commits/rollbacks are managed by services).
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.models import UserDb, UserProfileDb


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[UserDb]:
        return self.db.query(UserDb).filter(UserDb.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[UserDb]:
        return self.db.query(UserDb).filter(UserDb.email == email).first()

    def create(self, name: str, email: str, password_hash: str, is_active: bool = True) -> UserDb:
        user = UserDb(
            name=name,
            email=email,
            password=password_hash,
            is_active=is_active
        )
        self.db.add(user)
        self.db.flush()  # Populates user.id without committing
        
        # Create associated UserProfileDb profile
        profile = UserProfileDb(user_id=user.id)
        self.db.add(profile)
        return user

    def update(self, user: UserDb) -> UserDb:
        self.db.add(user)
        return user

    def delete(self, user: UserDb) -> None:
        # Delete profile first if exists
        profile = self.db.query(UserProfileDb).filter(UserProfileDb.user_id == user.id).first()
        if profile:
            self.db.delete(profile)
        self.db.delete(user)
