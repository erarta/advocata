"""create_documents_table

Revision ID: 003_create_documents_table
Revises: 002_create_lawyers_table
Create Date: 2024-11-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '003_create_documents_table'
down_revision: Union[str, None] = '002_create_lawyers_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Создает таблицу documents для хранения юридических документов.

    Включает:
    - Основные поля документа (type, category, title, description)
    - Метаданные файла (size, mime_type, filename, storage_path)
    - Статус обработки (uploaded, processing, processed, failed, etc.)
    - Извлеченный текст для RAG
    - Теги для поиска
    - Связь с консультациями
    - Timestamps
    - Индексы для оптимизации запросов
    """
    op.create_table(
        'documents',
        # Primary Key
        sa.Column('id', sa.String(36), nullable=False),

        # Ownership
        sa.Column('owner_id', sa.String(36), nullable=False),

        # Document Metadata
        sa.Column('document_type', sa.String(50), nullable=False),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),

        # File Metadata
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('file_extension', sa.String(20), nullable=False),
        sa.Column('storage_path', sa.String(500), nullable=False),

        # Status
        sa.Column('status', sa.String(20), nullable=False, server_default='uploaded'),

        # Relations
        sa.Column('consultation_id', sa.String(36), nullable=True),

        # Processing
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('processing_error', sa.String(500), nullable=True),

        # Tags (PostgreSQL ARRAY)
        sa.Column('tags', postgresql.ARRAY(sa.String(50)), nullable=False, server_default='{}'),

        # Timestamps
        sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),

        # Constraints
        sa.PrimaryKeyConstraint('id', name='pk_documents'),
        sa.UniqueConstraint('storage_path', name='uq_documents_storage_path'),
    )

    # Indexes
    # Основные индексы
    op.create_index('ix_documents_id', 'documents', ['id'])
    op.create_index('ix_documents_owner_id', 'documents', ['owner_id'])
    op.create_index('ix_documents_document_type', 'documents', ['document_type'])
    op.create_index('ix_documents_category', 'documents', ['category'])
    op.create_index('ix_documents_status', 'documents', ['status'])
    op.create_index('ix_documents_consultation_id', 'documents', ['consultation_id'])
    op.create_index('ix_documents_uploaded_at', 'documents', ['uploaded_at'])
    op.create_index('ix_documents_created_at', 'documents', ['created_at'])

    # Композитные индексы для оптимизации поиска
    op.create_index(
        'idx_documents_owner_status',
        'documents',
        ['owner_id', 'status'],
    )
    op.create_index(
        'idx_documents_owner_created',
        'documents',
        ['owner_id', 'created_at'],
    )
    op.create_index(
        'idx_documents_type_category',
        'documents',
        ['document_type', 'category'],
    )

    # Full-text search index на title и description
    op.create_index(
        'idx_documents_title_description',
        'documents',
        [sa.text('lower(title)'), sa.text('lower(description)')],
        postgresql_using='gin',
        postgresql_ops={'title': 'gin_trgm_ops', 'description': 'gin_trgm_ops'},
    )


def downgrade() -> None:
    """
    Удаляет таблицу documents и все связанные индексы.
    """
    # Удаляем индексы
    op.drop_index('idx_documents_title_description', table_name='documents')
    op.drop_index('idx_documents_type_category', table_name='documents')
    op.drop_index('idx_documents_owner_created', table_name='documents')
    op.drop_index('idx_documents_owner_status', table_name='documents')
    op.drop_index('ix_documents_created_at', table_name='documents')
    op.drop_index('ix_documents_uploaded_at', table_name='documents')
    op.drop_index('ix_documents_consultation_id', table_name='documents')
    op.drop_index('ix_documents_status', table_name='documents')
    op.drop_index('ix_documents_category', table_name='documents')
    op.drop_index('ix_documents_document_type', table_name='documents')
    op.drop_index('ix_documents_owner_id', table_name='documents')
    op.drop_index('ix_documents_id', table_name='documents')

    # Удаляем таблицу
    op.drop_table('documents')
