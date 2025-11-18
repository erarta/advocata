"""
Value Objects для Lawyer Domain

Неизменяемые объекты-значения для домена Lawyer.
"""

from .experience import Experience
from .specialization import Specialization
from .verification_status import VerificationStatus
from .rating import Rating
from .price import Price

__all__ = [
    "Experience",
    "Specialization",
    "VerificationStatus",
    "Rating",
    "Price",
]
