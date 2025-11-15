"""
Payment DTOs

DTOs для платежей (запросы и ответы API).
"""
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.modules.payment.domain import (
    Payment,
    PaymentStatusEnum,
    PaymentMethodEnum,
    RefundReasonEnum,
)


# ========== Response DTOs ==========


class PaymentDTO(BaseModel):
    """Полная DTO платежа для детального просмотра"""

    id: UUID
    user_id: UUID
    consultation_id: Optional[UUID] = None
    subscription_id: Optional[UUID] = None

    # Amount
    amount: Decimal
    currency: str

    # Status and Method
    status: PaymentStatusEnum
    payment_method: PaymentMethodEnum

    # External
    external_payment_id: Optional[str] = None

    # Failure
    failure_reason: Optional[str] = None

    # Refund
    refund_amount: Optional[Decimal] = None
    refund_reason: Optional[RefundReasonEnum] = None
    refund_reason_comment: Optional[str] = None

    # Timestamps
    processed_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_entity(cls, entity: Payment) -> "PaymentDTO":
        """Создает DTO из Domain Entity"""
        return cls(
            id=entity.id,
            user_id=entity.user_id,
            consultation_id=entity.consultation_id,
            subscription_id=entity.subscription_id,
            amount=entity.amount.amount,
            currency=entity.amount.currency,
            status=entity.status.value,
            payment_method=entity.payment_method.value,
            external_payment_id=entity.external_payment_id,
            failure_reason=entity.failure_reason,
            refund_amount=entity.refund_amount.amount if entity.refund_amount else None,
            refund_reason=entity.refund_reason.value if entity.refund_reason else None,
            refund_reason_comment=entity.refund_reason.comment if entity.refund_reason else None,
            processed_at=entity.processed_at,
            refunded_at=entity.refunded_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )


class PaymentListItemDTO(BaseModel):
    """Сокращенная DTO платежа для списков"""

    id: UUID
    amount: Decimal
    currency: str
    status: PaymentStatusEnum
    payment_method: PaymentMethodEnum
    consultation_id: Optional[UUID] = None
    subscription_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_entity(cls, entity: Payment) -> "PaymentListItemDTO":
        """Создает DTO из Domain Entity"""
        return cls(
            id=entity.id,
            amount=entity.amount.amount,
            currency=entity.amount.currency,
            status=entity.status.value,
            payment_method=entity.payment_method.value,
            consultation_id=entity.consultation_id,
            subscription_id=entity.subscription_id,
            created_at=entity.created_at,
        )


class PaymentSearchResultDTO(BaseModel):
    """DTO для результатов поиска с пагинацией"""

    items: List[PaymentListItemDTO]
    total: int
    limit: int
    offset: int

    @property
    def has_more(self) -> bool:
        """Есть ли еще результаты после текущей страницы"""
        return self.offset + self.limit < self.total


# ========== Request DTOs ==========


class CreatePaymentRequestDTO(BaseModel):
    """DTO для создания платежа"""

    consultation_id: Optional[UUID] = Field(None, description="ID консультации (если платеж за консультацию)")
    subscription_id: Optional[UUID] = Field(None, description="ID подписки (если платеж за подписку)")
    amount: Decimal = Field(..., gt=0, description="Сумма платежа")
    currency: str = Field(default="RUB", description="Валюта")
    payment_method: PaymentMethodEnum = Field(default=PaymentMethodEnum.BANK_CARD, description="Способ оплаты")

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Валидация валюты"""
        allowed_currencies = ["RUB", "USD", "EUR"]
        if v not in allowed_currencies:
            raise ValueError(f"Currency must be one of: {allowed_currencies}")
        return v

    def validate_payment_type(self) -> None:
        """Валидация типа платежа"""
        if not self.consultation_id and not self.subscription_id:
            raise ValueError("Either consultation_id or subscription_id must be provided")
        if self.consultation_id and self.subscription_id:
            raise ValueError("Cannot specify both consultation_id and subscription_id")


class RequestRefundRequestDTO(BaseModel):
    """DTO для запроса возврата"""

    reason: RefundReasonEnum = Field(..., description="Причина возврата")
    reason_comment: str = Field(default="", max_length=500, description="Комментарий к причине")
    refund_amount: Optional[Decimal] = Field(None, gt=0, description="Сумма возврата (если частичный)")
