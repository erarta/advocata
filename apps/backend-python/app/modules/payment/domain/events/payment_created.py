"""Payment Created Event"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class PaymentCreatedEvent(DomainEvent):
    payment_id: UUID
    user_id: UUID
    amount: Decimal
    currency: str
    payment_method: str
    consultation_id: Optional[UUID] = None
    subscription_id: Optional[UUID] = None
