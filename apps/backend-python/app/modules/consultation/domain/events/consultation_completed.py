"""
Consultation Completed Event

Событие: консультация завершена.
"""
from dataclasses import dataclass
from typing import Optional

from app.core.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class ConsultationCompletedEvent(DomainEvent):
    """
    Событие завершения консультации.

    Attributes:
        consultation_id: ID консультации
        client_id: ID клиента
        lawyer_id: ID юриста
        completed_at: Время завершения (ISO format)
        duration_minutes: Длительность в минутах
    """

    consultation_id: str
    client_id: str
    lawyer_id: str
    completed_at: str
    duration_minutes: Optional[int] = None
