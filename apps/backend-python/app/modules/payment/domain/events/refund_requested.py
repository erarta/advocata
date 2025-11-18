"""Refund Requested Event"""
from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class RefundRequestedEvent(DomainEvent):
    """Event: Refund requested for payment"""
    payment_id: UUID
    user_id: UUID
    refund_amount: Decimal
    currency: str
    reason: str
    reason_comment: str = ""
