"""
Phone Value Object

Валидация и форматирование номеров телефонов (российский формат).
"""

import re
from typing import Any

from app.core.domain.value_object import ValueObject


class Phone(ValueObject):
    """
    Phone Value Object для российских номеров.

    Поддерживаемые форматы ввода:
    - +79991234567
    - 89991234567
    - 79991234567
    - 9991234567

    Нормализованный формат: +79991234567

    Example:
        ```python
        phone = Phone("8 (999) 123-45-67")
        print(phone.value)  # "+79991234567"
        ```
    """

    # Regex для российских номеров
    PHONE_REGEX = re.compile(r"^\+?[78]?(\d{10})$")

    def __init__(self, value: str) -> None:
        """
        Создать Phone Value Object.

        Args:
            value: Номер телефона

        Raises:
            ValueError: Если номер невалидный
        """
        normalized = self._normalize(value)
        self._validate(normalized)
        self._value = normalized

    @property
    def value(self) -> str:
        """Получить нормализованный номер телефона."""
        return self._value

    @classmethod
    def _normalize(cls, value: str) -> str:
        """
        Нормализация номера телефона.

        Удаляет все символы кроме цифр и '+', приводит к формату +7XXXXXXXXXX.

        Args:
            value: Исходный номер

        Returns:
            Нормализованный номер
        """
        if not value:
            return ""

        # Удаляем все кроме цифр и '+'
        digits = re.sub(r"[^\d+]", "", value)

        # Убираем '+' если он не в начале
        if "+" in digits[1:]:
            digits = digits.replace("+", "")

        # Обработка разных форматов
        if digits.startswith("+7"):
            # +79991234567 -> +79991234567
            return digits
        elif digits.startswith("8"):
            # 89991234567 -> +79991234567
            return "+7" + digits[1:]
        elif digits.startswith("7"):
            # 79991234567 -> +79991234567
            return "+" + digits
        elif len(digits) == 10:
            # 9991234567 -> +79991234567
            return "+7" + digits
        else:
            return digits

    @classmethod
    def _validate(cls, value: str) -> None:
        """
        Валидация номера телефона.

        Args:
            value: Нормализованный номер

        Raises:
            ValueError: Если номер невалидный
        """
        if not value:
            raise ValueError("Phone number cannot be empty")

        if not cls.PHONE_REGEX.match(value):
            raise ValueError(f"Invalid Russian phone number format: {value}")

    def _get_equality_components(self) -> tuple[Any, ...]:
        """Компоненты для сравнения."""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление."""
        return self._value

    def formatted(self) -> str:
        """
        Получить отформатированный номер для отображения.

        Returns:
            Номер в формате +7 (999) 123-45-67
        """
        # +79991234567 -> +7 (999) 123-45-67
        digits = self._value[2:]  # Убираем +7
        return f"+7 ({digits[:3]}) {digits[3:6]}-{digits[6:8]}-{digits[8:]}"
