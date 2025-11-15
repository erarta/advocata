"""
Refund Reason Value Object

Причина возврата платежа.
"""
from dataclasses import dataclass
from enum import Enum

from app.core.domain.value_object import ValueObject


class RefundReasonEnum(str, Enum):
    """
    Перечисление причин возврата.
    """

    CONSULTATION_CANCELLED = "consultation_cancelled"  # Консультация отменена
    LAWYER_NO_SHOW = "lawyer_no_show"  # Юрист не появился
    CLIENT_REQUEST = "client_request"  # Запрос клиента
    POOR_SERVICE = "poor_service"  # Плохое качество услуги
    TECHNICAL_ISSUE = "technical_issue"  # Техническая проблема
    DUPLICATE_PAYMENT = "duplicate_payment"  # Дублирование платежа
    FRAUDULENT = "fraudulent"  # Мошенничество
    OTHER = "other"  # Другая причина


@dataclass(frozen=True)
class RefundReason(ValueObject):
    """
    Value Object для причины возврата.

    Attributes:
        value: Причина возврата
        comment: Дополнительный комментарий
    """

    value: RefundReasonEnum
    comment: str = ""

    def __post_init__(self):
        """Валидация причины возврата."""
        if not isinstance(self.value, RefundReasonEnum):
            raise ValueError(f"Invalid refund reason: {self.value}")

        if len(self.comment) > 500:
            raise ValueError("Refund reason comment cannot exceed 500 characters")

    def requires_manual_review(self) -> bool:
        """
        Проверка, требуется ли ручная проверка возврата.

        Некоторые причины требуют проверки администратором.
        """
        manual_review_reasons = [
            RefundReasonEnum.FRAUDULENT,
            RefundReasonEnum.POOR_SERVICE,
        ]
        return self.value in manual_review_reasons

    def is_automatic_refund(self) -> bool:
        """
        Проверка, может ли возврат быть автоматическим.

        Некоторые причины позволяют автоматический возврат.
        """
        automatic_reasons = [
            RefundReasonEnum.CONSULTATION_CANCELLED,
            RefundReasonEnum.DUPLICATE_PAYMENT,
            RefundReasonEnum.TECHNICAL_ISSUE,
        ]
        return self.value in automatic_reasons

    def get_display_name(self) -> str:
        """Получить отображаемое имя причины."""
        names = {
            RefundReasonEnum.CONSULTATION_CANCELLED: "Консультация отменена",
            RefundReasonEnum.LAWYER_NO_SHOW: "Юрист не вышел на связь",
            RefundReasonEnum.CLIENT_REQUEST: "Запрос клиента",
            RefundReasonEnum.POOR_SERVICE: "Низкое качество услуги",
            RefundReasonEnum.TECHNICAL_ISSUE: "Техническая проблема",
            RefundReasonEnum.DUPLICATE_PAYMENT: "Дублирование платежа",
            RefundReasonEnum.FRAUDULENT: "Мошенничество",
            RefundReasonEnum.OTHER: "Другая причина",
        }
        return names.get(self.value, str(self.value))

    @classmethod
    def consultation_cancelled(cls, comment: str = "") -> "RefundReason":
        """Создает причину CONSULTATION_CANCELLED."""
        return cls(value=RefundReasonEnum.CONSULTATION_CANCELLED, comment=comment)

    @classmethod
    def lawyer_no_show(cls, comment: str = "") -> "RefundReason":
        """Создает причину LAWYER_NO_SHOW."""
        return cls(value=RefundReasonEnum.LAWYER_NO_SHOW, comment=comment)

    @classmethod
    def client_request(cls, comment: str = "") -> "RefundReason":
        """Создает причину CLIENT_REQUEST."""
        return cls(value=RefundReasonEnum.CLIENT_REQUEST, comment=comment)
