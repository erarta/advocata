"""
Conversation Entity (Aggregate Root)

Доменная сущность беседы с AI ассистентом.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from app.shared.domain.aggregate_root import AggregateRoot
from app.shared.domain.result import Result
from app.modules.chat.domain.entities.message import Message
from app.modules.chat.domain.value_objects.conversation_status import ConversationStatus
from app.modules.chat.domain.value_objects.message_role import MessageRole
from app.modules.chat.domain.events.conversation_started import ConversationStartedEvent
from app.modules.chat.domain.events.message_sent import MessageSentEvent
from app.modules.chat.domain.events.conversation_archived import ConversationArchivedEvent


class Conversation(AggregateRoot):
    """
    Aggregate Root для беседы.

    Представляет беседу пользователя с AI ассистентом с полной историей
    сообщений и контекстом.

    Business Rules:
    1. Беседа всегда принадлежит пользователю
    2. Первое сообщение всегда от пользователя
    3. Сообщения чередуются (user → assistant → user → ...)
    4. Максимум 100 сообщений в одной беседе
    5. Беседа может быть архивирована или удалена
    6. Только активные беседы могут принимать новые сообщения
    """

    MAX_MESSAGES = 100  # Максимум сообщений в беседе

    def __init__(
        self,
        id: UUID,
        user_id: UUID,
        title: Optional[str],
        status: ConversationStatus,
        messages: Optional[List[Message]] = None,
        total_tokens: int = 0,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        last_message_at: Optional[datetime] = None,
    ):
        """
        Создает экземпляр беседы.

        Args:
            id: Уникальный идентификатор
            user_id: ID пользователя
            title: Название беседы (опционально)
            status: Статус беседы
            messages: Список сообщений
            total_tokens: Общее количество токенов
            created_at: Дата создания
            updated_at: Дата обновления
            last_message_at: Дата последнего сообщения
        """
        super().__init__(id)
        self._user_id = user_id
        self._title = title
        self._status = status
        self._messages = messages or []
        self._total_tokens = total_tokens
        self._created_at = created_at or datetime.utcnow()
        self._updated_at = updated_at or datetime.utcnow()
        self._last_message_at = last_message_at

    @classmethod
    def start(
        cls,
        user_id: UUID,
        initial_message_content: str,
        title: Optional[str] = None,
    ) -> Result["Conversation"]:
        """
        Начинает новую беседу (фабричный метод).

        Args:
            user_id: ID пользователя
            initial_message_content: Первое сообщение от пользователя
            title: Название беседы (опционально)

        Returns:
            Result с новой Conversation или ошибкой
        """
        # Валидация title
        if title and len(title) > 200:
            return Result.fail(
                f"Title too long: {len(title)} characters. Maximum: 200 characters"
            )

        # Создаем беседу
        conversation_id = uuid4()
        conversation = cls(
            id=conversation_id,
            user_id=user_id,
            title=title,
            status=ConversationStatus.active(),
        )

        # Создаем первое сообщение от пользователя
        message_result = Message.create(
            conversation_id=conversation_id,
            role=MessageRole.user(),
            content=initial_message_content,
        )

        if not message_result.is_success:
            return Result.fail(message_result.error)

        message = message_result.value
        conversation._messages.append(message)
        conversation._last_message_at = message.created_at

        # Публикуем событие начала беседы
        conversation.add_domain_event(
            ConversationStartedEvent(
                conversation_id=str(conversation_id),
                user_id=str(user_id),
                initial_message=initial_message_content,
            )
        )

        return Result.ok(conversation)

    def add_user_message(self, content: str) -> Result[Message]:
        """
        Добавляет сообщение от пользователя.

        Args:
            content: Текст сообщения

        Returns:
            Result с созданным Message или ошибкой
        """
        # Проверяем статус
        if not self._status.can_send_messages:
            return Result.fail(
                f"Cannot send messages in {self._status.display_name} conversation"
            )

        # Проверяем лимит сообщений
        if len(self._messages) >= self.MAX_MESSAGES:
            return Result.fail(
                f"Conversation has reached maximum messages limit: {self.MAX_MESSAGES}"
            )

        # Проверяем, что последнее сообщение было от ассистента
        if self._messages and self._messages[-1].is_from_user:
            return Result.fail(
                "Cannot add consecutive user messages. Wait for assistant response."
            )

        # Создаем сообщение
        message_result = Message.create(
            conversation_id=self.id,
            role=MessageRole.user(),
            content=content,
        )

        if not message_result.is_success:
            return Result.fail(message_result.error)

        message = message_result.value
        self._messages.append(message)
        self._last_message_at = message.created_at
        self._updated_at = datetime.utcnow()

        # Публикуем событие отправки сообщения
        self.add_domain_event(
            MessageSentEvent(
                conversation_id=str(self.id),
                message_id=str(message.id),
                role="user",
                content=content,
            )
        )

        return Result.ok(message)

    def add_assistant_message(
        self,
        content: str,
        token_count: Optional[int] = None,
        referenced_documents: Optional[list[str]] = None,
    ) -> Result[Message]:
        """
        Добавляет ответ от AI ассистента.

        Args:
            content: Текст ответа
            token_count: Количество токенов
            referenced_documents: ID документов, использованных для ответа

        Returns:
            Result с созданным Message или ошибкой
        """
        # Проверяем статус
        if not self._status.can_send_messages:
            return Result.fail(
                f"Cannot send messages in {self._status.display_name} conversation"
            )

        # Проверяем лимит сообщений
        if len(self._messages) >= self.MAX_MESSAGES:
            return Result.fail(
                f"Conversation has reached maximum messages limit: {self.MAX_MESSAGES}"
            )

        # Проверяем, что последнее сообщение было от пользователя
        if not self._messages or not self._messages[-1].is_from_user:
            return Result.fail(
                "Cannot add assistant message without user message first"
            )

        # Создаем сообщение
        message_result = Message.create(
            conversation_id=self.id,
            role=MessageRole.assistant(),
            content=content,
            token_count=token_count,
            referenced_documents=referenced_documents,
        )

        if not message_result.is_success:
            return Result.fail(message_result.error)

        message = message_result.value
        self._messages.append(message)
        self._last_message_at = message.created_at
        self._updated_at = datetime.utcnow()

        # Обновляем счетчик токенов
        if token_count:
            self._total_tokens += token_count

        # Публикуем событие отправки сообщения
        self.add_domain_event(
            MessageSentEvent(
                conversation_id=str(self.id),
                message_id=str(message.id),
                role="assistant",
                content=content,
                token_count=token_count,
                referenced_documents=referenced_documents,
            )
        )

        return Result.ok(message)

    def update_title(self, title: str) -> Result[None]:
        """
        Обновляет название беседы.

        Args:
            title: Новое название

        Returns:
            Result с успехом или ошибкой
        """
        if not title or len(title.strip()) == 0:
            return Result.fail("Title cannot be empty")

        if len(title) > 200:
            return Result.fail(
                f"Title too long: {len(title)} characters. Maximum: 200 characters"
            )

        self._title = title.strip()
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def archive(self) -> Result[None]:
        """
        Архивирует беседу.

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.can_be_archived:
            return Result.fail(
                f"Cannot archive conversation in {self._status.display_name} status"
            )

        self._status = ConversationStatus.archived()
        self._updated_at = datetime.utcnow()

        # Публикуем событие архивации
        self.add_domain_event(
            ConversationArchivedEvent(
                conversation_id=str(self.id),
                user_id=str(self._user_id),
            )
        )

        return Result.ok()

    def delete(self) -> Result[None]:
        """
        Помечает беседу на удаление.

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.can_be_deleted:
            return Result.fail(
                f"Cannot delete conversation in {self._status.display_name} status"
            )

        self._status = ConversationStatus.deleted()
        self._updated_at = datetime.utcnow()

        return Result.ok()

    # Свойства (getters)

    @property
    def user_id(self) -> UUID:
        """ID пользователя"""
        return self._user_id

    @property
    def title(self) -> Optional[str]:
        """Название беседы"""
        return self._title

    @property
    def status(self) -> ConversationStatus:
        """Статус беседы"""
        return self._status

    @property
    def messages(self) -> List[Message]:
        """Список сообщений (копия)"""
        return self._messages.copy()

    @property
    def messages_count(self) -> int:
        """Количество сообщений"""
        return len(self._messages)

    @property
    def total_tokens(self) -> int:
        """Общее количество токенов"""
        return self._total_tokens

    @property
    def created_at(self) -> datetime:
        """Дата создания"""
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        """Дата обновления"""
        return self._updated_at

    @property
    def last_message_at(self) -> Optional[datetime]:
        """Дата последнего сообщения"""
        return self._last_message_at

    @property
    def last_message(self) -> Optional[Message]:
        """Последнее сообщение"""
        return self._messages[-1] if self._messages else None

    def __repr__(self) -> str:
        """Представление для отладки"""
        return (
            f"Conversation(id={self.id}, user_id={self._user_id}, "
            f"messages={self.messages_count}, status={self._status})"
        )
