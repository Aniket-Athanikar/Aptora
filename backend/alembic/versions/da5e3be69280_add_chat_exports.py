"""add_chat_exports

Revision ID: da5e3be69280
Revises: 9826d9c6bc7a
Create Date: 2026-08-18 16:29:07.055525

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da5e3be69280'
down_revision: Union[str, Sequence[str], None] = '9826d9c6bc7a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'chat_exports',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('conversation_id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=True),
        sa.Column('storage_path', sa.String(length=500), nullable=True),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['knowledge_conversations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chat_exports_conversation_id'), 'chat_exports', ['conversation_id'], unique=False)
    op.create_index(op.f('ix_chat_exports_user_id'), 'chat_exports', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_chat_exports_user_id'), table_name='chat_exports')
    op.drop_index(op.f('ix_chat_exports_conversation_id'), table_name='chat_exports')
    op.drop_table('chat_exports')
