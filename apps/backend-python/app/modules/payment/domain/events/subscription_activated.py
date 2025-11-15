"""Subscription Activated Event"""
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class SubscriptionActivatedEvent(DomainEvent):
    """Event: Subscription activated"""
    subscription_id: UUID
    user_id: UUID
    plan: str
    start_date: datetime
    end_date: datetime
