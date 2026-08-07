"""add is_active column to users, user_profiles extended fields, and add user_sessions table

Revision ID: f5a892b1c034
Revises: e4f7b98c2d16
"""

from alembic import op
import sqlalchemy as sa

revision = "f5a892b1c034"
down_revision = "e4f7b98c2d16"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # 1. users table is_active column
    user_cols = [col["name"] for col in inspector.get_columns("users")]
    if "is_active" not in user_cols:
        op.add_column("users", sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False))

    # 2. user_profiles table extended preference and gamification columns
    profile_cols = [col["name"] for col in inspector.get_columns("user_profiles")]
    expected_profile_cols = {
        "target_exam": sa.String(100),
        "secondary_exam": sa.String(100),
        "target_score": sa.String(20),
        "target_rank": sa.String(20),
        "target_date": sa.String(30),
        "study_hours_goal": sa.Float(),
        "weak_subjects": sa.JSON(),
        "strong_subjects": sa.JSON(),
        "favorite_subjects": sa.JSON(),
        "xp": sa.Integer(),
        "coins": sa.Integer(),
        "level": sa.Integer(),
        "streak": sa.Integer(),
        "accuracy": sa.Float(),
        "mock_average": sa.Float(),
        "questions_solved": sa.Integer(),
        "study_hours_total": sa.Float(),
        "completion_pct": sa.Float(),
        "bookmarks_count": sa.Integer(),
        "certificates_count": sa.Integer(),
        "social_links": sa.JSON(),
        "achievements": sa.JSON(),
        "connected_devices": sa.JSON(),
        "notification_settings": sa.JSON(),
        "privacy_settings": sa.JSON(),
        "security_score": sa.Integer(),
        "plan": sa.String(30),
        "plan_renewal": sa.String(30),
        "ai_credits": sa.Integer(),
        "storage_used_mb": sa.Float(),
    }
    
    for col_name, col_type in expected_profile_cols.items():
        if col_name not in profile_cols:
            op.add_column("user_profiles", sa.Column(col_name, col_type, nullable=True))

    # 3. user_sessions table
    tables = inspector.get_table_names()
    if "user_sessions" not in tables:
        op.create_table(
            "user_sessions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("refresh_token", sa.String(length=500), nullable=False),
            sa.Column("device_info", sa.String(length=255), server_default=""),
            sa.Column("ip_address", sa.String(length=50), server_default=""),
            sa.Column("is_revoked", sa.Boolean(), server_default="false"),
            sa.Column("expires_at", sa.DateTime(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("refresh_token")
        )
        op.create_index("ix_user_sessions_id", "user_sessions", ["id"])


def downgrade() -> None:
    op.drop_table("user_sessions")
    op.drop_column("users", "is_active")
