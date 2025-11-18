"""Subscription Renewed Event"""
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class SubscriptionRenewedEvent(DomainEvent):
    """Event: Subscription renewed"""
    subscription_id: UUID
    user_id: UUID
    plan: str
    old_end_date: datetime
    new_end_date: datetime
