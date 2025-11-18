"""
Message ORM Model

SQLAlchemy модель для сообщений в беседах.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, Index, func, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.infrastructure.database import Base


class MessageModel(Base):
    """
    ORM модель для таблицы messages.

    Хранит сообщения в беседах (от пользователя и ассистента).
    """

    __tablename__ = "messages"

    # Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        index=True,
        comment="UUID сообщения",
    )

    # Foreign Key to conversations
    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="ID беседы",
    )

    # Message Metadata
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
        comment="Роль отправителя (user, assistant, system)",
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Текст сообщения",
    )

    # Token Usage (только для assistant messages)
    token_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Количество токенов в ответе (для assistant)",
    )

    # RAG References (для ассистента - какие документы использовались)
    referenced_documents: Mapped[List[str]] = mapped_column(
        ARRAY(String(36)),
        nullable=False,
        default=list,
        server_default="{}",
        comment="ID документов использованных для ответа",
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="Дата создания",
    )

    # Relationships
    conversation: Mapped["ConversationModel"] = relationship(
        "ConversationModel",
        back_populates="messages",
    )

    # Indexes для оптимизации запросов
    __table_args__ = (
        # Быстрый доступ к сообщениям беседы
        Index(
            "idx_messages_conversation_created",
            "conversation_id",
            "created_at",
        ),
        # Фильтр по роли
        Index(
            "idx_messages_conversation_role",
            "conversation_id",
            "role",
        ),
        {"comment": "Сообщения в беседах с AI ассистентом"},
    )

    def __repr__(self) -> str:
        """Строковое представление для отладки"""
        return f"<MessageModel(id={self.id}, conversation_id={self.conversation_id}, role={self.role})>"
