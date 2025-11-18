"""
Consultation Application Layer

Application Layer для модуля консультаций.
Содержит команды, запросы и DTOs.
"""
# Commands
from app.modules.consultation.application.commands import (
    BookConsultationCommand,
    BookConsultationHandler,
    ConfirmConsultationCommand,
    ConfirmConsultationHandler,
    StartConsultationCommand,
    StartConsultationHandler,
    CompleteConsultationCommand,
    CompleteConsultationHandler,
    CancelConsultationCommand,
    CancelConsultationHandler,
    RateConsultationCommand,
    RateConsultationHandler,
)

# Queries
from app.modules.consultation.application.queries import (
    GetConsultationByIdQuery,
    GetConsultationByIdHandler,
    GetConsultationsByClientQuery,
    GetConsultationsByClientHandler,
    GetConsultationsByLawyerQuery,
    GetConsultationsByLawyerHandler,
    GetPendingConsultationsQuery,
    GetPendingConsultationsHandler,
)

# DTOs
from app.modules.consultation.application.dtos import (
    ConsultationDTO,
    ConsultationListItemDTO,
    ConsultationSearchResultDTO,
    CreateConsultationRequestDTO,
    ConfirmConsultationRequestDTO,
    CancelConsultationRequestDTO,
    RateConsultationRequestDTO,
)

__all__ = [
    # Commands
    "BookConsultationCommand",
    "BookConsultationHandler",
    "ConfirmConsultationCommand",
    "ConfirmConsultationHandler",
    "StartConsultationCommand",
    "StartConsultationHandler",
    "CompleteConsultationCommand",
    "CompleteConsultationHandler",
    "CancelConsultationCommand",
    "CancelConsultationHandler",
    "RateConsultationCommand",
    "RateConsultationHandler",
    # Queries
    "GetConsultationByIdQuery",
    "GetConsultationByIdHandler",
    "GetConsultationsByClientQuery",
    "GetConsultationsByClientHandler",
    "GetConsultationsByLawyerQuery",
    "GetConsultationsByLawyerHandler",
    "GetPendingConsultationsQuery",
    "GetPendingConsultationsHandler",
    # DTOs
    "ConsultationDTO",
    "ConsultationListItemDTO",
    "ConsultationSearchResultDTO",
    "CreateConsultationRequestDTO",
    "ConfirmConsultationRequestDTO",
    "CancelConsultationRequestDTO",
    "RateConsultationRequestDTO",
]
