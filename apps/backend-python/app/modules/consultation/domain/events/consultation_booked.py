"""
Consultation Booked Event

Событие: консультация забронирована клиентом.
"""
from dataclasses import dataclass
from typing import Optional

from app.core.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class ConsultationBookedEvent(DomainEvent):
    """
    Событие бронирования консультации.

    Attributes:
        consultation_id: ID консультации
        client_id: ID клиента
        lawyer_id: ID юриста
        consultation_type: Тип консультации (emergency/scheduled)
        price_amount: Цена консультации
        scheduled_time: Запланированное время (для scheduled)
    """

    consultation_id: str
    client_id: str
    lawyer_id: str
    consultation_type: str
    price_amount: float
    scheduled_time: Optional[str] = None  # ISO format
