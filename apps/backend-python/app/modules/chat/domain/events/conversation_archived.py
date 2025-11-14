"""
Conversation Archived Event

Событие архивации беседы.
"""
from dataclasses import dataclass

from app.shared.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class ConversationArchivedEvent(DomainEvent):
    """
    Событие: Беседа архивирована.

    Публикуется когда пользователь архивирует беседу.

    Use cases:
    - Обновление UI (перемещение в архив)
    - Аналитика (средняя продолжительность беседы)
    - Очистка кеша активных бесед
    - Оптимизация хранения
    """

    conversation_id: str
    user_id: str

    @property
    def event_name(self) -> str:
        """Имя события"""
        return "conversation.archived"
