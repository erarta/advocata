"""
Price Value Object

Цена услуг юриста.
"""

from decimal import Decimal
from typing import Any

from app.core.domain.value_object import ValueObject


class Price(ValueObject):
    """
    Value Object для цены услуг юриста.

    Представляет стоимость консультации или услуг юриста.
    Неизменяемый объект с валидацией.

    Business Rules:
    - Минимум 500 руб. (минимальная консультация)
    - Максимум 100,000 руб. (максимальная консультация)
    - Валюта: RUB (рубли)
    - Точность: копейки (2 знака после запятой)

    Examples:
        >>> price = Price(2500)
        >>> price.amount
        Decimal('2500.00')
        >>> price.formatted
        '2 500 ₽'
        >>> price.is_affordable
        True
    """

    MIN_PRICE = Decimal("500.00")  # 500 рублей
    MAX_PRICE = Decimal("100000.00")  # 100,000 рублей
    CURRENCY = "RUB"
    CURRENCY_SYMBOL = "₽"

    # Ценовые категории
    BUDGET_THRESHOLD = Decimal("1500.00")  # До 1500 - Бюджетный
    AVERAGE_THRESHOLD = Decimal("3000.00")  # 1500-3000 - Средний
    PREMIUM_THRESHOLD = Decimal("5000.00")  # 3000-5000 - Выше среднего
    # 5000+ - Премиум

    def __init__(self, amount: Decimal | int | float | str) -> None:
        """
        Создает объект цены.

        Args:
            amount: Сумма в рублях

        Raises:
            ValueError: Если цена невалидна
        """
        # Конвертируем в Decimal
        if isinstance(amount, (int, float)):
            amount = Decimal(str(amount))
        elif isinstance(amount, str):
            amount = Decimal(amount)
        elif not isinstance(amount, Decimal):
            raise ValueError(f"Invalid price type: {type(amount)}")

        self._validate(amount)

        # Округляем до 2 знаков после запятой (копейки)
        self._amount = amount.quantize(Decimal("0.01"))

    @classmethod
    def _validate(cls, amount: Decimal) -> None:
        """
        Валидация цены.

        Args:
            amount: Сумма для проверки

        Raises:
            ValueError: Если validation fails
        """
        if amount < cls.MIN_PRICE:
            raise ValueError(
                f"Price cannot be less than {cls.MIN_PRICE} {cls.CURRENCY}, got {amount}"
            )

        if amount > cls.MAX_PRICE:
            raise ValueError(
                f"Price cannot exceed {cls.MAX_PRICE} {cls.CURRENCY}, got {amount}"
            )

    @classmethod
    def from_rubles(cls, rubles: int) -> "Price":
        """
        Создает цену из целых рублей.

        Args:
            rubles: Сумма в рублях

        Returns:
            Price object
        """
        return cls(Decimal(rubles))

    @property
    def amount(self) -> Decimal:
        """Возвращает сумму в виде Decimal."""
        return self._amount

    @property
    def rubles(self) -> int:
        """Возвращает целую часть (рубли)."""
        return int(self._amount)

    @property
    def kopecks(self) -> int:
        """Возвращает копейки (остаток от деления)."""
        return int((self._amount % 1) * 100)

    @property
    def formatted(self) -> str:
        """
        Возвращает отформатированную строку с валютой.

        Returns:
            Строка вида '2 500 ₽' или '2 500.50 ₽'
        """
        # Форматируем число с разделителями тысяч
        if self.kopecks == 0:
            amount_str = f"{self.rubles:,}".replace(",", " ")
        else:
            amount_str = f"{self._amount:,.2f}".replace(",", " ")

        return f"{amount_str} {self.CURRENCY_SYMBOL}"

    @property
    def category(self) -> str:
        """
        Возвращает ценовую категорию.

        Returns:
            Категория: Бюджетный, Средний, Выше среднего, Премиум
        """
        if self._amount < self.BUDGET_THRESHOLD:
            return "Бюджетный"
        elif self._amount < self.AVERAGE_THRESHOLD:
            return "Средний"
        elif self._amount < self.PREMIUM_THRESHOLD:
            return "Выше среднего"
        else:
            return "Премиум"

    @property
    def is_budget(self) -> bool:
        """Проверяет, является ли цена бюджетной."""
        return self._amount < self.BUDGET_THRESHOLD

    @property
    def is_average(self) -> bool:
        """Проверяет, является ли цена средней."""
        return self.BUDGET_THRESHOLD <= self._amount < self.AVERAGE_THRESHOLD

    @property
    def is_premium(self) -> bool:
        """Проверяет, является ли цена премиум."""
        return self._amount >= self.PREMIUM_THRESHOLD

    @property
    def is_affordable(self) -> bool:
        """Проверяет, является ли цена доступной (до 3000 руб)."""
        return self._amount < self.AVERAGE_THRESHOLD

    def _get_equality_components(self) -> tuple[Any, ...]:
        """Компоненты для сравнения."""
        return (self._amount,)

    def __str__(self) -> str:
        """Строковое представление."""
        return self.formatted

    def __repr__(self) -> str:
        """Представление для отладки."""
        return f"Price({self._amount})"

    def __lt__(self, other: "Price") -> bool:
        """Оператор меньше для сравнения цен."""
        if not isinstance(other, Price):
            return NotImplemented
        return self._amount < other._amount

    def __le__(self, other: "Price") -> bool:
        """Оператор меньше или равно."""
        if not isinstance(other, Price):
            return NotImplemented
        return self._amount <= other._amount

    def __gt__(self, other: "Price") -> bool:
        """Оператор больше."""
        if not isinstance(other, Price):
            return NotImplemented
        return self._amount > other._amount

    def __ge__(self, other: "Price") -> bool:
        """Оператор больше или равно."""
        if not isinstance(other, Price):
            return NotImplemented
        return self._amount >= other._amount

    def __add__(self, other: "Price") -> "Price":
        """Сложение цен."""
        if not isinstance(other, Price):
            return NotImplemented
        return Price(self._amount + other._amount)

    def __sub__(self, other: "Price") -> "Price":
        """Вычитание цен."""
        if not isinstance(other, Price):
            return NotImplemented
        return Price(self._amount - other._amount)
