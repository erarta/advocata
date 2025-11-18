"""
Lawyer Presentation Layer

FastAPI endpoints и schemas для Lawyer Module.
"""

from .api.lawyer_router import router as lawyer_router
from .schemas.requests import (
    RegisterLawyerRequest,
    SearchLawyersRequest,
    UpdateAvailabilityRequest,
)
from .schemas.responses import (
    ErrorResponse,
    LawyerListResponse,
    LawyerResponse,
    LawyerSearchResponse,
)

__all__ = [
    # Router
    "lawyer_router",
    # Requests
    "RegisterLawyerRequest",
    "SearchLawyersRequest",
    "UpdateAvailabilityRequest",
    # Responses
    "LawyerResponse",
    "LawyerListResponse",
    "LawyerSearchResponse",
    "ErrorResponse",
]
