"""
Базовый класс Entity для DDD

Entity - объект с уникальной идентичностью, который можно отличить от других
объектов даже если все его атрибуты идентичны.
"""

from abc import ABC
from typing import Any
from uuid import UUID


class Entity(ABC):
    """
    Базовый класс для всех доменных сущностей.

    Сущность определяется своим идентификатором (ID), а не атрибутами.
    Две сущности с одинаковым ID считаются одним и тем же объектом.

    Attributes:
        _id: Уникальный идентификатор сущности
    """

    def __init__(self, entity_id: str | UUID) -> None:
        """
        Инициализация сущности.

        Args:
            entity_id: Уникальный идентификатор (UUID или строка)
        """
        self._id = str(entity_id) if isinstance(entity_id, UUID) else entity_id

    @property
    def id(self) -> str:
        """Получить ID сущности."""
        return self._id

    def __eq__(self, other: object) -> bool:
        """
        Проверка равенства сущностей по ID.

        Args:
            other: Другая сущность для сравнения

        Returns:
            True если ID совпадают, иначе False
        """
        if not isinstance(other, Entity):
            return False
        return self._id == other._id

    def __hash__(self) -> int:
        """Хеш сущности на основе ID."""
        return hash(self._id)

    def __repr__(self) -> str:
        """Строковое представление сущности."""
        return f"{self.__class__.__name__}(id={self._id})"
