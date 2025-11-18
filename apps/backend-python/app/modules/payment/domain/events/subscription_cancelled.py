"""Subscription Cancelled Event"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class SubscriptionCancelledEvent(DomainEvent):
    """Event: Subscription cancelled"""
    subscription_id: UUID
    user_id: UUID
    cancelled_at: datetime
    end_date: Optional[datetime] = None
