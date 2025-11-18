"""
Consultation Domain Layer

Domain Layer для модуля консультаций.
Содержит бизнес-логику и правила домена.
"""
from app.modules.consultation.domain.entities import Consultation
from app.modules.consultation.domain.value_objects import (
    ConsultationStatus,
    ConsultationStatusEnum,
    ConsultationType,
    ConsultationTypeEnum,
    TimeSlot,
    Price,
)
from app.modules.consultation.domain.events import (
    ConsultationBookedEvent,
    ConsultationConfirmedEvent,
    ConsultationStartedEvent,
    ConsultationCompletedEvent,
    ConsultationCancelledEvent,
)
from app.modules.consultation.domain.repositories import IConsultationRepository

__all__ = [
    # Entities
    "Consultation",
    # Value Objects
    "ConsultationStatus",
    "ConsultationStatusEnum",
    "ConsultationType",
    "ConsultationTypeEnum",
    "TimeSlot",
    "Price",
    # Events
    "ConsultationBookedEvent",
    "ConsultationConfirmedEvent",
    "ConsultationStartedEvent",
    "ConsultationCompletedEvent",
    "ConsultationCancelledEvent",
    # Repositories
    "IConsultationRepository",
]
