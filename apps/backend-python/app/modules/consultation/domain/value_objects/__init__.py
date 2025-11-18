"""
Value Objects для Consultation Module
"""
from app.modules.consultation.domain.value_objects.consultation_status import (
    ConsultationStatus,
    ConsultationStatusEnum,
)
from app.modules.consultation.domain.value_objects.consultation_type import (
    ConsultationType,
    ConsultationTypeEnum,
)
from app.modules.consultation.domain.value_objects.time_slot import TimeSlot
from app.modules.consultation.domain.value_objects.price import Price

__all__ = [
    "ConsultationStatus",
    "ConsultationStatusEnum",
    "ConsultationType",
    "ConsultationTypeEnum",
    "TimeSlot",
    "Price",
]
