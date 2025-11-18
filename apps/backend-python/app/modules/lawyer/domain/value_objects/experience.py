"""
Experience Value Object

Опыт работы юриста в годах.
"""

from typing import Any

from app.core.domain.value_object import ValueObject


class Experience(ValueObject):
    """
    Value Object для опыта работы юриста.

    Представляет количество лет опыта работы.
    Неизменяемый объект с валидацией.

    Business Rules:
    - Минимум 0 лет (новичок)
    - Максимум 70 лет (реальный предел)
    - Целое число

    Examples:
        >>> exp = Experience(5)
        >>> exp.years
        5
        >>> exp.level
        'Опытный'
        >>> exp.is_senior
        False
    """

    MIN_YEARS = 0
    MAX_YEARS = 70

    # Уровни опыта
    JUNIOR_THRESHOLD = 3  # До 3 лет - Начинающий
    MIDDLE_THRESHOLD = 7  # 3-7 лет - Опытный
    SENIOR_THRESHOLD = 15  # 7-15 лет - Старший
    # 15+ лет - Эксперт

    def __init__(self, years: int) -> None:
        """
        Создает объект опыта.

        Args:
            years: Количество лет опыта

        Raises:
            ValueError: Если количество лет невалидно
        """
        self._validate(years)
        self._years = years

    @classmethod
    def _validate(cls, years: int) -> None:
        """
        Валидация количества лет опыта.

        Args:
            years: Количество лет для проверки

        Raises:
            ValueError: Если validation fails
        """
        if not isinstance(years, int):
            raise ValueError(f"Experience years must be an integer, got {type(years)}")

        if years < cls.MIN_YEARS:
            raise ValueError(f"Experience years cannot be negative, got {years}")

        if years > cls.MAX_YEARS:
            raise ValueError(
                f"Experience years cannot exceed {cls.MAX_YEARS} years, got {years}"
            )

    @property
    def years(self) -> int:
        """Возвращает количество лет опыта."""
        return self._years

    @property
    def level(self) -> str:
        """
        Возвращает уровень опыта (текстовый).

        Returns:
            Уровень: Начинающий, Опытный, Старший, Эксперт
        """
        if self._years < self.JUNIOR_THRESHOLD:
            return "Начинающий"
        elif self._years < self.MIDDLE_THRESHOLD:
            return "Опытный"
        elif self._years < self.SENIOR_THRESHOLD:
            return "Старший"
        else:
            return "Эксперт"

    @property
    def is_junior(self) -> bool:
        """Проверяет, является ли юрист начинающим."""
        return self._years < self.JUNIOR_THRESHOLD

    @property
    def is_middle(self) -> bool:
        """Проверяет, является ли юрист опытным."""
        return self.JUNIOR_THRESHOLD <= self._years < self.MIDDLE_THRESHOLD

    @property
    def is_senior(self) -> bool:
        """Проверяет, является ли юрист старшим."""
        return self.MIDDLE_THRESHOLD <= self._years < self.SENIOR_THRESHOLD

    @property
    def is_expert(self) -> bool:
        """Проверяет, является ли юрист экспертом."""
        return self._years >= self.SENIOR_THRESHOLD

    def _get_equality_components(self) -> tuple[Any, ...]:
        """Компоненты для сравнения."""
        return (self._years,)

    def __str__(self) -> str:
        """Строковое представление."""
        year_word = self._get_year_word(self._years)
        return f"{self._years} {year_word} ({self.level})"

    def __repr__(self) -> str:
        """Представление для отладки."""
        return f"Experience({self._years})"

    @staticmethod
    def _get_year_word(years: int) -> str:
        """
        Возвращает правильное склонение слова 'год'.

        Args:
            years: Количество лет

        Returns:
            'год', 'года', или 'лет'
        """
        if years % 10 == 1 and years % 100 != 11:
            return "год"
        elif 2 <= years % 10 <= 4 and (years % 100 < 10 or years % 100 >= 20):
            return "года"
        else:
            return "лет"
