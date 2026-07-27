"""add rag resource tables

Revision ID: c1aaaf3b1f29
Revises: c3d0ac5ca41e
Create Date: 2026-07-22 20:50:03.677550

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c1aaaf3b1f29"
down_revision: Union[str, Sequence[str], None] = "c3d0ac5ca41e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "workspace_subjects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("icon", sa.String(length=50), nullable=True),
        sa.Column("color", sa.String(length=20), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["goal_workspaces.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_workspace_subjects_id",
        "workspace_subjects",
        ["id"],
    )

    op.create_index(
        "ix_workspace_subjects_workspace_id",
        "workspace_subjects",
        ["workspace_id"],
    )


    op.create_table(
        "resources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workspace_id", sa.Integer(), nullable=False),
        sa.Column("subject_id", sa.Integer(), nullable=False),
        sa.Column("resource_type", sa.String(length=30), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("total_pages", sa.Integer(), nullable=True),
        sa.Column("language", sa.String(length=50), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["workspace_id"],
            ["goal_workspaces.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["subject_id"],
            ["workspace_subjects.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_resources_id",
        "resources",
        ["id"],
    )

    op.create_index(
        "ix_resources_workspace_id",
        "resources",
        ["workspace_id"],
    )

    op.create_index(
        "ix_resources_subject_id",
        "resources",
        ["subject_id"],
    )


    op.create_table(
        "resource_chunks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("resource_id", sa.Integer(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("subject", sa.String(length=255), nullable=True),
        sa.Column("chapter", sa.String(length=255), nullable=True),
        sa.Column("topic", sa.String(length=255), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("token_count", sa.Integer(), nullable=True),
        sa.Column("chunk_metadata", sa.JSON(), nullable=True),
        sa.Column(
            "embedding_generated",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("qdrant_point_id", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["resource_id"],
            ["resources.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("qdrant_point_id"),
    )

    op.create_index(
        "ix_resource_chunks_id",
        "resource_chunks",
        ["id"],
    )

    op.create_index(
        "ix_resource_chunks_resource_id",
        "resource_chunks",
        ["resource_id"],
    )


    op.create_table(
        "resource_contents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("resource_id", sa.Integer(), nullable=False),
        sa.Column("raw_text", sa.Text(), nullable=False),
        sa.Column("cleaned_text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["resource_id"],
            ["resources.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_resource_contents_id",
        "resource_contents",
        ["id"],
    )

    op.create_index(
        "ix_resource_contents_resource_id",
        "resource_contents",
        ["resource_id"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_resource_contents_resource_id",
        table_name="resource_contents",
    )

    op.drop_index(
        "ix_resource_contents_id",
        table_name="resource_contents",
    )

    op.drop_table("resource_contents")


    op.drop_index(
        "ix_resource_chunks_resource_id",
        table_name="resource_chunks",
    )

    op.drop_index(
        "ix_resource_chunks_id",
        table_name="resource_chunks",
    )

    op.drop_table("resource_chunks")


    op.drop_index(
        "ix_resources_workspace_id",
        table_name="resources",
    )

    op.drop_index(
        "ix_resources_subject_id",
        table_name="resources",
    )

    op.drop_index(
        "ix_resources_id",
        table_name="resources",
    )

    op.drop_table("resources")


    op.drop_index(
        "ix_workspace_subjects_workspace_id",
        table_name="workspace_subjects",
    )

    op.drop_index(
        "ix_workspace_subjects_id",
        table_name="workspace_subjects",
    )

    op.drop_table("workspace_subjects")