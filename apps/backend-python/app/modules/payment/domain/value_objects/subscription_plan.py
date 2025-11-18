"""
Subscription Plan Value Object

План подписки с тарифами и ограничениями.
"""
from dataclasses import dataclass
from decimal import Decimal
from enum import Enum

from app.core.domain.value_object import ValueObject


class SubscriptionPlanEnum(str, Enum):
    """
    Перечисление планов подписки.

    FREE - Бесплатный план
    BASIC - Базовая подписка (490 руб/мес)
    PRO - Премиум подписка (990 руб/мес)
    ENTERPRISE - Корпоративная подписка (2990 руб/мес)
    """

    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


@dataclass(frozen=True)
class SubscriptionPlan(ValueObject):
    """
    Value Object для плана подписки.

    Attributes:
        value: План подписки
    """

    value: SubscriptionPlanEnum

    def __post_init__(self):
        """Валидация плана."""
        if not isinstance(self.value, SubscriptionPlanEnum):
            raise ValueError(f"Invalid subscription plan: {self.value}")

    def is_free(self) -> bool:
        """Проверка, является ли план бесплатным."""
        return self.value == SubscriptionPlanEnum.FREE

    def is_basic(self) -> bool:
        """Проверка, является ли план базовым."""
        return self.value == SubscriptionPlanEnum.BASIC

    def is_pro(self) -> bool:
        """Проверка, является ли план премиум."""
        return self.value == SubscriptionPlanEnum.PRO

    def is_enterprise(self) -> bool:
        """Проверка, является ли план корпоративным."""
        return self.value == SubscriptionPlanEnum.ENTERPRISE

    def get_monthly_price(self) -> Decimal:
        """
        Получить ежемесячную цену плана.

        Returns:
            Цена в рублях
        """
        prices = {
            SubscriptionPlanEnum.FREE: Decimal("0"),
            SubscriptionPlanEnum.BASIC: Decimal("490"),
            SubscriptionPlanEnum.PRO: Decimal("990"),
            SubscriptionPlanEnum.ENTERPRISE: Decimal("2990"),
        }
        return prices[self.value]

    def get_consultations_limit(self) -> int:
        """
        Получить лимит консультаций в месяц.

        Returns:
            Количество консультаций (-1 = безлимит)
        """
        limits = {
            SubscriptionPlanEnum.FREE: 1,  # 1 бесплатная консультация
            SubscriptionPlanEnum.BASIC: 5,  # 5 консультаций
            SubscriptionPlanEnum.PRO: 15,  # 15 консультаций
            SubscriptionPlanEnum.ENTERPRISE: -1,  # Безлимит
        }
        return limits[self.value]

    def get_discount_percent(self) -> float:
        """
        Получить скидку на платные консультации.

        Returns:
            Процент скидки
        """
        discounts = {
            SubscriptionPlanEnum.FREE: 0.0,
            SubscriptionPlanEnum.BASIC: 10.0,  # 10% скидка
            SubscriptionPlanEnum.PRO: 20.0,  # 20% скидка
            SubscriptionPlanEnum.ENTERPRISE: 30.0,  # 30% скидка
        }
        return discounts[self.value]

    def has_priority_support(self) -> bool:
        """Проверка наличия приоритетной поддержки."""
        return self.value in [
            SubscriptionPlanEnum.PRO,
            SubscriptionPlanEnum.ENTERPRISE,
        ]

    def has_document_analysis(self) -> bool:
        """Проверка наличия AI анализа документов."""
        return self.value != SubscriptionPlanEnum.FREE

    def get_display_name(self) -> str:
        """Получить отображаемое имя плана."""
        names = {
            SubscriptionPlanEnum.FREE: "Бесплатный",
            SubscriptionPlanEnum.BASIC: "Базовый",
            SubscriptionPlanEnum.PRO: "Премиум",
            SubscriptionPlanEnum.ENTERPRISE: "Корпоративный",
        }
        return names[self.value]

    @classmethod
    def free(cls) -> "SubscriptionPlan":
        """Создает FREE план."""
        return cls(value=SubscriptionPlanEnum.FREE)

    @classmethod
    def basic(cls) -> "SubscriptionPlan":
        """Создает BASIC план."""
        return cls(value=SubscriptionPlanEnum.BASIC)

    @classmethod
    def pro(cls) -> "SubscriptionPlan":
        """Создает PRO план."""
        return cls(value=SubscriptionPlanEnum.PRO)

    @classmethod
    def enterprise(cls) -> "SubscriptionPlan":
        """Создает ENTERPRISE план."""
        return cls(value=SubscriptionPlanEnum.ENTERPRISE)
