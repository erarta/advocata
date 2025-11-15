"""Subscription Expired Event"""
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class SubscriptionExpiredEvent(DomainEvent):
    """Event: Subscription expired"""
    subscription_id: UUID
    user_id: UUID
    plan: str
    expired_at: datetime
