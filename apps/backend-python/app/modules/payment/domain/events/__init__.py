"""
Domain Events для Payment Module
"""
from app.modules.payment.domain.events.payment_created import PaymentCreatedEvent
from app.modules.payment.domain.events.payment_processing import PaymentProcessingEvent
from app.modules.payment.domain.events.payment_succeeded import PaymentSucceededEvent
from app.modules.payment.domain.events.payment_failed import PaymentFailedEvent
from app.modules.payment.domain.events.refund_requested import RefundRequestedEvent
from app.modules.payment.domain.events.payment_refunded import PaymentRefundedEvent
from app.modules.payment.domain.events.subscription_created import (
    SubscriptionCreatedEvent,
)
from app.modules.payment.domain.events.subscription_activated import (
    SubscriptionActivatedEvent,
)
from app.modules.payment.domain.events.subscription_cancelled import (
    SubscriptionCancelledEvent,
)
from app.modules.payment.domain.events.subscription_expired import (
    SubscriptionExpiredEvent,
)
from app.modules.payment.domain.events.subscription_renewed import (
    SubscriptionRenewedEvent,
)

__all__ = [
    # Payment Events
    "PaymentCreatedEvent",
    "PaymentProcessingEvent",
    "PaymentSucceededEvent",
    "PaymentFailedEvent",
    "RefundRequestedEvent",
    "PaymentRefundedEvent",
    # Subscription Events
    "SubscriptionCreatedEvent",
    "SubscriptionActivatedEvent",
    "SubscriptionCancelledEvent",
    "SubscriptionExpiredEvent",
    "SubscriptionRenewedEvent",
]
