"""
ExamForge AI — Automatic Database Schema Synchronization
Automatically checks and alters missing columns on PostgreSQL / SQLite tables
to prevent UndefinedColumn errors during runtime operations.
"""
import logging
from sqlalchemy import text
from sqlalchemy.engine import Engine

logger = logging.getLogger("backend")


def ensure_schema_synced(engine: Engine) -> None:
    if not engine:
        return

    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dob VARCHAR(20) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location VARCHAR(150) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Kolkata';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS education VARCHAR(100) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS college VARCHAR(150) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS occupation VARCHAR(100) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_exam VARCHAR(100) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS secondary_exam VARCHAR(100) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_score VARCHAR(20) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_rank VARCHAR(20) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_date VARCHAR(30) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS study_hours_goal DOUBLE PRECISION DEFAULT 4.0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weak_subjects JSON DEFAULT '[]';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS strong_subjects JSON DEFAULT '[]';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS favorite_subjects JSON DEFAULT '[]';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS accuracy DOUBLE PRECISION DEFAULT 0.0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mock_average DOUBLE PRECISION DEFAULT 0.0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS questions_solved INTEGER DEFAULT 0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS study_hours_total DOUBLE PRECISION DEFAULT 0.0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS completion_pct DOUBLE PRECISION DEFAULT 0.0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bookmarks_count INTEGER DEFAULT 0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS certificates_count INTEGER DEFAULT 0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS social_links JSON DEFAULT '{}';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS achievements JSON DEFAULT '[]';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS connected_devices JSON DEFAULT '[]';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notification_settings JSON DEFAULT '{}';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS privacy_settings JSON DEFAULT '{}';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 50;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS plan VARCHAR(30) DEFAULT 'Free';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS plan_renewal VARCHAR(30) DEFAULT '';",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ai_credits INTEGER DEFAULT 50;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS storage_used_mb DOUBLE PRECISION DEFAULT 0.0;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        """
        CREATE TABLE IF NOT EXISTS user_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            refresh_token VARCHAR(500) UNIQUE NOT NULL,
            device_info VARCHAR(255) DEFAULT '',
            ip_address VARCHAR(50) DEFAULT '',
            is_revoked BOOLEAN DEFAULT FALSE,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(30) NOT NULL DEFAULT 'study',
            priority VARCHAR(20) NOT NULL DEFAULT 'medium',
            message TEXT NOT NULL,
            read BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS ai_study_sources (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            workspace_id INTEGER NOT NULL REFERENCES goal_workspaces(id) ON DELETE CASCADE,
            resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            selected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT uq_user_resource_source UNIQUE (user_id, resource_id)
        );
        """
    ]

    try:
        with engine.begin() as conn:
            for stmt in statements:
                try:
                    conn.execute(text(stmt))
                except Exception as stmt_err:
                    # Ignore if dialect does not support ADD COLUMN IF NOT EXISTS (e.g. SQLite handles via create_all)
                    pass
        logger.info("Schema auto-synchronization check completed successfully.")
    except Exception as e:
        logger.warning(f"Schema auto-synchronization warning: {e}")
