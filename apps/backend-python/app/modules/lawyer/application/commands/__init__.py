"""
Commands для Lawyer Module

Команды для изменения состояния юристов.
"""

from .register_lawyer import RegisterLawyerCommand
from .register_lawyer_handler import RegisterLawyerHandler
from .verify_lawyer import VerifyLawyerCommand
from .verify_lawyer_handler import VerifyLawyerHandler
from .update_availability import UpdateAvailabilityCommand
from .update_availability_handler import UpdateAvailabilityHandler

__all__ = [
    "RegisterLawyerCommand",
    "RegisterLawyerHandler",
    "VerifyLawyerCommand",
    "VerifyLawyerHandler",
    "UpdateAvailabilityCommand",
    "UpdateAvailabilityHandler",
]
