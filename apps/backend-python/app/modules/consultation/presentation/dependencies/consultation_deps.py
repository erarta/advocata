"""
Consultation Dependencies

Dependency Injection контейнеры для модуля консультаций.
"""
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.infrastructure.database import get_db
from app.modules.consultation.domain import IConsultationRepository
from app.modules.consultation.infrastructure import ConsultationRepositoryImpl
from app.modules.consultation.application import (
    BookConsultationHandler,
    ConfirmConsultationHandler,
    StartConsultationHandler,
    CompleteConsultationHandler,
    CancelConsultationHandler,
    RateConsultationHandler,
    GetConsultationByIdHandler,
    GetConsultationsByClientHandler,
    GetConsultationsByLawyerHandler,
    GetPendingConsultationsHandler,
)


# ========== Repository ==========


def get_consultation_repository(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> IConsultationRepository:
    """Factory для ConsultationRepository."""
    return ConsultationRepositoryImpl(session=db)


ConsultationRepositoryDep = Annotated[
    IConsultationRepository, Depends(get_consultation_repository)
]


# ========== Command Handlers ==========


def get_book_consultation_handler(
    repository: ConsultationRepositoryDep,
) -> BookConsultationHandler:
    """Factory для BookConsultationHandler."""
    return BookConsultationHandler(repository=repository)


BookConsultationHandlerDep = Annotated[
    BookConsultationHandler, Depends(get_book_consultation_handler)
]


def get_confirm_consultation_handler(
    repository: ConsultationRepositoryDep,
) -> ConfirmConsultationHandler:
    """Factory для ConfirmConsultationHandler."""
    return ConfirmConsultationHandler(repository=repository)


ConfirmConsultationHandlerDep = Annotated[
    ConfirmConsultationHandler, Depends(get_confirm_consultation_handler)
]


def get_start_consultation_handler(
    repository: ConsultationRepositoryDep,
) -> StartConsultationHandler:
    """Factory для StartConsultationHandler."""
    return StartConsultationHandler(repository=repository)


StartConsultationHandlerDep = Annotated[
    StartConsultationHandler, Depends(get_start_consultation_handler)
]


def get_complete_consultation_handler(
    repository: ConsultationRepositoryDep,
) -> CompleteConsultationHandler:
    """Factory для CompleteConsultationHandler."""
    return CompleteConsultationHandler(repository=repository)


CompleteConsultationHandlerDep = Annotated[
    CompleteConsultationHandler, Depends(get_complete_consultation_handler)
]


def get_cancel_consultation_handler(
    repository: ConsultationRepositoryDep,
) -> CancelConsultationHandler:
    """Factory для CancelConsultationHandler."""
    return CancelConsultationHandler(repository=repository)


CancelConsultationHandlerDep = Annotated[
    CancelConsultationHandler, Depends(get_cancel_consultation_handler)
]


def get_rate_consultation_handler(
    repository: ConsultationRepositoryDep,
) -> RateConsultationHandler:
    """Factory для RateConsultationHandler."""
    return RateConsultationHandler(repository=repository)


RateConsultationHandlerDep = Annotated[
    RateConsultationHandler, Depends(get_rate_consultation_handler)
]


# ========== Query Handlers ==========


def get_consultation_by_id_handler(
    repository: ConsultationRepositoryDep,
) -> GetConsultationByIdHandler:
    """Factory для GetConsultationByIdHandler."""
    return GetConsultationByIdHandler(repository=repository)


GetConsultationByIdHandlerDep = Annotated[
    GetConsultationByIdHandler, Depends(get_consultation_by_id_handler)
]


def get_consultations_by_client_handler(
    repository: ConsultationRepositoryDep,
) -> GetConsultationsByClientHandler:
    """Factory для GetConsultationsByClientHandler."""
    return GetConsultationsByClientHandler(repository=repository)


GetConsultationsByClientHandlerDep = Annotated[
    GetConsultationsByClientHandler, Depends(get_consultations_by_client_handler)
]


def get_consultations_by_lawyer_handler(
    repository: ConsultationRepositoryDep,
) -> GetConsultationsByLawyerHandler:
    """Factory для GetConsultationsByLawyerHandler."""
    return GetConsultationsByLawyerHandler(repository=repository)


GetConsultationsByLawyerHandlerDep = Annotated[
    GetConsultationsByLawyerHandler, Depends(get_consultations_by_lawyer_handler)
]


def get_pending_consultations_handler(
    repository: ConsultationRepositoryDep,
) -> GetPendingConsultationsHandler:
    """Factory для GetPendingConsultationsHandler."""
    return GetPendingConsultationsHandler(repository=repository)


GetPendingConsultationsHandlerDep = Annotated[
    GetPendingConsultationsHandler, Depends(get_pending_consultations_handler)
]
