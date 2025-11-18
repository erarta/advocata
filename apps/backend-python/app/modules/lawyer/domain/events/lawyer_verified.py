"""
LawyerVerifiedEvent

Событие верификации юриста.
"""

from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

from app.core.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class LawyerVerifiedEvent(DomainEvent):
    """
    Событие: Юрист верифицирован.

    Публикуется после успешной верификации юриста администратором.
    Юрист получает возможность принимать консультации.

    Use Cases:
    - Отправка уведомления юристу об успешной верификации
    - Активация профиля юриста
    - Логирование для аудита
    - Обновление статистики

    Attributes:
        lawyer_id: ID юриста
        verified_by: ID администратора, проверившего документы
        verified_at: Время верификации
        occurred_at: Время события
    """

    lawyer_id: str
    verified_by: str
    verified_at: datetime
    occurred_at: datetime = None

    def __post_init__(self):
        """Инициализация после создания."""
        if self.occurred_at is None:
            object.__setattr__(self, "occurred_at", datetime.utcnow())
        if not hasattr(self, "event_id") or self.event_id is None:
            object.__setattr__(self, "event_id", str(uuid4()))
        if not hasattr(self, "event_type") or self.event_type is None:
            object.__setattr__(self, "event_type", "LawyerVerifiedEvent")
