"""
Payment Entity

Aggregate Root для платежей.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from app.core.domain.aggregate_root import AggregateRoot
from app.core.domain.result import Result
from app.modules.payment.domain.value_objects import (
    PaymentStatus,
    PaymentStatusEnum,
    PaymentMethod,
    Money,
    RefundReason,
)
from app.modules.payment.domain.events import (
    PaymentCreatedEvent,
    PaymentProcessingEvent,
    PaymentSucceededEvent,
    PaymentFailedEvent,
    RefundRequestedEvent,
    PaymentRefundedEvent,
)


@dataclass
class Payment(AggregateRoot):
    """
    Payment Aggregate Root.

    Представляет платеж в системе с полным жизненным циклом.

    Attributes:
        _user_id: ID пользователя (клиента)
        _consultation_id: ID консультации (если платеж за консультацию)
        _subscription_id: ID подписки (если платеж за подписку)
        _amount: Сумма платежа
        _status: Статус платежа
        _payment_method: Способ оплаты
        _external_payment_id: ID платежа в платежной системе (ЮКасса)
        _failure_reason: Причина неудачи (если failed)
        _refund_reason: Причина возврата (если refunded)
        _refund_amount: Сумма возврата
        _processed_at: Время обработки
        _refunded_at: Время возврата
    """

    _user_id: UUID
    _amount: Money
    _status: PaymentStatus
    _payment_method: PaymentMethod
    _consultation_id: Optional[UUID] = None
    _subscription_id: Optional[UUID] = None
    _external_payment_id: Optional[str] = None
    _failure_reason: Optional[str] = None
    _refund_reason: Optional[RefundReason] = None
    _refund_amount: Optional[Money] = None
    _processed_at: Optional[datetime] = None
    _refunded_at: Optional[datetime] = None
    _metadata: dict = field(default_factory=dict)

    # Properties
    @property
    def user_id(self) -> UUID:
        return self._user_id

    @property
    def consultation_id(self) -> Optional[UUID]:
        return self._consultation_id

    @property
    def subscription_id(self) -> Optional[UUID]:
        return self._subscription_id

    @property
    def amount(self) -> Money:
        return self._amount

    @property
    def status(self) -> PaymentStatus:
        return self._status

    @property
    def payment_method(self) -> PaymentMethod:
        return self._payment_method

    @property
    def external_payment_id(self) -> Optional[str]:
        return self._external_payment_id

    @property
    def failure_reason(self) -> Optional[str]:
        return self._failure_reason

    @property
    def refund_reason(self) -> Optional[RefundReason]:
        return self._refund_reason

    @property
    def refund_amount(self) -> Optional[Money]:
        return self._refund_amount

    @property
    def processed_at(self) -> Optional[datetime]:
        return self._processed_at

    @property
    def refunded_at(self) -> Optional[datetime]:
        return self._refunded_at

    @property
    def metadata(self) -> dict:
        return self._metadata

    # Factory Methods
    @classmethod
    def create_consultation_payment(
        cls,
        user_id: UUID,
        consultation_id: UUID,
        amount: Money,
        payment_method: PaymentMethod,
    ) -> Result["Payment"]:
        """
        Создать платеж за консультацию.

        Args:
            user_id: ID пользователя
            consultation_id: ID консультации
            amount: Сумма платежа
            payment_method: Способ оплаты

        Returns:
            Result с Payment или ошибкой
        """
        if not amount.is_positive():
            return Result.fail("Payment amount must be positive")

        payment = cls(
            _id=uuid4(),
            _user_id=user_id,
            _consultation_id=consultation_id,
            _amount=amount,
            _status=PaymentStatus.pending(),
            _payment_method=payment_method,
            _created_at=datetime.utcnow(),
            _updated_at=datetime.utcnow(),
        )

        payment.add_domain_event(
            PaymentCreatedEvent(
                payment_id=payment.id,
                user_id=user_id,
                consultation_id=consultation_id,
                amount=amount.amount,
                currency=amount.currency,
                payment_method=payment_method.value,
            )
        )

        return Result.ok(payment)

    @classmethod
    def create_subscription_payment(
        cls,
        user_id: UUID,
        subscription_id: UUID,
        amount: Money,
        payment_method: PaymentMethod,
    ) -> Result["Payment"]:
        """
        Создать платеж за подписку.

        Args:
            user_id: ID пользователя
            subscription_id: ID подписки
            amount: Сумма платежа
            payment_method: Способ оплаты

        Returns:
            Result с Payment или ошибкой
        """
        if not amount.is_positive():
            return Result.fail("Payment amount must be positive")

        payment = cls(
            _id=uuid4(),
            _user_id=user_id,
            _subscription_id=subscription_id,
            _amount=amount,
            _status=PaymentStatus.pending(),
            _payment_method=payment_method,
            _created_at=datetime.utcnow(),
            _updated_at=datetime.utcnow(),
        )

        payment.add_domain_event(
            PaymentCreatedEvent(
                payment_id=payment.id,
                user_id=user_id,
                subscription_id=subscription_id,
                amount=amount.amount,
                currency=amount.currency,
                payment_method=payment_method.value,
            )
        )

        return Result.ok(payment)

    # Business Logic Methods
    def start_processing(self, external_payment_id: str) -> Result[None]:
        """
        Начать обработку платежа.

        Args:
            external_payment_id: ID платежа в платежной системе

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.is_pending():
            return Result.fail("Can only start processing pending payments")

        self._status = PaymentStatus.processing()
        self._external_payment_id = external_payment_id
        self._updated_at = datetime.utcnow()

        self.add_domain_event(
            PaymentProcessingEvent(
                payment_id=self.id,
                external_payment_id=external_payment_id,
            )
        )

        return Result.ok()

    def mark_succeeded(self) -> Result[None]:
        """
        Отметить платеж как успешный.

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.is_processing():
            return Result.fail("Can only succeed processing payments")

        self._status = PaymentStatus.succeeded()
        self._processed_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

        self.add_domain_event(
            PaymentSucceededEvent(
                payment_id=self.id,
                user_id=self._user_id,
                consultation_id=self._consultation_id,
                subscription_id=self._subscription_id,
                amount=self._amount.amount,
                currency=self._amount.currency,
            )
        )

        return Result.ok()

    def mark_failed(self, reason: str) -> Result[None]:
        """
        Отметить платеж как неудачный.

        Args:
            reason: Причина неудачи

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.is_processing():
            return Result.fail("Can only fail processing payments")

        if not reason or len(reason) < 3:
            return Result.fail("Failure reason must be at least 3 characters")

        self._status = PaymentStatus.failed()
        self._failure_reason = reason
        self._processed_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

        self.add_domain_event(
            PaymentFailedEvent(
                payment_id=self.id,
                user_id=self._user_id,
                reason=reason,
            )
        )

        return Result.ok()

    def request_refund(self, reason: RefundReason, amount: Optional[Money] = None) -> Result[None]:
        """
        Запросить возврат платежа.

        Args:
            reason: Причина возврата
            amount: Сумма возврата (если частичный, иначе полный)

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.is_succeeded():
            return Result.fail("Can only refund succeeded payments")

        # Определяем сумму возврата
        refund_amount = amount if amount else self._amount

        # Проверяем, что сумма возврата не превышает исходную
        if refund_amount.amount > self._amount.amount:
            return Result.fail("Refund amount cannot exceed payment amount")

        if refund_amount.currency != self._amount.currency:
            return Result.fail("Refund currency must match payment currency")

        self._status = PaymentStatus.refund_pending()
        self._refund_reason = reason
        self._refund_amount = refund_amount
        self._updated_at = datetime.utcnow()

        self.add_domain_event(
            RefundRequestedEvent(
                payment_id=self.id,
                user_id=self._user_id,
                refund_amount=refund_amount.amount,
                currency=refund_amount.currency,
                reason=reason.value,
                reason_comment=reason.comment,
            )
        )

        return Result.ok()

    def mark_refunded(self) -> Result[None]:
        """
        Отметить возврат как выполненный.

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.is_refund_pending():
            return Result.fail("Can only complete refund for refund_pending payments")

        self._status = PaymentStatus.refunded()
        self._refunded_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

        self.add_domain_event(
            PaymentRefundedEvent(
                payment_id=self.id,
                user_id=self._user_id,
                refund_amount=self._refund_amount.amount if self._refund_amount else self._amount.amount,
                currency=self._amount.currency,
            )
        )

        return Result.ok()

    def is_for_consultation(self) -> bool:
        """Проверка, является ли платеж за консультацию."""
        return self._consultation_id is not None

    def is_for_subscription(self) -> bool:
        """Проверка, является ли платеж за подписку."""
        return self._subscription_id is not None
