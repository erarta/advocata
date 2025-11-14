"""
Conversation Started Event

Событие начала новой беседы.
"""
from dataclasses import dataclass

from app.shared.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class ConversationStartedEvent(DomainEvent):
    """
    Событие: Начата новая беседа с AI.

    Публикуется когда пользователь создает новую беседу.

    Use cases:
    - Аналитика (количество начатых бесед)
    - Инициализация системного промпта
    - Отправка welcome сообщения
    - Обновление статистики пользователя
    """

    conversation_id: str
    user_id: str
    initial_message: str

    @property
    def event_name(self) -> str:
        """Имя события"""
        return "conversation.started"
