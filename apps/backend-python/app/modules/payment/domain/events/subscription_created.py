"""Subscription Created Event"""
from dataclasses import dataclass
from uuid import UUID
from app.core.domain.domain_event import DomainEvent

@dataclass(frozen=True)
class SubscriptionCreatedEvent(DomainEvent):
    """Event: Subscription created"""
    subscription_id: UUID
    user_id: UUID
    plan: str
