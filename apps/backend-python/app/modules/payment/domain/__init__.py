"""
Payment Domain Layer

Domain Layer для модуля платежей.
Содержит бизнес-логику, entities, value objects, события и интерфейсы репозиториев.
"""
# Value Objects
from app.modules.payment.domain.value_objects import (
    PaymentStatus,
    PaymentStatusEnum,
    PaymentMethod,
    PaymentMethodEnum,
    Money,
    SubscriptionPlan,
    SubscriptionPlanEnum,
    RefundReason,
    RefundReasonEnum,
)

# Entities
from app.modules.payment.domain.entities import Payment, Subscription

# Events
from app.modules.payment.domain.events import (
    PaymentCreatedEvent,
    PaymentProcessingEvent,
    PaymentSucceededEvent,
    PaymentFailedEvent,
    RefundRequestedEvent,
    PaymentRefundedEvent,
    SubscriptionCreatedEvent,
    SubscriptionActivatedEvent,
    SubscriptionCancelledEvent,
    SubscriptionExpiredEvent,
    SubscriptionRenewedEvent,
)

# Repository Interfaces
from app.modules.payment.domain.repositories import (
    IPaymentRepository,
    ISubscriptionRepository,
)

__all__ = [
    # Value Objects
    "PaymentStatus",
    "PaymentStatusEnum",
    "PaymentMethod",
    "PaymentMethodEnum",
    "Money",
    "SubscriptionPlan",
    "SubscriptionPlanEnum",
    "RefundReason",
    "RefundReasonEnum",
    # Entities
    "Payment",
    "Subscription",
    # Events
    "PaymentCreatedEvent",
    "PaymentProcessingEvent",
    "PaymentSucceededEvent",
    "PaymentFailedEvent",
    "RefundRequestedEvent",
    "PaymentRefundedEvent",
    "SubscriptionCreatedEvent",
    "SubscriptionActivatedEvent",
    "SubscriptionCancelledEvent",
    "SubscriptionExpiredEvent",
    "SubscriptionRenewedEvent",
    # Repository Interfaces
    "IPaymentRepository",
    "ISubscriptionRepository",
]
