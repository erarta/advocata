"""create_lawyers_table

Revision ID: 002
Revises: 001
Create Date: 2024-11-14 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Создание таблицы lawyers для модуля Lawyer.

    Содержит:
    - Идентификаторы (id, user_id)
    - Специализации и опыт
    - Цена и рейтинг
    - Credentials (license, education)
    - Профиль (about, location, languages)
    - Верификация и статус
    - Timestamps
    """
    op.create_table(
        'lawyers',
        # Primary Key
        sa.Column('id', sa.String(length=36), nullable=False, comment='UUID юриста'),

        # Foreign Key to users table
        sa.Column(
            'user_id',
            sa.String(length=36),
            nullable=False,
            comment='ID пользователя из Identity Module',
        ),

        # Specializations (ARRAY of strings)
        sa.Column(
            'specializations',
            postgresql.ARRAY(sa.String(length=100)),
            nullable=False,
            comment='Список специализаций (русские названия)',
        ),

        # Experience
        sa.Column(
            'experience_years',
            sa.Integer(),
            nullable=False,
            comment='Опыт работы в годах',
        ),

        # Price
        sa.Column(
            'price_amount',
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            comment='Цена за консультацию (рубли)',
        ),

        # Verification
        sa.Column(
            'verification_status',
            sa.String(length=20),
            nullable=False,
            server_default='pending',
            comment='Статус верификации',
        ),

        # Rating
        sa.Column(
            'rating',
            sa.Numeric(precision=2, scale=1),
            nullable=True,
            comment='Средний рейтинг (1.0-5.0)',
        ),

        sa.Column(
            'reviews_count',
            sa.Integer(),
            nullable=False,
            server_default='0',
            comment='Количество отзывов',
        ),

        sa.Column(
            'consultations_count',
            sa.Integer(),
            nullable=False,
            server_default='0',
            comment='Количество проведенных консультаций',
        ),

        # Credentials
        sa.Column(
            'license_number',
            sa.String(length=50),
            nullable=False,
            comment='Номер лицензии/свидетельства',
        ),

        sa.Column(
            'education',
            sa.String(length=500),
            nullable=False,
            comment='Образование (ВУЗ, факультет)',
        ),

        # Profile
        sa.Column(
            'about',
            sa.Text(),
            nullable=False,
            comment='Описание юриста',
        ),

        sa.Column(
            'location',
            sa.String(length=100),
            nullable=False,
            comment='Город/регион',
        ),

        # Availability
        sa.Column(
            'is_available',
            sa.Boolean(),
            nullable=False,
            server_default='false',
            comment='Доступен ли для консультаций',
        ),

        # Languages (ARRAY of strings)
        sa.Column(
            'languages',
            postgresql.ARRAY(sa.String(length=50)),
            nullable=False,
            server_default='{}',
            comment='Языки',
        ),

        # Timestamps
        sa.Column(
            'verified_at',
            sa.DateTime(timezone=True),
            nullable=True,
            comment='Дата верификации',
        ),

        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text('now()'),
            comment='Дата создания',
        ),

        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text('now()'),
            comment='Дата обновления',
        ),

        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='uq_lawyers_user_id'),
    )

    # Индексы для оптимизации запросов
    op.create_index('ix_lawyers_id', 'lawyers', ['id'], unique=False)
    op.create_index('ix_lawyers_user_id', 'lawyers', ['user_id'], unique=True)
    op.create_index('ix_lawyers_verification_status', 'lawyers', ['verification_status'], unique=False)
    op.create_index('ix_lawyers_location', 'lawyers', ['location'], unique=False)
    op.create_index('ix_lawyers_is_available', 'lawyers', ['is_available'], unique=False)
    op.create_index('ix_lawyers_rating', 'lawyers', ['rating'], unique=False)
    op.create_index('ix_lawyers_experience_years', 'lawyers', ['experience_years'], unique=False)
    op.create_index('ix_lawyers_price_amount', 'lawyers', ['price_amount'], unique=False)

    # Composite indexes для оптимизации поиска
    op.create_index(
        'idx_lawyers_status_available',
        'lawyers',
        ['verification_status', 'is_available'],
        unique=False,
    )

    op.create_index(
        'idx_lawyers_location_status',
        'lawyers',
        ['location', 'verification_status'],
        unique=False,
    )

    # Для сортировки по рейтингу (DESC)
    op.create_index(
        'idx_lawyers_rating_desc',
        'lawyers',
        [sa.text('rating DESC')],
        unique=False,
    )


def downgrade() -> None:
    """
    Откат миграции - удаление таблицы lawyers.
    """
    op.drop_index('idx_lawyers_rating_desc', table_name='lawyers')
    op.drop_index('idx_lawyers_location_status', table_name='lawyers')
    op.drop_index('idx_lawyers_status_available', table_name='lawyers')
    op.drop_index('ix_lawyers_price_amount', table_name='lawyers')
    op.drop_index('ix_lawyers_experience_years', table_name='lawyers')
    op.drop_index('ix_lawyers_rating', table_name='lawyers')
    op.drop_index('ix_lawyers_is_available', table_name='lawyers')
    op.drop_index('ix_lawyers_location', table_name='lawyers')
    op.drop_index('ix_lawyers_verification_status', table_name='lawyers')
    op.drop_index('ix_lawyers_user_id', table_name='lawyers')
    op.drop_index('ix_lawyers_id', table_name='lawyers')
    op.drop_table('lawyers')
