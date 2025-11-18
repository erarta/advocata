"""
Dependencies для Consultation Presentation Layer
"""
from app.modules.consultation.presentation.dependencies.consultation_deps import (
    get_consultation_repository,
    get_book_consultation_handler,
    get_confirm_consultation_handler,
    get_start_consultation_handler,
    get_complete_consultation_handler,
    get_cancel_consultation_handler,
    get_rate_consultation_handler,
    get_consultation_by_id_handler,
    get_consultations_by_client_handler,
    get_consultations_by_lawyer_handler,
    get_pending_consultations_handler,
    # Type aliases
    ConsultationRepositoryDep,
    BookConsultationHandlerDep,
    ConfirmConsultationHandlerDep,
    StartConsultationHandlerDep,
    CompleteConsultationHandlerDep,
    CancelConsultationHandlerDep,
    RateConsultationHandlerDep,
    GetConsultationByIdHandlerDep,
    GetConsultationsByClientHandlerDep,
    GetConsultationsByLawyerHandlerDep,
    GetPendingConsultationsHandlerDep,
)

__all__ = [
    # Factory functions
    "get_consultation_repository",
    "get_book_consultation_handler",
    "get_confirm_consultation_handler",
    "get_start_consultation_handler",
    "get_complete_consultation_handler",
    "get_cancel_consultation_handler",
    "get_rate_consultation_handler",
    "get_consultation_by_id_handler",
    "get_consultations_by_client_handler",
    "get_consultations_by_lawyer_handler",
    "get_pending_consultations_handler",
    # Type aliases
    "ConsultationRepositoryDep",
    "BookConsultationHandlerDep",
    "ConfirmConsultationHandlerDep",
    "StartConsultationHandlerDep",
    "CompleteConsultationHandlerDep",
    "CancelConsultationHandlerDep",
    "RateConsultationHandlerDep",
    "GetConsultationByIdHandlerDep",
    "GetConsultationsByClientHandlerDep",
    "GetConsultationsByLawyerHandlerDep",
    "GetPendingConsultationsHandlerDep",
]
