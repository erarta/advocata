"""
Price Value Object

Цена консультации.
"""
from dataclasses import dataclass
from decimal import Decimal

from app.core.domain.value_object import ValueObject
from app.core.domain.result import Result


@dataclass(frozen=True)
class Price(ValueObject):
    """
    Value Object для цены консультации.

    Attributes:
        amount: Сумма в рублях (Decimal для точности)
        currency: Валюта (по умолчанию RUB)
    """

    amount: Decimal
    currency: str = "RUB"

    @classmethod
    def create(cls, amount: float | Decimal, currency: str = "RUB") -> Result["Price"]:
        """
        Создает цену с валидацией.

        Args:
            amount: Сумма
            currency: Валюта (ISO 4217)

        Returns:
            Result с Price или ошибкой
        """
        # Конвертируем в Decimal
        if isinstance(amount, float):
            decimal_amount = Decimal(str(amount))
        else:
            decimal_amount = amount

        # Валидация суммы
        if decimal_amount < Decimal("0"):
            return Result.fail("Price amount cannot be negative")

        if decimal_amount > Decimal("1000000"):  # 1 миллион рублей
            return Result.fail("Price amount cannot exceed 1,000,000 RUB")

        # Валидация валюты
        supported_currencies = ["RUB", "USD", "EUR"]
        if currency.upper() not in supported_currencies:
            return Result.fail(
                f"Unsupported currency: {currency}. "
                f"Supported: {', '.join(supported_currencies)}"
            )

        # Округление до 2 знаков после запятой
        rounded_amount = decimal_amount.quantize(Decimal("0.01"))

        return Result.ok(cls(amount=rounded_amount, currency=currency.upper()))

    @classmethod
    def zero(cls) -> "Price":
        """Создает нулевую цену (для бесплатных консультаций)."""
        return cls(amount=Decimal("0.00"), currency="RUB")

    @classmethod
    def from_rubles(cls, rubles: float) -> Result["Price"]:
        """
        Создает цену в рублях.

        Args:
            rubles: Сумма в рублях

        Returns:
            Result с Price
        """
        return cls.create(rubles, "RUB")

    def is_free(self) -> bool:
        """Проверяет, бесплатная ли консультация."""
        return self.amount == Decimal("0")

    def to_float(self) -> float:
        """Конвертирует в float (для API response)."""
        return float(self.amount)

    def format(self) -> str:
        """
        Форматирует цену для отображения.

        Returns:
            Строка вида "2500.00 ₽"
        """
        currency_symbols = {
            "RUB": "₽",
            "USD": "$",
            "EUR": "€",
        }
        symbol = currency_symbols.get(self.currency, self.currency)

        # Форматируем с разделителем тысяч
        formatted_amount = f"{self.amount:,.2f}"

        if self.currency == "RUB":
            return f"{formatted_amount} {symbol}"
        else:
            return f"{symbol}{formatted_amount}"

    def add(self, other: "Price") -> Result["Price"]:
        """
        Складывает две цены (должны быть в одной валюте).

        Args:
            other: Другая цена

        Returns:
            Result с новой Price или ошибкой
        """
        if self.currency != other.currency:
            return Result.fail(
                f"Cannot add prices in different currencies: {self.currency} and {other.currency}"
            )

        return Price.create(self.amount + other.amount, self.currency)

    def multiply(self, factor: float | Decimal) -> Result["Price"]:
        """
        Умножает цену на коэффициент.

        Args:
            factor: Множитель

        Returns:
            Result с новой Price
        """
        if isinstance(factor, float):
            factor = Decimal(str(factor))

        if factor < Decimal("0"):
            return Result.fail("Cannot multiply price by negative number")

        new_amount = self.amount * factor
        return Price.create(new_amount, self.currency)

    def apply_discount_percent(self, percent: float) -> Result["Price"]:
        """
        Применяет процентную скидку.

        Args:
            percent: Процент скидки (0-100)

        Returns:
            Result с новой Price после скидки
        """
        if percent < 0 or percent > 100:
            return Result.fail("Discount percent must be between 0 and 100")

        discount_factor = Decimal("1") - (Decimal(str(percent)) / Decimal("100"))
        return self.multiply(discount_factor)
