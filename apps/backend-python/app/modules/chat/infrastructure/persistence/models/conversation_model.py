"""
Conversation ORM Model

SQLAlchemy модель для бесед.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, Integer, Text, DateTime, Index, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.infrastructure.database import Base


class ConversationModel(Base):
    """
    ORM модель для таблицы conversations.

    Хранит информацию о беседах пользователей с AI ассистентом.
    """

    __tablename__ = "conversations"

    # Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        index=True,
        comment="UUID беседы",
    )

    # Ownership
    user_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
        index=True,
        comment="ID пользователя",
    )

    # Conversation Metadata
    title: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        comment="Название беседы",
    )

    # Status
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        index=True,
        comment="Статус беседы (active, archived, deleted)",
    )

    # Token Usage
    total_tokens: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Общее количество токенов использовано",
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
        comment="Дата создания",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Дата обновления",
    )

    last_message_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
        comment="Дата последнего сообщения",
    )

    # Relationships
    messages: Mapped[List["MessageModel"]] = relationship(
        "MessageModel",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="MessageModel.created_at",
        lazy="selectin",  # Eager loading для сообщений
    )

    # Composite Indexes для оптимизации запросов
    __table_args__ = (
        # Поиск бесед пользователя по статусу
        Index(
            "idx_conversations_user_status",
            "user_id",
            "status",
        ),
        # Сортировка по последнему сообщению
        Index(
            "idx_conversations_last_message",
            "user_id",
            "last_message_at",
        ),
        # Поиск активных бесед
        Index(
            "idx_conversations_user_active",
            "user_id",
            "status",
            "last_message_at",
        ),
        {"comment": "Беседы пользователей с AI ассистентом"},
    )

    def __repr__(self) -> str:
        """Строковое представление для отладки"""
        return f"<ConversationModel(id={self.id}, user_id={self.user_id}, status={self.status})>"
