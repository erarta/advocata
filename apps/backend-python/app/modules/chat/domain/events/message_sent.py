"""
Message Sent Event

Событие отправки сообщения в беседе.
"""
from dataclasses import dataclass
from typing import Optional

from app.shared.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class MessageSentEvent(DomainEvent):
    """
    Событие: Отправлено сообщение в беседе.

    Публикуется когда пользователь отправляет сообщение
    или AI генерирует ответ.

    Use cases:
    - Обновление счетчика токенов
    - Отправка уведомлений (для асинхронных ответов)
    - Аналитика использования
    - Логирование для улучшения модели
    - Индексация для поиска по истории
    """

    conversation_id: str
    message_id: str
    role: str  # "user" или "assistant"
    content: str
    token_count: Optional[int] = None
    referenced_documents: Optional[list[str]] = None

    @property
    def event_name(self) -> str:
        """Имя события"""
        return "message.sent"
