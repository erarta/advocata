"""Payment Processing Event"""
from dataclasses import dataclass
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class PaymentProcessingEvent(DomainEvent):
    """Event: Payment started processing"""
    payment_id: UUID
    external_payment_id: str
