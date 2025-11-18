"""
Consultation API Router

REST API endpoints для управления консультациями.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.infrastructure.database import get_db
from app.core.presentation.dependencies.auth import get_current_user
from app.modules.consultation.domain import ConsultationStatusEnum
from app.modules.consultation.application import (
    BookConsultationCommand,
    ConfirmConsultationCommand,
    StartConsultationCommand,
    CompleteConsultationCommand,
    CancelConsultationCommand,
    RateConsultationCommand,
    GetConsultationByIdQuery,
    GetConsultationsByClientQuery,
    GetConsultationsByLawyerQuery,
    GetPendingConsultationsQuery,
    ConsultationDTO,
    ConsultationSearchResultDTO,
    ConsultationListItemDTO,
    CreateConsultationRequestDTO,
    ConfirmConsultationRequestDTO,
    CancelConsultationRequestDTO,
    RateConsultationRequestDTO,
)
from app.modules.consultation.presentation.dependencies import (
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

router = APIRouter(prefix="/consultations", tags=["consultations"])


# ========== Commands (Mutations) ==========


@router.post(
    "",
    response_model=ConsultationDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Забронировать консультацию",
)
async def book_consultation(
    request: CreateConsultationRequestDTO,
    handler: BookConsultationHandlerDep,
    current_user: dict = get_current_user,
) -> ConsultationDTO:
    """
    Бронирование новой консультации клиентом.

    - **lawyer_id**: ID юриста
    - **consultation_type**: Тип консультации (emergency/scheduled)
    - **description**: Описание проблемы (10-2000 символов)
    - **price_amount**: Цена консультации
    - **scheduled_start**: Время начала (обязательно для scheduled)
    - **duration_minutes**: Длительность (по умолчанию 60 мин)
    """
    command = BookConsultationCommand(
        client_id=UUID(current_user["id"]),
        lawyer_id=request.lawyer_id,
        consultation_type=request.consultation_type,
        price_amount=request.price_amount,
        price_currency=request.price_currency,
        description=request.description,
        scheduled_start=request.scheduled_start,
        duration_minutes=request.duration_minutes,
    )

    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return ConsultationDTO.from_entity(result.value)


@router.post(
    "/{consultation_id}/confirm",
    response_model=ConsultationDTO,
    summary="Подтвердить консультацию (юрист)",
)
async def confirm_consultation(
    consultation_id: UUID,
    handler: ConfirmConsultationHandlerDep,
    current_user: dict = get_current_user,
) -> ConsultationDTO:
    """
    Подтверждение консультации юристом.

    Переводит консультацию из статуса PENDING в CONFIRMED.
    Доступно только юристу, назначенному на консультацию.
    """
    command = ConfirmConsultationCommand(
        consultation_id=consultation_id,
        lawyer_id=UUID(current_user["id"]),
    )

    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return ConsultationDTO.from_entity(result.value)


@router.post(
    "/{consultation_id}/start",
    response_model=ConsultationDTO,
    summary="Начать консультацию (юрист)",
)
async def start_consultation(
    consultation_id: UUID,
    handler: StartConsultationHandlerDep,
    current_user: dict = get_current_user,
) -> ConsultationDTO:
    """
    Начало консультации юристом.

    Переводит консультацию из статуса CONFIRMED в ACTIVE.
    Доступно только юристу, назначенному на консультацию.
    Юрист может вести только одну активную консультацию одновременно.
    """
    command = StartConsultationCommand(
        consultation_id=consultation_id,
        lawyer_id=UUID(current_user["id"]),
    )

    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return ConsultationDTO.from_entity(result.value)


@router.post(
    "/{consultation_id}/complete",
    response_model=ConsultationDTO,
    summary="Завершить консультацию (юрист)",
)
async def complete_consultation(
    consultation_id: UUID,
    handler: CompleteConsultationHandlerDep,
    current_user: dict = get_current_user,
) -> ConsultationDTO:
    """
    Завершение консультации юристом.

    Переводит консультацию из статуса ACTIVE в COMPLETED.
    Доступно только юристу, назначенному на консультацию.
    """
    command = CompleteConsultationCommand(
        consultation_id=consultation_id,
        lawyer_id=UUID(current_user["id"]),
    )

    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return ConsultationDTO.from_entity(result.value)


@router.post(
    "/{consultation_id}/cancel",
    response_model=ConsultationDTO,
    summary="Отменить консультацию",
)
async def cancel_consultation(
    consultation_id: UUID,
    request: CancelConsultationRequestDTO,
    handler: CancelConsultationHandlerDep,
    current_user: dict = get_current_user,
) -> ConsultationDTO:
    """
    Отмена консультации клиентом или юристом.

    Переводит консультацию в статус CANCELLED.
    Доступно только участникам консультации (клиенту или юристу).
    """
    # Определяем роль пользователя (нужно расширить current_user)
    user_role = current_user.get("role", "client")
    cancelled_by = "lawyer" if user_role == "lawyer" else "client"

    command = CancelConsultationCommand(
        consultation_id=consultation_id,
        user_id=UUID(current_user["id"]),
        reason=request.reason,
        cancelled_by=cancelled_by,
    )

    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return ConsultationDTO.from_entity(result.value)


@router.post(
    "/{consultation_id}/rate",
    response_model=ConsultationDTO,
    summary="Оценить консультацию (клиент)",
)
async def rate_consultation(
    consultation_id: UUID,
    request: RateConsultationRequestDTO,
    handler: RateConsultationHandlerDep,
    current_user: dict = get_current_user,
) -> ConsultationDTO:
    """
    Оценка завершенной консультации клиентом.

    Доступно только клиенту после завершения консультации.
    Оценка может быть поставлена только один раз.

    - **rating**: Оценка от 1 до 5
    - **review**: Текстовый отзыв (опционально)
    """
    command = RateConsultationCommand(
        consultation_id=consultation_id,
        client_id=UUID(current_user["id"]),
        rating=request.rating,
        review=request.review,
    )

    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return ConsultationDTO.from_entity(result.value)


# ========== Queries (Reads) ==========


@router.get(
    "/{consultation_id}",
    response_model=ConsultationDTO,
    summary="Получить консультацию по ID",
)
async def get_consultation_by_id(
    consultation_id: UUID,
    handler: GetConsultationByIdHandlerDep,
    current_user: dict = get_current_user,
) -> ConsultationDTO:
    """
    Получение детальной информации о консультации.

    Доступно только участникам консультации (клиенту или юристу).
    """
    query = GetConsultationByIdQuery(
        consultation_id=consultation_id,
        user_id=UUID(current_user["id"]),
    )

    result = await handler.handle(query)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=result.error,
        )

    if not result.value:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consultation {consultation_id} not found",
        )

    return ConsultationDTO.from_entity(result.value)


@router.get(
    "/client/me",
    response_model=ConsultationSearchResultDTO,
    summary="Получить мои консультации (клиент)",
)
async def get_my_consultations_as_client(
    handler: GetConsultationsByClientHandlerDep,
    current_user: dict = get_current_user,
    status_filter: Optional[ConsultationStatusEnum] = Query(
        None, alias="status", description="Фильтр по статусу"
    ),
    limit: int = Query(50, ge=1, le=100, description="Количество результатов"),
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
) -> ConsultationSearchResultDTO:
    """
    Получение списка консультаций текущего пользователя как клиента.

    Поддерживает фильтрацию по статусу и пагинацию.
    """
    query = GetConsultationsByClientQuery(
        client_id=UUID(current_user["id"]),
        status=status_filter,
        limit=limit,
        offset=offset,
    )

    result = await handler.handle(query)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    consultations, total = result.value
    items = [ConsultationListItemDTO.from_entity(c) for c in consultations]

    return ConsultationSearchResultDTO(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/lawyer/me",
    response_model=ConsultationSearchResultDTO,
    summary="Получить мои консультации (юрист)",
)
async def get_my_consultations_as_lawyer(
    handler: GetConsultationsByLawyerHandlerDep,
    current_user: dict = get_current_user,
    status_filter: Optional[ConsultationStatusEnum] = Query(
        None, alias="status", description="Фильтр по статусу"
    ),
    limit: int = Query(50, ge=1, le=100, description="Количество результатов"),
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
) -> ConsultationSearchResultDTO:
    """
    Получение списка консультаций текущего пользователя как юриста.

    Поддерживает фильтрацию по статусу и пагинацию.
    """
    query = GetConsultationsByLawyerQuery(
        lawyer_id=UUID(current_user["id"]),
        status=status_filter,
        limit=limit,
        offset=offset,
    )

    result = await handler.handle(query)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    consultations, total = result.value
    items = [ConsultationListItemDTO.from_entity(c) for c in consultations]

    return ConsultationSearchResultDTO(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/lawyer/me/pending",
    response_model=list[ConsultationListItemDTO],
    summary="Получить pending консультации (юрист)",
)
async def get_my_pending_consultations(
    handler: GetPendingConsultationsHandlerDep,
    current_user: dict = get_current_user,
    limit: int = Query(10, ge=1, le=50, description="Количество результатов"),
) -> list[ConsultationListItemDTO]:
    """
    Получение списка pending консультаций текущего юриста (ожидающих подтверждения).

    Используется для уведомлений о новых запросах на консультацию.
    """
    query = GetPendingConsultationsQuery(
        lawyer_id=UUID(current_user["id"]),
        limit=limit,
    )

    result = await handler.handle(query)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return [ConsultationListItemDTO.from_entity(c) for c in result.value]
