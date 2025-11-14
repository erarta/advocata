"""
Domain Events для Lawyer Module

События, происходящие в домене Lawyer.
"""

from .lawyer_registered import LawyerRegisteredEvent
from .lawyer_verified import LawyerVerifiedEvent
from .lawyer_availability_updated import LawyerAvailabilityUpdatedEvent

__all__ = [
    "LawyerRegisteredEvent",
    "LawyerVerifiedEvent",
    "LawyerAvailabilityUpdatedEvent",
]
