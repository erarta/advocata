"""
Queries для Consultation Application Layer
"""
from app.modules.consultation.application.queries.get_consultation_by_id import (
    GetConsultationByIdQuery,
    GetConsultationByIdHandler,
)
from app.modules.consultation.application.queries.get_consultations_by_client import (
    GetConsultationsByClientQuery,
    GetConsultationsByClientHandler,
)
from app.modules.consultation.application.queries.get_consultations_by_lawyer import (
    GetConsultationsByLawyerQuery,
    GetConsultationsByLawyerHandler,
)
from app.modules.consultation.application.queries.get_pending_consultations import (
    GetPendingConsultationsQuery,
    GetPendingConsultationsHandler,
)

__all__ = [
    # Get By ID
    "GetConsultationByIdQuery",
    "GetConsultationByIdHandler",
    # Get By Client
    "GetConsultationsByClientQuery",
    "GetConsultationsByClientHandler",
    # Get By Lawyer
    "GetConsultationsByLawyerQuery",
    "GetConsultationsByLawyerHandler",
    # Get Pending
    "GetPendingConsultationsQuery",
    "GetPendingConsultationsHandler",
]
