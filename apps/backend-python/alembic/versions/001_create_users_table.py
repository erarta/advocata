"""create_users_table

Revision ID: 001
Revises:
Create Date: 2024-11-14 14:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Создание таблицы users для модуля Identity.

    Содержит:
    - Идентификаторы (phone, email)
    - Профиль пользователя
    - Статусы верификации
    - OTP верификация
    - Timestamps
    """
    op.create_table(
        'users',
        # Primary Key
        sa.Column('id', sa.String(length=36), nullable=False),

        # Идентификаторы
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),

        # Профиль
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='CLIENT'),

        # Статусы
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('phone_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('email_verified', sa.Boolean(), nullable=False, server_default='false'),

        # OTP верификация
        sa.Column('otp_code', sa.String(length=6), nullable=True),
        sa.Column('otp_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('otp_attempts', sa.Integer(), nullable=False, server_default='0'),

        # Логирование
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),

        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),

        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('phone', name='uq_users_phone'),
        sa.UniqueConstraint('email', name='uq_users_email'),
    )

    # Индексы для оптимизации запросов
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('ix_users_phone', 'users', ['phone'], unique=False)
    op.create_index('ix_users_email', 'users', ['email'], unique=False)
    op.create_index('ix_users_role', 'users', ['role'], unique=False)
    op.create_index('ix_users_is_active', 'users', ['is_active'], unique=False)
    op.create_index('idx_users_role_active', 'users', ['role', 'is_active'], unique=False)
    op.create_index('idx_users_created_at', 'users', ['created_at'], unique=False)


def downgrade() -> None:
    """
    Откат миграции - удаление таблицы users.
    """
    op.drop_index('idx_users_created_at', table_name='users')
    op.drop_index('idx_users_role_active', table_name='users')
    op.drop_index('ix_users_is_active', table_name='users')
    op.drop_index('ix_users_role', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_phone', table_name='users')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_table('users')
