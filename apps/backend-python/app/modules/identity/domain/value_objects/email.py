"""
Email Value Object

Валидация и нормализация email адресов.
"""

import re
from typing import Any

from app.core.domain.value_object import ValueObject


class Email(ValueObject):
    """
    Email Value Object с валидацией.

    Правила:
    - Должен соответствовать формату email
    - Нормализуется к lowercase
    - Максимальная длина 255 символов

    Example:
        ```python
        email = Email("User@Example.COM")
        print(email.value)  # "user@example.com"
        ```
    """

    # Regex для валидации email
    EMAIL_REGEX = re.compile(
        r"^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+"
        r"@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
        r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
    )

    def __init__(self, value: str) -> None:
        """
        Создать Email Value Object.

        Args:
            value: Email адрес

        Raises:
            ValueError: Если email невалидный
        """
        self._validate(value)
        # Нормализация: lowercase и trim
        self._value = value.strip().lower()

    @property
    def value(self) -> str:
        """Получить email адрес."""
        return self._value

    @classmethod
    def _validate(cls, value: str) -> None:
        """
        Валидация email адреса.

        Args:
            value: Email для проверки

        Raises:
            ValueError: Если email невалидный
        """
        if not value or not value.strip():
            raise ValueError("Email cannot be empty")

        if len(value) > 255:
            raise ValueError("Email is too long (max 255 characters)")

        if not cls.EMAIL_REGEX.match(value):
            raise ValueError(f"Invalid email format: {value}")

    def _get_equality_components(self) -> tuple[Any, ...]:
        """Компоненты для сравнения."""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление."""
        return self._value
