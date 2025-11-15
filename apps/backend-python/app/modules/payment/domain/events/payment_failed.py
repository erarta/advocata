"""Payment Failed Event"""
from dataclasses import dataclass
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class PaymentFailedEvent(DomainEvent):
    """Event: Payment failed"""
    payment_id: UUID
    user_id: UUID
    reason: str
