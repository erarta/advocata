"""Payment Refunded Event"""
from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class PaymentRefundedEvent(DomainEvent):
    """Event: Payment refunded"""
    payment_id: UUID
    user_id: UUID
    refund_amount: Decimal
    currency: str
