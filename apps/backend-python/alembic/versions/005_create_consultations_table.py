"""create_consultations_table

Revision ID: 005
Revises: 004
Create Date: 2024-11-15 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Создание таблицы consultations для модуля Consultation.

    Содержит:
    - Идентификаторы (id, client_id, lawyer_id)
    - Статус и тип консультации
    - Описание и цена
    - Временные слоты (scheduled_start, duration, actual_start, actual_end)
    - Рейтинг и отзыв
    - Информация об отмене
    - Timestamps
    """
    # Создаем ENUM типы для статуса и типа консультации
    consultation_status_enum = postgresql.ENUM(
        'pending',
        'confirmed',
        'active',
        'completed',
        'cancelled',
        'failed',
        'expired',
        name='consultation_status_enum',
        create_type=True,
    )
    consultation_status_enum.create(op.get_bind(), checkfirst=True)

    consultation_type_enum = postgresql.ENUM(
        'emergency',
        'scheduled',
        name='consultation_type_enum',
        create_type=True,
    )
    consultation_type_enum.create(op.get_bind(), checkfirst=True)

    # Создаем таблицу consultations
    op.create_table(
        'consultations',
        # Primary Key
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            nullable=False,
            comment='UUID консультации',
        ),
        # Participants
        sa.Column(
            'client_id',
            postgresql.UUID(as_uuid=True),
            nullable=False,
            comment='ID клиента',
        ),
        sa.Column(
            'lawyer_id',
            postgresql.UUID(as_uuid=True),
            nullable=False,
            comment='ID юриста',
        ),
        # Status and Type
        sa.Column(
            'status',
            consultation_status_enum,
            nullable=False,
            server_default='pending',
            comment='Статус консультации',
        ),
        sa.Column(
            'consultation_type',
            consultation_type_enum,
            nullable=False,
            comment='Тип консультации (emergency/scheduled)',
        ),
        # Content
        sa.Column(
            'description',
            sa.Text(),
            nullable=False,
            comment='Описание проблемы от клиента',
        ),
        # Price
        sa.Column(
            'price_amount',
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            comment='Цена консультации',
        ),
        sa.Column(
            'price_currency',
            sa.String(length=3),
            nullable=False,
            server_default='RUB',
            comment='Валюта (RUB, USD, EUR)',
        ),
        # Scheduled Time (for scheduled consultations)
        sa.Column(
            'scheduled_start',
            sa.DateTime(timezone=True),
            nullable=True,
            comment='Запланированное время начала (для scheduled)',
        ),
        sa.Column(
            'duration_minutes',
            sa.Integer(),
            nullable=True,
            comment='Длительность в минутах (для scheduled)',
        ),
        # Actual Time (for tracking)
        sa.Column(
            'actual_start',
            sa.DateTime(timezone=True),
            nullable=True,
            comment='Фактическое время начала',
        ),
        sa.Column(
            'actual_end',
            sa.DateTime(timezone=True),
            nullable=True,
            comment='Фактическое время окончания',
        ),
        # Rating (after completion)
        sa.Column(
            'rating',
            sa.Integer(),
            nullable=True,
            comment='Оценка клиента (1-5)',
        ),
        sa.Column(
            'review',
            sa.Text(),
            nullable=True,
            comment='Текстовый отзыв клиента',
        ),
        # Cancellation
        sa.Column(
            'cancellation_reason',
            sa.Text(),
            nullable=True,
            comment='Причина отмены',
        ),
        sa.Column(
            'cancelled_by',
            sa.String(length=20),
            nullable=True,
            comment='Кто отменил (client/lawyer)',
        ),
        sa.Column(
            'cancelled_at',
            sa.DateTime(timezone=True),
            nullable=True,
            comment='Время отмены',
        ),
        # Timestamps
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
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
        sa.CheckConstraint('duration_minutes >= 15 AND duration_minutes <= 180', name='check_duration_range'),
    )

    # Индексы для оптимизации запросов
    op.create_index('ix_consultations_id', 'consultations', ['id'], unique=False)
    op.create_index('ix_consultations_client_id', 'consultations', ['client_id'], unique=False)
    op.create_index('ix_consultations_lawyer_id', 'consultations', ['lawyer_id'], unique=False)
    op.create_index('ix_consultations_status', 'consultations', ['status'], unique=False)
    op.create_index('ix_consultations_consultation_type', 'consultations', ['consultation_type'], unique=False)
    op.create_index('ix_consultations_scheduled_start', 'consultations', ['scheduled_start'], unique=False)

    # Composite indexes для оптимизации поиска
    op.create_index(
        'ix_consultations_client_status',
        'consultations',
        ['client_id', 'status'],
        unique=False,
    )

    op.create_index(
        'ix_consultations_lawyer_status',
        'consultations',
        ['lawyer_id', 'status'],
        unique=False,
    )

    op.create_index(
        'ix_consultations_lawyer_scheduled',
        'consultations',
        ['lawyer_id', 'scheduled_start'],
        unique=False,
    )

    # Для поиска активных консультаций юриста
    op.create_index(
        'idx_consultations_lawyer_active',
        'consultations',
        ['lawyer_id', 'status'],
        unique=False,
        postgresql_where=sa.text("status = 'active'"),
    )

    # Для сортировки по дате создания (DESC)
    op.create_index(
        'idx_consultations_created_at_desc',
        'consultations',
        [sa.text('created_at DESC')],
        unique=False,
    )


def downgrade() -> None:
    """
    Откат миграции - удаление таблицы consultations и ENUM типов.
    """
    # Удаляем индексы
    op.drop_index('idx_consultations_created_at_desc', table_name='consultations')
    op.drop_index('idx_consultations_lawyer_active', table_name='consultations')
    op.drop_index('ix_consultations_lawyer_scheduled', table_name='consultations')
    op.drop_index('ix_consultations_lawyer_status', table_name='consultations')
    op.drop_index('ix_consultations_client_status', table_name='consultations')
    op.drop_index('ix_consultations_scheduled_start', table_name='consultations')
    op.drop_index('ix_consultations_consultation_type', table_name='consultations')
    op.drop_index('ix_consultations_status', table_name='consultations')
    op.drop_index('ix_consultations_lawyer_id', table_name='consultations')
    op.drop_index('ix_consultations_client_id', table_name='consultations')
    op.drop_index('ix_consultations_id', table_name='consultations')

    # Удаляем таблицу
    op.drop_table('consultations')

    # Удаляем ENUM типы
    consultation_type_enum = postgresql.ENUM(
        'emergency',
        'scheduled',
        name='consultation_type_enum',
    )
    consultation_type_enum.drop(op.get_bind(), checkfirst=True)

    consultation_status_enum = postgresql.ENUM(
        'pending',
        'confirmed',
        'active',
        'completed',
        'cancelled',
        'failed',
        'expired',
        name='consultation_status_enum',
    )
    consultation_status_enum.drop(op.get_bind(), checkfirst=True)
