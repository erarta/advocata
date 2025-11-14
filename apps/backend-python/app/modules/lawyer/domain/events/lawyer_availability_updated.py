"""
LawyerAvailabilityUpdatedEvent

Событие изменения доступности юриста.
"""

from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

from app.core.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class LawyerAvailabilityUpdatedEvent(DomainEvent):
    """
    Событие: Доступность юриста изменена.

    Публикуется когда юрист меняет свой статус доступности
    (может/не может принимать консультации).

    Use Cases:
    - Обновление статуса в поиске
    - Уведомление клиентов о доступности
    - Логирование для аналитики
    - Обновление кеша

    Attributes:
        lawyer_id: ID юриста
        is_available: Доступен ли для консультаций
        occurred_at: Время события
    """

    lawyer_id: str
    is_available: bool
    occurred_at: datetime = None

    def __post_init__(self):
        """Инициализация после создания."""
        if self.occurred_at is None:
            object.__setattr__(self, "occurred_at", datetime.utcnow())
        if not hasattr(self, "event_id") or self.event_id is None:
            object.__setattr__(self, "event_id", str(uuid4()))
        if not hasattr(self, "event_type") or self.event_type is None:
            object.__setattr__(self, "event_type", "LawyerAvailabilityUpdatedEvent")
