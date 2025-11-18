"""
Consultation Confirmed Event

Событие: консультация подтверждена юристом.
"""
from dataclasses import dataclass

from app.core.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class ConsultationConfirmedEvent(DomainEvent):
    """
    Событие подтверждения консультации юристом.

    Attributes:
        consultation_id: ID консультации
        lawyer_id: ID юриста
        confirmed_at: Время подтверждения (ISO format)
    """

    consultation_id: str
    lawyer_id: str
    confirmed_at: str
