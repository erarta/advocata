"""create_chat_tables

Revision ID: 004_create_chat_tables
Revises: 003_create_documents_table
Create Date: 2024-11-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '004_create_chat_tables'
down_revision: Union[str, None] = '003_create_documents_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Создает таблицы для Chat Module с AI ассистентом.

    Включает:
    - pgvector extension для RAG (semantic search)
    - Таблицу conversations (беседы пользователей)
    - Таблицу messages (сообщения в беседах)
    - Индексы для оптимизации запросов
    - Foreign keys с cascade delete
    """

    # 1. Создаем pgvector extension (если еще не создан)
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')

    # 2. Создаем таблицу conversations
    op.create_table(
        'conversations',
        # Primary Key
        sa.Column('id', sa.String(36), nullable=False),

        # Ownership
        sa.Column('user_id', sa.String(36), nullable=False),

        # Conversation Metadata
        sa.Column('title', sa.String(200), nullable=True),

        # Status
        sa.Column('status', sa.String(20), nullable=False, server_default='active'),

        # Token Usage
        sa.Column('total_tokens', sa.Integer(), nullable=False, server_default='0'),

        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('last_message_at', sa.DateTime(timezone=True), nullable=True),

        # Constraints
        sa.PrimaryKeyConstraint('id', name='pk_conversations'),
    )

    # Индексы для conversations
    op.create_index('ix_conversations_id', 'conversations', ['id'])
    op.create_index('ix_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('ix_conversations_status', 'conversations', ['status'])
    op.create_index('ix_conversations_created_at', 'conversations', ['created_at'])
    op.create_index('ix_conversations_last_message_at', 'conversations', ['last_message_at'])

    # Композитные индексы для оптимизации поиска
    op.create_index(
        'idx_conversations_user_status',
        'conversations',
        ['user_id', 'status'],
    )
    op.create_index(
        'idx_conversations_user_last_message',
        'conversations',
        ['user_id', 'last_message_at'],
    )
    op.create_index(
        'idx_conversations_user_active',
        'conversations',
        ['user_id', 'status', 'last_message_at'],
    )

    # 3. Создаем таблицу messages
    op.create_table(
        'messages',
        # Primary Key
        sa.Column('id', sa.String(36), nullable=False),

        # Foreign Key to conversations
        sa.Column('conversation_id', sa.String(36), nullable=False),

        # Message Metadata
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),

        # Token Usage (для assistant messages)
        sa.Column('token_count', sa.Integer(), nullable=True),

        # RAG References (документы использованные для ответа)
        sa.Column(
            'referenced_documents',
            postgresql.ARRAY(sa.String(36)),
            nullable=False,
            server_default='{}',
        ),

        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),

        # Constraints
        sa.PrimaryKeyConstraint('id', name='pk_messages'),
        sa.ForeignKeyConstraint(
            ['conversation_id'],
            ['conversations.id'],
            name='fk_messages_conversation_id',
            ondelete='CASCADE',  # При удалении беседы удаляются все сообщения
        ),
    )

    # Индексы для messages
    op.create_index('ix_messages_id', 'messages', ['id'])
    op.create_index('ix_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('ix_messages_role', 'messages', ['role'])
    op.create_index('ix_messages_created_at', 'messages', ['created_at'])

    # Композитные индексы для оптимизации запросов
    op.create_index(
        'idx_messages_conversation_created',
        'messages',
        ['conversation_id', 'created_at'],
    )
    op.create_index(
        'idx_messages_conversation_role',
        'messages',
        ['conversation_id', 'role'],
    )


def downgrade() -> None:
    """
    Удаляет таблицы Chat Module и связанные индексы.

    Note: pgvector extension НЕ удаляется, т.к. может использоваться
    другими модулями (например, Document для embeddings).
    """

    # Удаляем индексы для messages
    op.drop_index('idx_messages_conversation_role', table_name='messages')
    op.drop_index('idx_messages_conversation_created', table_name='messages')
    op.drop_index('ix_messages_created_at', table_name='messages')
    op.drop_index('ix_messages_role', table_name='messages')
    op.drop_index('ix_messages_conversation_id', table_name='messages')
    op.drop_index('ix_messages_id', table_name='messages')

    # Удаляем таблицу messages
    op.drop_table('messages')

    # Удаляем индексы для conversations
    op.drop_index('idx_conversations_user_active', table_name='conversations')
    op.drop_index('idx_conversations_user_last_message', table_name='conversations')
    op.drop_index('idx_conversations_user_status', table_name='conversations')
    op.drop_index('ix_conversations_last_message_at', table_name='conversations')
    op.drop_index('ix_conversations_created_at', table_name='conversations')
    op.drop_index('ix_conversations_status', table_name='conversations')
    op.drop_index('ix_conversations_user_id', table_name='conversations')
    op.drop_index('ix_conversations_id', table_name='conversations')

    # Удаляем таблицу conversations
    op.drop_table('conversations')

    # Note: НЕ удаляем pgvector extension, т.к. может использоваться другими модулями
    # op.execute('DROP EXTENSION IF EXISTS vector')
