"""
Money Value Object

Денежная сумма с валютой и операциями.
"""
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict

from app.core.domain.result import Result
from app.core.domain.value_object import ValueObject


# Символы валют для отображения
CURRENCY_SYMBOLS: Dict[str, str] = {
    "RUB": "₽",
    "USD": "$",
    "EUR": "€",
}


@dataclass(frozen=True)
class Money(ValueObject):
    """
    Value Object для денежной суммы.

    Attributes:
        amount: Сумма (Decimal для точности)
        currency: Код валюты (ISO 4217)
    """

    amount: Decimal
    currency: str = "RUB"

    def __post_init__(self):
        """Валидация денежной суммы."""
        # Конвертируем в Decimal если передан float/int
        if not isinstance(object.__getattribute__(self, "amount"), Decimal):
            object.__setattr__(
                self, "amount", Decimal(str(object.__getattribute__(self, "amount")))
            )

        # Округляем до 2 знаков после запятой
        rounded = object.__getattribute__(self, "amount").quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        object.__setattr__(self, "amount", rounded)

        # Валидация
        if object.__getattribute__(self, "amount") < 0:
            raise ValueError("Money amount cannot be negative")

        if object.__getattribute__(self, "currency") not in [
            "RUB",
            "USD",
            "EUR",
        ]:
            raise ValueError(
                f"Unsupported currency: {object.__getattribute__(self, 'currency')}"
            )

    def is_zero(self) -> bool:
        """Проверка, является ли сумма нулевой."""
        return self.amount == Decimal("0")

    def is_positive(self) -> bool:
        """Проверка, является ли сумма положительной."""
        return self.amount > Decimal("0")

    def add(self, other: "Money") -> Result["Money"]:
        """
        Сложение денежных сумм.

        Args:
            other: Другая денежная сумма

        Returns:
            Result с новой суммой или ошибкой
        """
        if self.currency != other.currency:
            return Result.fail(f"Cannot add {self.currency} and {other.currency}")

        return Result.ok(Money(amount=self.amount + other.amount, currency=self.currency))

    def subtract(self, other: "Money") -> Result["Money"]:
        """
        Вычитание денежных сумм.

        Args:
            other: Другая денежная сумма

        Returns:
            Result с новой суммой или ошибкой
        """
        if self.currency != other.currency:
            return Result.fail(
                f"Cannot subtract {other.currency} from {self.currency}"
            )

        new_amount = self.amount - other.amount
        if new_amount < 0:
            return Result.fail("Subtraction would result in negative amount")

        return Result.ok(Money(amount=new_amount, currency=self.currency))

    def multiply(self, factor: float) -> Result["Money"]:
        """
        Умножение суммы на коэффициент.

        Args:
            factor: Коэффициент умножения

        Returns:
            Result с новой суммой или ошибкой
        """
        if factor < 0:
            return Result.fail("Cannot multiply by negative factor")

        new_amount = self.amount * Decimal(str(factor))
        return Result.ok(Money(amount=new_amount, currency=self.currency))

    def apply_commission(self, percent: float) -> Result["Money"]:
        """
        Применить комиссию в процентах.

        Args:
            percent: Процент комиссии (например, 2.5 для 2.5%)

        Returns:
            Result с суммой комиссии
        """
        if percent < 0 or percent > 100:
            return Result.fail("Commission percent must be between 0 and 100")

        commission_amount = self.amount * Decimal(str(percent)) / Decimal("100")
        return Result.ok(Money(amount=commission_amount, currency=self.currency))

    def format(self) -> str:
        """
        Форматирование для отображения.

        Returns:
            Строка вида "2500.00 ₽"
        """
        symbol = CURRENCY_SYMBOLS.get(self.currency, self.currency)
        return f"{self.amount:,.2f} {symbol}"

    @classmethod
    def create(cls, amount: float | Decimal, currency: str = "RUB") -> Result["Money"]:
        """
        Создает Money с валидацией.

        Args:
            amount: Сумма
            currency: Валюта

        Returns:
            Result с Money или ошибкой
        """
        try:
            money = cls(amount=Decimal(str(amount)), currency=currency)
            return Result.ok(money)
        except (ValueError, Exception) as e:
            return Result.fail(str(e))

    @classmethod
    def zero(cls, currency: str = "RUB") -> "Money":
        """Создает нулевую сумму."""
        return cls(amount=Decimal("0"), currency=currency)

    @classmethod
    def from_rubles(cls, rubles: float) -> "Money":
        """Создает сумму в рублях."""
        return cls(amount=Decimal(str(rubles)), currency="RUB")
