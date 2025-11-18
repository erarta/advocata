"""
Payment Method Value Object

Способ оплаты с валидацией.
"""
from dataclasses import dataclass
from enum import Enum

from app.core.domain.value_object import ValueObject


class PaymentMethodEnum(str, Enum):
    """
    Перечисление способов оплаты.

    Поддерживаемые методы через ЮКасса:
    - Банковские карты (Visa, Mastercard, МИР)
    - Электронные кошельки (ЮMoney, QIWI)
    - СБП (Система Быстрых Платежей)
    """

    BANK_CARD = "bank_card"  # Банковская карта
    YOOMONEY = "yoomoney"  # ЮMoney (бывш. Яндекс.Деньги)
    QIWI = "qiwi"  # QIWI Кошелек
    SBP = "sbp"  # Система Быстрых Платежей
    SBERBANK = "sberbank"  # Сбербанк Онлайн
    TINKOFF = "tinkoff"  # Tinkoff Pay
    SUBSCRIPTION = "subscription"  # Подписка (автоплатеж)


@dataclass(frozen=True)
class PaymentMethod(ValueObject):
    """
    Value Object для способа оплаты.

    Attributes:
        value: Способ оплаты
    """

    value: PaymentMethodEnum

    def __post_init__(self):
        """Валидация способа оплаты."""
        if not isinstance(self.value, PaymentMethodEnum):
            raise ValueError(f"Invalid payment method: {self.value}")

    def is_bank_card(self) -> bool:
        """Проверка, является ли методом банковская карта."""
        return self.value == PaymentMethodEnum.BANK_CARD

    def is_ewallet(self) -> bool:
        """Проверка, является ли методом электронный кошелек."""
        return self.value in [
            PaymentMethodEnum.YOOMONEY,
            PaymentMethodEnum.QIWI,
        ]

    def is_bank_transfer(self) -> bool:
        """Проверка, является ли методом банковский перевод."""
        return self.value in [
            PaymentMethodEnum.SBP,
            PaymentMethodEnum.SBERBANK,
            PaymentMethodEnum.TINKOFF,
        ]

    def is_subscription(self) -> bool:
        """Проверка, является ли методом подписка (автоплатеж)."""
        return self.value == PaymentMethodEnum.SUBSCRIPTION

    def supports_refund(self) -> bool:
        """Проверка, поддерживает ли метод возврат средств."""
        # Все методы через ЮКасса поддерживают возврат
        return True

    def get_display_name(self) -> str:
        """Получить отображаемое имя метода."""
        display_names = {
            PaymentMethodEnum.BANK_CARD: "Банковская карта",
            PaymentMethodEnum.YOOMONEY: "ЮMoney",
            PaymentMethodEnum.QIWI: "QIWI Кошелек",
            PaymentMethodEnum.SBP: "СБП",
            PaymentMethodEnum.SBERBANK: "Сбербанк Онлайн",
            PaymentMethodEnum.TINKOFF: "Tinkoff Pay",
            PaymentMethodEnum.SUBSCRIPTION: "Подписка",
        }
        return display_names.get(self.value, str(self.value))

    @classmethod
    def bank_card(cls) -> "PaymentMethod":
        """Создает метод BANK_CARD."""
        return cls(value=PaymentMethodEnum.BANK_CARD)

    @classmethod
    def yoomoney(cls) -> "PaymentMethod":
        """Создает метод YOOMONEY."""
        return cls(value=PaymentMethodEnum.YOOMONEY)

    @classmethod
    def sbp(cls) -> "PaymentMethod":
        """Создает метод SBP."""
        return cls(value=PaymentMethodEnum.SBP)

    @classmethod
    def subscription(cls) -> "PaymentMethod":
        """Создает метод SUBSCRIPTION."""
        return cls(value=PaymentMethodEnum.SUBSCRIPTION)
