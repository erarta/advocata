"""
LawyerRegisteredEvent

Событие регистрации нового юриста.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import List
from uuid import uuid4

from app.core.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class LawyerRegisteredEvent(DomainEvent):
    """
    Событие: Юрист зарегистрирован.

    Публикуется после успешной регистрации нового юриста в системе.
    Статус верификации: PENDING.

    Use Cases:
    - Отправка уведомления администраторам о новой заявке
    - Отправка email юристу с инструкциями
    - Логирование для аналитики
    - Интеграция с внешними системами

    Attributes:
        lawyer_id: ID юриста
        user_id: ID пользователя
        specializations: Список специализаций
        location: Город/регион
        occurred_at: Время события
    """

    lawyer_id: str
    user_id: str
    specializations: List[str]
    location: str
    occurred_at: datetime = None

    def __post_init__(self):
        """Инициализация после создания."""
        if self.occurred_at is None:
            object.__setattr__(self, "occurred_at", datetime.utcnow())
        if not hasattr(self, "event_id") or self.event_id is None:
            object.__setattr__(self, "event_id", str(uuid4()))
        if not hasattr(self, "event_type") or self.event_type is None:
            object.__setattr__(self, "event_type", "LawyerRegisteredEvent")
