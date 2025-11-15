"""
Payment Status Value Object

Статус платежа с валидацией переходов состояний.
"""
from dataclasses import dataclass
from enum import Enum
from typing import List

from app.core.domain.value_object import ValueObject


class PaymentStatusEnum(str, Enum):
    """
    Перечисление статусов платежа.

    Lifecycle:
    PENDING → PROCESSING → SUCCEEDED
                ↓
              FAILED

    SUCCEEDED → REFUND_PENDING → REFUNDED
    """

    PENDING = "pending"  # Создан, ожидает обработки
    PROCESSING = "processing"  # В процессе обработки
    SUCCEEDED = "succeeded"  # Успешно завершен
    FAILED = "failed"  # Не удался
    REFUND_PENDING = "refund_pending"  # Возврат в процессе
    REFUNDED = "refunded"  # Возврат выполнен
    CANCELLED = "cancelled"  # Отменен


@dataclass(frozen=True)
class PaymentStatus(ValueObject):
    """
    Value Object для статуса платежа.

    Attributes:
        value: Статус платежа
    """

    value: PaymentStatusEnum

    def __post_init__(self):
        """Валидация статуса."""
        if not isinstance(self.value, PaymentStatusEnum):
            raise ValueError(f"Invalid payment status: {self.value}")

    def is_pending(self) -> bool:
        """Проверка, ожидает ли платеж обработки."""
        return self.value == PaymentStatusEnum.PENDING

    def is_processing(self) -> bool:
        """Проверка, обрабатывается ли платеж."""
        return self.value == PaymentStatusEnum.PROCESSING

    def is_succeeded(self) -> bool:
        """Проверка, успешно ли завершен платеж."""
        return self.value == PaymentStatusEnum.SUCCEEDED

    def is_failed(self) -> bool:
        """Проверка, не удался ли платеж."""
        return self.value == PaymentStatusEnum.FAILED

    def is_refund_pending(self) -> bool:
        """Проверка, в процессе ли возврат."""
        return self.value == PaymentStatusEnum.REFUND_PENDING

    def is_refunded(self) -> bool:
        """Проверка, выполнен ли возврат."""
        return self.value == PaymentStatusEnum.REFUNDED

    def is_cancelled(self) -> bool:
        """Проверка, отменен ли платеж."""
        return self.value == PaymentStatusEnum.CANCELLED

    def is_final(self) -> bool:
        """Проверка, является ли статус финальным (не может измениться)."""
        return self.value in [
            PaymentStatusEnum.SUCCEEDED,
            PaymentStatusEnum.FAILED,
            PaymentStatusEnum.REFUNDED,
            PaymentStatusEnum.CANCELLED,
        ]

    def can_transition_to(self, new_status: "PaymentStatus") -> bool:
        """
        Проверяет возможность перехода в новый статус.

        Args:
            new_status: Новый статус

        Returns:
            True если переход допустим
        """
        valid_transitions = {
            PaymentStatusEnum.PENDING: [
                PaymentStatusEnum.PROCESSING,
                PaymentStatusEnum.CANCELLED,
            ],
            PaymentStatusEnum.PROCESSING: [
                PaymentStatusEnum.SUCCEEDED,
                PaymentStatusEnum.FAILED,
            ],
            PaymentStatusEnum.SUCCEEDED: [PaymentStatusEnum.REFUND_PENDING],
            PaymentStatusEnum.REFUND_PENDING: [
                PaymentStatusEnum.REFUNDED,
                PaymentStatusEnum.SUCCEEDED,  # Возврат отменен
            ],
        }

        allowed = valid_transitions.get(self.value, [])
        return new_status.value in allowed

    @classmethod
    def pending(cls) -> "PaymentStatus":
        """Создает статус PENDING."""
        return cls(value=PaymentStatusEnum.PENDING)

    @classmethod
    def processing(cls) -> "PaymentStatus":
        """Создает статус PROCESSING."""
        return cls(value=PaymentStatusEnum.PROCESSING)

    @classmethod
    def succeeded(cls) -> "PaymentStatus":
        """Создает статус SUCCEEDED."""
        return cls(value=PaymentStatusEnum.SUCCEEDED)

    @classmethod
    def failed(cls) -> "PaymentStatus":
        """Создает статус FAILED."""
        return cls(value=PaymentStatusEnum.FAILED)

    @classmethod
    def refund_pending(cls) -> "PaymentStatus":
        """Создает статус REFUND_PENDING."""
        return cls(value=PaymentStatusEnum.REFUND_PENDING)

    @classmethod
    def refunded(cls) -> "PaymentStatus":
        """Создает статус REFUNDED."""
        return cls(value=PaymentStatusEnum.REFUNDED)

    @classmethod
    def cancelled(cls) -> "PaymentStatus":
        """Создает статус CANCELLED."""
        return cls(value=PaymentStatusEnum.CANCELLED)
