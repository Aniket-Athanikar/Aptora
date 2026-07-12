#!/usr/bin/env python3
"""
ExamForge AI — Database Seeder
Seeds the database with sample data for development.
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.db.session import SessionLocal
from app.models.user import UserDb, UserProfileDb


def seed():
    db = SessionLocal()
    try:
        # Check if data already exists
        existing = db.query(UserDb).first()
        if existing:
            print("⚠️  Database already has data. Skipping seed.")
            return

        # Create sample user
        user = UserDb(
            name="Demo User",
            email="demo@examforge.ai",
            password="demo123456"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create profile
        profile = UserProfileDb(
            user_id=user.id,
            gender="male",
            location="Mumbai, India",
            education="B.Tech Computer Science",
            target_exam="GATE",
            xp=1250,
            coins=340,
            level=5,
            streak=12,
            accuracy=78.5,
            questions_solved=456,
            study_hours_total=128.5,
        )
        db.add(profile)
        db.commit()

        print(f"✅ Seeded user: {user.email}")
        print(f"✅ Seeded profile for user ID: {user.id}")

    except Exception as e:
        print(f"❌ Seed failed: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
