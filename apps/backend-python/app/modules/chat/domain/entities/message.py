"""
Message Entity

Сущность сообщения в беседе.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from app.shared.domain.entity import Entity
from app.shared.domain.result import Result
from app.modules.chat.domain.value_objects.message_role import MessageRole


class Message(Entity):
    """
    Сущность сообщения в беседе.

    Message является частью Conversation aggregate и представляет
    одно сообщение от пользователя или AI ассистента.

    Business Rules:
    1. Сообщение всегда принадлежит беседе
    2. Контент не может быть пустым
    3. Сообщение может ссылаться на документы (для RAG)
    4. Token count используется для отслеживания использования API
    """

    def __init__(
        self,
        id: UUID,
        conversation_id: UUID,
        role: MessageRole,
        content: str,
        token_count: Optional[int] = None,
        referenced_documents: Optional[list[str]] = None,
        metadata: Optional[dict] = None,
        created_at: Optional[datetime] = None,
    ):
        """
        Создает экземпляр сообщения.

        Args:
            id: Уникальный идентификатор сообщения
            conversation_id: ID беседы
            role: Роль отправителя (user/assistant/system)
            content: Текст сообщения
            token_count: Количество токенов (для AI сообщений)
            referenced_documents: ID документов, использованных для ответа
            metadata: Дополнительные метаданные
            created_at: Дата создания
        """
        super().__init__(id)
        self._conversation_id = conversation_id
        self._role = role
        self._content = content
        self._token_count = token_count
        self._referenced_documents = referenced_documents or []
        self._metadata = metadata or {}
        self._created_at = created_at or datetime.utcnow()

    @classmethod
    def create(
        cls,
        conversation_id: UUID,
        role: MessageRole,
        content: str,
        token_count: Optional[int] = None,
        referenced_documents: Optional[list[str]] = None,
        metadata: Optional[dict] = None,
    ) -> Result["Message"]:
        """
        Создает новое сообщение (фабричный метод).

        Args:
            conversation_id: ID беседы
            role: Роль отправителя
            content: Текст сообщения
            token_count: Количество токенов
            referenced_documents: ID документов для RAG
            metadata: Дополнительные метаданные

        Returns:
            Result с новым Message или ошибкой
        """
        # Валидация контента
        if not content or len(content.strip()) == 0:
            return Result.fail("Message content cannot be empty")

        if len(content) > 32000:  # ~8000 tokens для GPT-4
            return Result.fail(
                f"Message content too long: {len(content)} characters. "
                "Maximum: 32000 characters"
            )

        # Валидация token_count
        if token_count is not None and token_count < 0:
            return Result.fail("Token count cannot be negative")

        message = cls(
            id=uuid4(),
            conversation_id=conversation_id,
            role=role,
            content=content.strip(),
            token_count=token_count,
            referenced_documents=referenced_documents,
            metadata=metadata,
        )

        return Result.ok(message)

    @property
    def conversation_id(self) -> UUID:
        """ID беседы"""
        return self._conversation_id

    @property
    def role(self) -> MessageRole:
        """Роль отправителя"""
        return self._role

    @property
    def content(self) -> str:
        """Текст сообщения"""
        return self._content

    @property
    def token_count(self) -> Optional[int]:
        """Количество токенов"""
        return self._token_count

    @property
    def referenced_documents(self) -> list[str]:
        """ID документов, использованных для ответа"""
        return self._referenced_documents.copy()

    @property
    def metadata(self) -> dict:
        """Дополнительные метаданные"""
        return self._metadata.copy()

    @property
    def created_at(self) -> datetime:
        """Дата создания"""
        return self._created_at

    @property
    def is_from_user(self) -> bool:
        """Проверяет, от пользователя ли сообщение"""
        return self._role.is_user

    @property
    def is_from_assistant(self) -> bool:
        """Проверяет, от AI ли сообщение"""
        return self._role.is_assistant

    @property
    def has_references(self) -> bool:
        """Проверяет, есть ли ссылки на документы"""
        return len(self._referenced_documents) > 0

    def __repr__(self) -> str:
        """Представление для отладки"""
        return (
            f"Message(id={self.id}, role={self._role}, "
            f"content_length={len(self._content)})"
        )
