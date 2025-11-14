"""
Базовый класс Aggregate Root для DDD

Aggregate Root - главная сущность агрегата, через которую происходит
весь доступ к объектам внутри агрегата.
"""

from typing import List
from uuid import UUID

from .entity import Entity
from .domain_event import DomainEvent


class AggregateRoot(Entity):
    """
    Базовый класс для корневых сущностей агрегатов.

    Aggregate Root:
    - Контролирует доступ к объектам внутри агрегата
    - Обеспечивает инварианты агрегата
    - Генерирует доменные события

    Attributes:
        _domain_events: Список доменных событий, сгенерированных агрегатом
    """

    def __init__(self, entity_id: str | UUID) -> None:
        """
        Инициализация агрегата.

        Args:
            entity_id: Уникальный идентификатор
        """
        super().__init__(entity_id)
        self._domain_events: List[DomainEvent] = []

    @property
    def domain_events(self) -> List[DomainEvent]:
        """
        Получить список доменных событий.

        Returns:
            Список событий, сгенерированных агрегатом
        """
        return self._domain_events.copy()

    def add_domain_event(self, event: DomainEvent) -> None:
        """
        Добавить доменное событие.

        Args:
            event: Доменное событие для добавления
        """
        self._domain_events.append(event)

    def clear_domain_events(self) -> None:
        """Очистить список доменных событий после их публикации."""
        self._domain_events.clear()

    def __repr__(self) -> str:
        """Строковое представление агрегата."""
        events_count = len(self._domain_events)
        return f"{self.__class__.__name__}(id={self._id}, events={events_count})"
