"""
Базовый класс Domain Event для DDD

Domain Event - событие, которое произошло в домене и может быть интересно
другим частям системы.
"""

from abc import ABC
from datetime import datetime
from typing import Any, Dict
from uuid import UUID, uuid4


class DomainEvent(ABC):
    """
    Базовый класс для всех доменных событий.

    Domain Event:
    - Описывает факт, который произошел в прошлом
    - Immutable (неизменяемый)
    - Содержит всю необходимую информацию о произошедшем
    - Может быть использован для Event Sourcing

    Attributes:
        event_id: Уникальный идентификатор события
        occurred_at: Временная метка когда произошло событие
        aggregate_id: ID агрегата, который сгенерировал событие

    Example:
        ```python
        class UserRegisteredEvent(DomainEvent):
            def __init__(self, user_id: str, email: str):
                super().__init__(aggregate_id=user_id)
                self.user_id = user_id
                self.email = email
        ```
    """

    def __init__(self, aggregate_id: str | UUID) -> None:
        """
        Инициализация доменного события.

        Args:
            aggregate_id: ID агрегата, сгенерировавшего событие
        """
        self.event_id: str = str(uuid4())
        self.occurred_at: datetime = datetime.utcnow()
        self.aggregate_id: str = str(aggregate_id) if isinstance(aggregate_id, UUID) else aggregate_id

    @property
    def event_type(self) -> str:
        """
        Получить тип события.

        Returns:
            Имя класса события
        """
        return self.__class__.__name__

    def to_dict(self) -> Dict[str, Any]:
        """
        Преобразовать событие в словарь.

        Returns:
            Словарь с данными события

        Note:
            Может быть переопределен в подклассах для добавления специфичных данных
        """
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "occurred_at": self.occurred_at.isoformat(),
            "aggregate_id": self.aggregate_id,
        }

    def __repr__(self) -> str:
        """Строковое представление события."""
        return (
            f"{self.event_type}("
            f"event_id={self.event_id}, "
            f"aggregate_id={self.aggregate_id}, "
            f"occurred_at={self.occurred_at.isoformat()})"
        )
