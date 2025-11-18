"""
Payment Mapper

Mapper для конвертации между Payment Entity и PaymentModel.
"""
from app.modules.payment.domain import (
    Payment,
    PaymentStatus,
    PaymentMethod,
    Money,
    RefundReason,
)
from app.modules.payment.infrastructure.persistence.models import PaymentModel


class PaymentMapper:
    """
    Mapper для конвертации Payment Entity <-> PaymentModel.
    """

    @staticmethod
    def to_domain(model: PaymentModel) -> Payment:
        """
        Конвертирует ORM модель в Domain Entity.
        """
        # Создаем Value Objects
        status = PaymentStatus(value=model.status)
        payment_method = PaymentMethod(value=model.payment_method)
        amount = Money(amount=model.amount, currency=model.currency)

        # Refund amount
        refund_amount = None
        if model.refund_amount:
            refund_amount = Money(amount=model.refund_amount, currency=model.currency)

        # Refund reason
        refund_reason = None
        if model.refund_reason:
            refund_reason = RefundReason(
                value=model.refund_reason,
                comment=model.refund_reason_comment or "",
            )

        # Создаем Entity через __new__ (восстановление из БД)
        payment = Payment.__new__(Payment)
        payment._id = model.id
        payment._user_id = model.user_id
        payment._consultation_id = model.consultation_id
        payment._subscription_id = model.subscription_id
        payment._amount = amount
        payment._status = status
        payment._payment_method = payment_method
        payment._external_payment_id = model.external_payment_id
        payment._failure_reason = model.failure_reason
        payment._refund_reason = refund_reason
        payment._refund_amount = refund_amount
        payment._processed_at = model.processed_at
        payment._refunded_at = model.refunded_at
        payment._metadata = model.metadata or {}
        payment._created_at = model.created_at
        payment._updated_at = model.updated_at
        payment._domain_events = []

        return payment

    @staticmethod
    def to_model(entity: Payment) -> PaymentModel:
        """
        Конвертирует Domain Entity в ORM модель.
        """
        return PaymentModel(
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
            metadata=entity.metadata,
            processed_at=entity.processed_at,
            refunded_at=entity.refunded_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    @staticmethod
    def update_model(entity: Payment, model: PaymentModel) -> None:
        """
        Обновляет существующую ORM модель данными из Entity.
        """
        model.status = entity.status.value
        model.external_payment_id = entity.external_payment_id
        model.failure_reason = entity.failure_reason
        model.refund_amount = entity.refund_amount.amount if entity.refund_amount else None
        model.refund_reason = entity.refund_reason.value if entity.refund_reason else None
        model.refund_reason_comment = entity.refund_reason.comment if entity.refund_reason else None
        model.processed_at = entity.processed_at
        model.refunded_at = entity.refunded_at
        model.metadata = entity.metadata
        model.updated_at = entity.updated_at
