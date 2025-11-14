"""
Lawyer Domain Layer

Содержит бизнес-логику и правила для управления юристами.
"""

# Entities
from .entities.lawyer import Lawyer

# Value Objects
from .value_objects.experience import Experience
from .value_objects.price import Price
from .value_objects.rating import Rating
from .value_objects.specialization import Specialization, SpecializationType
from .value_objects.verification_status import (
    VerificationStatus,
    VerificationStatusType,
)

# Events
from .events.lawyer_registered import LawyerRegisteredEvent
from .events.lawyer_verified import LawyerVerifiedEvent
from .events.lawyer_availability_updated import LawyerAvailabilityUpdatedEvent

# Repositories
from .repositories.lawyer_repository import ILawyerRepository

# Services
from .services.lawyer_verification_service import LawyerVerificationService

__all__ = [
    # Entities
    "Lawyer",
    # Value Objects
    "Experience",
    "Price",
    "Rating",
    "Specialization",
    "SpecializationType",
    "VerificationStatus",
    "VerificationStatusType",
    # Events
    "LawyerRegisteredEvent",
    "LawyerVerifiedEvent",
    "LawyerAvailabilityUpdatedEvent",
    # Repositories
    "ILawyerRepository",
    # Services
    "LawyerVerificationService",
]
