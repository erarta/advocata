"""
Rating Value Object

Рейтинг юриста на платформе.
"""

from typing import Any

from app.core.domain.value_object import ValueObject


class Rating(ValueObject):
    """
    Value Object для рейтинга юриста.

    Представляет средний рейтинг юриста на основе отзывов клиентов.
    Неизменяемый объект с валидацией.

    Business Rules:
    - Минимум 1.0 (худший рейтинг)
    - Максимум 5.0 (лучший рейтинг)
    - Точность до 0.1 (округление)
    - Новые юристы начинают с None (нет рейтинга)

    Examples:
        >>> rating = Rating(4.5)
        >>> rating.value
        4.5
        >>> rating.stars
        '⭐⭐⭐⭐⭐ (4.5)'
        >>> rating.is_excellent
        True
    """

    MIN_RATING = 1.0
    MAX_RATING = 5.0

    # Пороги качества
    EXCELLENT_THRESHOLD = 4.5  # Отличный
    GOOD_THRESHOLD = 4.0  # Хороший
    AVERAGE_THRESHOLD = 3.0  # Средний
    POOR_THRESHOLD = 2.0  # Плохой
    # < 2.0 - Очень плохой

    def __init__(self, value: float) -> None:
        """
        Создает объект рейтинга.

        Args:
            value: Значение рейтинга

        Raises:
            ValueError: Если рейтинг невалидный
        """
        self._validate(value)
        # Округляем до 1 знака после запятой
        self._value = round(value, 1)

    @classmethod
    def _validate(cls, value: float) -> None:
        """
        Валидация рейтинга.

        Args:
            value: Значение для проверки

        Raises:
            ValueError: Если validation fails
        """
        if not isinstance(value, (int, float)):
            raise ValueError(f"Rating must be a number, got {type(value)}")

        if value < cls.MIN_RATING:
            raise ValueError(f"Rating cannot be less than {cls.MIN_RATING}, got {value}")

        if value > cls.MAX_RATING:
            raise ValueError(f"Rating cannot exceed {cls.MAX_RATING}, got {value}")

    @classmethod
    def create_default(cls) -> "Rating":
        """
        Создает начальный рейтинг (5.0 для новых юристов).

        Returns:
            Rating с значением 5.0
        """
        return cls(5.0)

    @property
    def value(self) -> float:
        """Возвращает числовое значение рейтинга."""
        return self._value

    @property
    def stars(self) -> str:
        """
        Возвращает визуальное представление со звездами.

        Returns:
            Строка вида '⭐⭐⭐⭐⭐ (4.5)'
        """
        full_stars = int(self._value)
        return "⭐" * full_stars + f" ({self._value})"

    @property
    def quality_level(self) -> str:
        """
        Возвращает уровень качества (текстовый).

        Returns:
            Уровень: Отличный, Хороший, Средний, Плохой, Очень плохой
        """
        if self._value >= self.EXCELLENT_THRESHOLD:
            return "Отличный"
        elif self._value >= self.GOOD_THRESHOLD:
            return "Хороший"
        elif self._value >= self.AVERAGE_THRESHOLD:
            return "Средний"
        elif self._value >= self.POOR_THRESHOLD:
            return "Плохой"
        else:
            return "Очень плохой"

    @property
    def is_excellent(self) -> bool:
        """Проверяет, является ли рейтинг отличным."""
        return self._value >= self.EXCELLENT_THRESHOLD

    @property
    def is_good(self) -> bool:
        """Проверяет, является ли рейтинг хорошим."""
        return self._value >= self.GOOD_THRESHOLD

    @property
    def is_average(self) -> bool:
        """Проверяет, является ли рейтинг средним."""
        return self._value >= self.AVERAGE_THRESHOLD

    @property
    def is_poor(self) -> bool:
        """Проверяет, является ли рейтинг плохим."""
        return self._value < self.AVERAGE_THRESHOLD

    @property
    def percentage(self) -> int:
        """
        Возвращает рейтинг в процентах (0-100).

        Returns:
            Процент от максимального рейтинга
        """
        return int((self._value / self.MAX_RATING) * 100)

    def _get_equality_components(self) -> tuple[Any, ...]:
        """Компоненты для сравнения."""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление."""
        return f"{self._value} ({self.quality_level})"

    def __repr__(self) -> str:
        """Представление для отладки."""
        return f"Rating({self._value})"

    def __lt__(self, other: "Rating") -> bool:
        """Оператор меньше для сравнения рейтингов."""
        if not isinstance(other, Rating):
            return NotImplemented
        return self._value < other._value

    def __le__(self, other: "Rating") -> bool:
        """Оператор меньше или равно."""
        if not isinstance(other, Rating):
            return NotImplemented
        return self._value <= other._value

    def __gt__(self, other: "Rating") -> bool:
        """Оператор больше."""
        if not isinstance(other, Rating):
            return NotImplemented
        return self._value > other._value

    def __ge__(self, other: "Rating") -> bool:
        """Оператор больше или равно."""
        if not isinstance(other, Rating):
            return NotImplemented
        return self._value >= other._value
