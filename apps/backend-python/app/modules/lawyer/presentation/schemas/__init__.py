"""
Pydantic Schemas для Lawyer Module

Request и Response schemas для API.
"""

from .requests import (
    RegisterLawyerRequest,
    UpdateAvailabilityRequest,
    SearchLawyersRequest,
)
from .responses import (
    LawyerResponse,
    LawyerListResponse,
    LawyerSearchResponse,
    ErrorResponse,
)

__all__ = [
    # Requests
    "RegisterLawyerRequest",
    "UpdateAvailabilityRequest",
    "SearchLawyersRequest",
    # Responses
    "LawyerResponse",
    "LawyerListResponse",
    "LawyerSearchResponse",
    "ErrorResponse",
]
