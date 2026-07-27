"""
convert resource type to enum

Revision ID: 8d2693067dbc
Revises: c1aaaf3b1f29
Create Date: 2026-07-24 11:21:17.464321

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8d2693067dbc"
down_revision: Union[str, Sequence[str], None] = "c1aaaf3b1f29"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# PostgreSQL enum definition
RESOURCE_TYPE_ENUM = sa.Enum(
    "book",
    "notes",
    "pyq",
    "syllabus",
    name="resourcetype",
)


def upgrade() -> None:
    """
    Upgrade database schema.
    """

    bind = op.get_bind()


    # ---------------------------------------
    # Add processed_at column
    # ---------------------------------------

    inspector = sa.inspect(bind)

    columns = [
        column["name"]
        for column in inspector.get_columns("resources")
    ]

    if "processed_at" not in columns:
        op.add_column(
            "resources",
            sa.Column(
                "processed_at",
                sa.DateTime(),
                nullable=True,
            ),
        )


    # ---------------------------------------
    # Create PostgreSQL ENUM
    # ---------------------------------------

    RESOURCE_TYPE_ENUM.create(
        bind,
        checkfirst=True,
    )


    # ---------------------------------------
    # Convert resource_type column
    # ---------------------------------------

    op.execute(
        """
        ALTER TABLE resources
        ALTER COLUMN resource_type
        TYPE resourcetype
        USING LOWER(resource_type)::resourcetype
        """
    )


    # ---------------------------------------
    # Add indexes
    # ---------------------------------------

    indexes = [
        index["name"]
        for index in inspector.get_indexes("resources")
    ]


    if "ix_resources_resource_type" not in indexes:
        op.create_index(
            "ix_resources_resource_type",
            "resources",
            ["resource_type"],
            unique=False,
        )


    if "ix_resources_status" not in indexes:
        op.create_index(
            "ix_resources_status",
            "resources",
            ["status"],
            unique=False,
        )



def downgrade() -> None:
    """
    Downgrade database schema.
    """

    bind = op.get_bind()


    inspector = sa.inspect(bind)

    indexes = [
        index["name"]
        for index in inspector.get_indexes("resources")
    ]


    # Remove indexes

    if "ix_resources_status" in indexes:
        op.drop_index(
            "ix_resources_status",
            table_name="resources",
        )


    if "ix_resources_resource_type" in indexes:
        op.drop_index(
            "ix_resources_resource_type",
            table_name="resources",
        )


    # Convert enum back to varchar

    op.execute(
        """
        ALTER TABLE resources
        ALTER COLUMN resource_type
        TYPE VARCHAR(30)
        USING resource_type::text
        """
    )


    # Drop enum

    RESOURCE_TYPE_ENUM.drop(
        bind,
        checkfirst=True,
    )


    # Remove processed_at

    columns = [
        column["name"]
        for column in inspector.get_columns("resources")
    ]

    if "processed_at" in columns:
        op.drop_column(
            "resources",
            "processed_at",
        )