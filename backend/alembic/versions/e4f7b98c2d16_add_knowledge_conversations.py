"""add persistent knowledge conversations

Revision ID: e4f7b98c2d16
Revises: 8d2693067dbc
"""

from alembic import op
import sqlalchemy as sa

revision = "e4f7b98c2d16"
down_revision = "8d2693067dbc"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "knowledge_conversations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("subject_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("last_message_at", sa.DateTime(), nullable=True),
        sa.Column("pinned", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["workspace_id"], ["goal_workspaces.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["subject_id"], ["workspace_subjects.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_knowledge_conversations_user_id", "knowledge_conversations", ["user_id"])
    op.create_index("ix_knowledge_conversations_workspace_id", "knowledge_conversations", ["workspace_id"])
    op.create_index("ix_knowledge_conversations_subject_id", "knowledge_conversations", ["subject_id"])
    op.create_index("ix_knowledge_conversations_last_message_at", "knowledge_conversations", ["last_message_at"])
    op.create_index("ix_knowledge_conversations_pinned", "knowledge_conversations", ["pinned"])
    op.create_table(
        "knowledge_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("sources", sa.JSON(), nullable=True),
        sa.Column("confidence", sa.String(length=20), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["knowledge_conversations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_knowledge_messages_id", "knowledge_messages", ["id"])
    op.create_index("ix_knowledge_messages_conversation_id", "knowledge_messages", ["conversation_id"])
    op.create_index("ix_knowledge_messages_created_at", "knowledge_messages", ["created_at"])


def downgrade() -> None:
    op.drop_table("knowledge_messages")
    op.drop_table("knowledge_conversations")
