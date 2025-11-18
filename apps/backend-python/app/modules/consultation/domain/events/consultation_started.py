"""
Consultation Started Event

Событие: консультация началась.
"""
from dataclasses import dataclass

from app.core.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class ConsultationStartedEvent(DomainEvent):
    """
    Событие начала консультации.

    Attributes:
        consultation_id: ID консультации
        client_id: ID клиента
        lawyer_id: ID юриста
        started_at: Время начала (ISO format)
    """

    consultation_id: str
    client_id: str
    lawyer_id: str
    started_at: str
