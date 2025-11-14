"""
Базовый класс Value Object для DDD

Value Object - объект без идентичности, который определяется своими атрибутами.
Два Value Object с одинаковыми атрибутами считаются равными.
"""

from abc import ABC
from typing import Any


class ValueObject(ABC):
    """
    Базовый класс для всех объектов-значений.

    Value Object:
    - Не имеет идентификатора
    - Определяется своими атрибутами
    - Является immutable (неизменяемым)
    - Два объекта с одинаковыми значениями считаются равными

    Example:
        ```python
        class Email(ValueObject):
            def __init__(self, value: str):
                self._value = value

            @property
            def value(self) -> str:
                return self._value

            def _get_equality_components(self) -> tuple:
                return (self._value,)
        ```
    """

    def _get_equality_components(self) -> tuple[Any, ...]:
        """
        Получить компоненты для сравнения объектов.

        Должен быть переопределен в подклассах.

        Returns:
            Кортеж значений для сравнения

        Raises:
            NotImplementedError: Если не переопределен в подклассе
        """
        raise NotImplementedError("Subclasses must implement _get_equality_components()")

    def __eq__(self, other: object) -> bool:
        """
        Проверка равенства Value Objects по значениям.

        Args:
            other: Другой объект для сравнения

        Returns:
            True если все компоненты равны, иначе False
        """
        if not isinstance(other, self.__class__):
            return False
        return self._get_equality_components() == other._get_equality_components()

    def __hash__(self) -> int:
        """Хеш Value Object на основе компонентов."""
        return hash(self._get_equality_components())

    def __repr__(self) -> str:
        """Строковое представление Value Object."""
        components = self._get_equality_components()
        return f"{self.__class__.__name__}({components})"
