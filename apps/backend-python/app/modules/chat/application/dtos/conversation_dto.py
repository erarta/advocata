"""
Message DTO

Data Transfer Object для сообщения.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from app.modules.chat.domain.entities.message import Message


@dataclass
class MessageDTO:
    """
    DTO для сообщения в беседе.

    Используется для передачи данных сообщения между слоями.
    """

    id: str
    conversation_id: str
    role: str
    role_display: str
    content: str
    token_count: Optional[int]
    referenced_documents: list[str]
    metadata: dict
    created_at: datetime

    @classmethod
    def from_entity(cls, message: Message) -> "MessageDTO":
        """
        Создает DTO из доменной сущности.

        Args:
            message: Доменная сущность Message

        Returns:
            MessageDTO с данными из сущности
        """
        return cls(
            id=str(message.id),
            conversation_id=str(message.conversation_id),
            role=message.role.value.value,
            role_display=message.role.display_name,
            content=message.content,
            token_count=message.token_count,
            referenced_documents=message.referenced_documents,
            metadata=message.metadata,
            created_at=message.created_at,
        )


@dataclass
class ConversationDTO:
    """
    DTO для беседы с полной информацией.

    Используется для передачи данных беседы с сообщениями.
    """

    id: str
    user_id: str
    title: Optional[str]
    status: str
    status_display: str
    messages: list[MessageDTO]
    messages_count: int
    total_tokens: int
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime]

    @classmethod
    def from_entity(cls, conversation) -> "ConversationDTO":
        """
        Создает DTO из доменной сущности.

        Args:
            conversation: Доменная сущность Conversation

        Returns:
            ConversationDTO с данными из сущности
        """
        return cls(
            id=str(conversation.id),
            user_id=str(conversation.user_id),
            title=conversation.title,
            status=conversation.status.value.value,
            status_display=conversation.status.display_name,
            messages=[MessageDTO.from_entity(msg) for msg in conversation.messages],
            messages_count=conversation.messages_count,
            total_tokens=conversation.total_tokens,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            last_message_at=conversation.last_message_at,
        )


@dataclass
class ConversationListItemDTO:
    """
    DTO для краткой информации о беседе (для списков).

    Используется для отображения списка бесед без полной истории сообщений.
    """

    id: str
    user_id: str
    title: Optional[str]
    status: str
    status_display: str
    messages_count: int
    total_tokens: int
    last_message_preview: Optional[str]
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime]

    @classmethod
    def from_entity(cls, conversation) -> "ConversationListItemDTO":
        """
        Создает краткий DTO из доменной сущности.

        Args:
            conversation: Доменная сущность Conversation

        Returns:
            ConversationListItemDTO с краткими данными
        """
        # Получаем превью последнего сообщения
        last_message_preview = None
        if conversation.last_message:
            content = conversation.last_message.content
            last_message_preview = content[:100] + "..." if len(content) > 100 else content

        return cls(
            id=str(conversation.id),
            user_id=str(conversation.user_id),
            title=conversation.title,
            status=conversation.status.value.value,
            status_display=conversation.status.display_name,
            messages_count=conversation.messages_count,
            total_tokens=conversation.total_tokens,
            last_message_preview=last_message_preview,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            last_message_at=conversation.last_message_at,
        )


@dataclass
class ConversationSearchResultDTO:
    """
    DTO для результатов поиска бесед с пагинацией.
    """

    items: list[ConversationListItemDTO]
    total: int
    limit: int
    offset: int

    @property
    def has_more(self) -> bool:
        """Проверяет, есть ли еще результаты"""
        return self.offset + self.limit < self.total

    @property
    def page(self) -> int:
        """Возвращает номер текущей страницы (начиная с 1)"""
        return (self.offset // self.limit) + 1 if self.limit > 0 else 1

    @property
    def total_pages(self) -> int:
        """Возвращает общее количество страниц"""
        return (self.total + self.limit - 1) // self.limit if self.limit > 0 else 1
