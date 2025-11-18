"""
Domain Events для Consultation Module
"""
from app.modules.consultation.domain.events.consultation_booked import (
    ConsultationBookedEvent,
)
from app.modules.consultation.domain.events.consultation_confirmed import (
    ConsultationConfirmedEvent,
)
from app.modules.consultation.domain.events.consultation_started import (
    ConsultationStartedEvent,
)
from app.modules.consultation.domain.events.consultation_completed import (
    ConsultationCompletedEvent,
)
from app.modules.consultation.domain.events.consultation_cancelled import (
    ConsultationCancelledEvent,
)

__all__ = [
    "ConsultationBookedEvent",
    "ConsultationConfirmedEvent",
    "ConsultationStartedEvent",
    "ConsultationCompletedEvent",
    "ConsultationCancelledEvent",
]
