"""
Consultation Cancelled Event

Событие: консультация отменена.
"""
from dataclasses import dataclass

from app.core.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class ConsultationCancelledEvent(DomainEvent):
    """
    Событие отмены консультации.

    Attributes:
        consultation_id: ID консультации
        client_id: ID клиента
        lawyer_id: ID юриста
        cancelled_by: Кто отменил (client/lawyer)
        reason: Причина отмены
        cancelled_at: Время отмены (ISO format)
    """

    consultation_id: str
    client_id: str
    lawyer_id: str
    cancelled_by: str
    reason: str
    cancelled_at: str
