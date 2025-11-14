"""
Lawyer API Router

FastAPI роутер для управления юристами.
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.infrastructure.database import get_db
from app.modules.identity.presentation.dependencies.auth_deps import (
    get_current_user,
    require_role,
)
from app.modules.identity.application.dtos.user_dto import UserDTO
from ...application.commands.register_lawyer import RegisterLawyerCommand
from ...application.commands.register_lawyer_handler import RegisterLawyerHandler
from ...application.commands.update_availability import UpdateAvailabilityCommand
from ...application.commands.update_availability_handler import (
    UpdateAvailabilityHandler,
)
from ...application.commands.verify_lawyer import VerifyLawyerCommand
from ...application.commands.verify_lawyer_handler import VerifyLawyerHandler
from ...application.queries.get_lawyer import GetLawyerQuery
from ...application.queries.get_lawyer_handler import GetLawyerHandler
from ...application.queries.get_top_rated import GetTopRatedQuery
from ...application.queries.get_top_rated_handler import GetTopRatedHandler
from ...application.queries.search_lawyers import SearchLawyersQuery
from ...application.queries.search_lawyers_handler import SearchLawyersHandler
from ...infrastructure.persistence.repositories.lawyer_repository_impl import (
    LawyerRepositoryImpl,
)
from ..schemas.requests import (
    RegisterLawyerRequest,
    SearchLawyersRequest,
    UpdateAvailabilityRequest,
)
from ..schemas.responses import (
    ErrorResponse,
    LawyerListResponse,
    LawyerResponse,
    LawyerSearchResponse,
)


router = APIRouter(
    prefix="/lawyers",
    tags=["Lawyers"],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation Error"},
    },
)


# Helper function для создания DTO responses
def _to_lawyer_response(lawyer_dto) -> LawyerResponse:
    """Конвертирует LawyerDTO в LawyerResponse."""
    return LawyerResponse(
        id=lawyer_dto.id,
        user_id=lawyer_dto.user_id,
        specializations=lawyer_dto.specializations,
        experience_years=lawyer_dto.experience_years,
        experience_level=lawyer_dto.experience_level,
        price_amount=lawyer_dto.price_amount,
        price_formatted=lawyer_dto.price_formatted,
        price_category=lawyer_dto.price_category,
        verification_status=lawyer_dto.verification_status,
        verification_status_display=lawyer_dto.verification_status_display,
        rating=lawyer_dto.rating,
        rating_level=lawyer_dto.rating_level,
        reviews_count=lawyer_dto.reviews_count,
        consultations_count=lawyer_dto.consultations_count,
        license_number=lawyer_dto.license_number,
        education=lawyer_dto.education,
        about=lawyer_dto.about,
        location=lawyer_dto.location,
        languages=lawyer_dto.languages,
        is_available=lawyer_dto.is_available,
        can_accept_consultations=lawyer_dto.can_accept_consultations,
        verified_at=lawyer_dto.verified_at,
        created_at=lawyer_dto.created_at,
        updated_at=lawyer_dto.updated_at,
    )


def _to_lawyer_list_response(lawyer_dto) -> LawyerListResponse:
    """Конвертирует LawyerListItemDTO в LawyerListResponse."""
    return LawyerListResponse(
        id=lawyer_dto.id,
        specializations=lawyer_dto.specializations,
        experience_years=lawyer_dto.experience_years,
        experience_level=lawyer_dto.experience_level,
        price_formatted=lawyer_dto.price_formatted,
        rating=lawyer_dto.rating,
        reviews_count=lawyer_dto.reviews_count,
        location=lawyer_dto.location,
        is_available=lawyer_dto.is_available,
        verification_status=lawyer_dto.verification_status,
    )


@router.post(
    "",
    response_model=LawyerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Регистрация юриста",
    description="""
    Регистрирует нового юриста в системе.

    **Требования:**
    - Пользователь должен быть аутентифицирован
    - Один пользователь = один профиль юриста
    - Минимум 1 специализация (макс 5)
    - Описание минимум 50 символов (3+ предложения)
    - Цена 500-100,000 руб

    **Процесс:**
    1. Создается профиль со статусом PENDING
    2. Юрист недоступен для консультаций
    3. Администратор должен верифицировать документы
    4. После верификации юрист становится доступным

    **Права:** CLIENT или LAWYER роль
    """,
)
async def register_lawyer(
    request: RegisterLawyerRequest,
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LawyerResponse:
    """
    Регистрация юриста.

    Args:
        request: Данные юриста
        current_user: Текущий пользователь
        db: Database session

    Returns:
        LawyerResponse

    Raises:
        HTTPException: 400 если пользователь уже юрист
    """
    # Создаем repository и handler
    lawyer_repository = LawyerRepositoryImpl(db)
    handler = RegisterLawyerHandler(lawyer_repository)

    # Создаем команду
    command = RegisterLawyerCommand(
        user_id=current_user.id,
        specializations=request.specializations,
        experience_years=request.experience_years,
        price_per_consultation=request.price_per_consultation,
        license_number=request.license_number,
        education=request.education,
        about=request.about,
        location=request.location,
        languages=request.languages,
    )

    # Выполняем регистрацию
    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return _to_lawyer_response(result.value)


@router.get(
    "",
    response_model=LawyerSearchResponse,
    summary="Поиск юристов",
    description="""
    Поиск юристов с множественными фильтрами.

    **Фильтры:**
    - specializations: список специализаций (OR)
    - min_rating: минимальный рейтинг (1.0-5.0)
    - max_price: максимальная цена
    - location: город/регион (частичное совпадение)
    - is_available: только доступные
    - min_experience: минимальный опыт (годы)
    - query: текстовый поиск (описание, образование)

    **Пагинация:**
    - limit: 1-100 (по умолчанию 20)
    - offset: смещение (по умолчанию 0)

    **Сортировка:**
    - По рейтингу (DESC)
    - По дате регистрации (DESC)

    **Публичный endpoint** (без auth)
    """,
)
async def search_lawyers(
    specializations: Annotated[
        List[str] | None, Query(description="Фильтр по специализациям")
    ] = None,
    min_rating: Annotated[
        float | None, Query(ge=1.0, le=5.0, description="Минимальный рейтинг")
    ] = None,
    max_price: Annotated[
        float | None, Query(ge=500.0, le=100000.0, description="Максимальная цена")
    ] = None,
    location: Annotated[str | None, Query(max_length=100, description="Локация")] = None,
    is_available: Annotated[bool | None, Query(description="Только доступные")] = None,
    min_experience: Annotated[
        int | None, Query(ge=0, le=70, description="Минимальный опыт")
    ] = None,
    query: Annotated[
        str | None, Query(min_length=3, max_length=200, description="Текстовый поиск")
    ] = None,
    limit: Annotated[int, Query(ge=1, le=100, description="Лимит")] = 20,
    offset: Annotated[int, Query(ge=0, description="Смещение")] = 0,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> LawyerSearchResponse:
    """
    Поиск юристов.

    Args:
        specializations: Фильтр по специализациям
        min_rating: Минимальный рейтинг
        max_price: Максимальная цена
        location: Локация
        is_available: Только доступные
        min_experience: Минимальный опыт
        query: Текстовый поиск
        limit: Лимит
        offset: Смещение
        db: Database session

    Returns:
        LawyerSearchResponse
    """
    # Создаем repository и handler
    lawyer_repository = LawyerRepositoryImpl(db)
    handler = SearchLawyersHandler(lawyer_repository)

    # Создаем query
    search_query = SearchLawyersQuery(
        specializations=specializations,
        min_rating=min_rating,
        max_price=max_price,
        location=location,
        is_available=is_available,
        min_experience=min_experience,
        query=query,
        limit=limit,
        offset=offset,
    )

    # Выполняем поиск
    result = await handler.handle(search_query)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    search_result = result.value

    # Конвертируем в response
    return LawyerSearchResponse(
        lawyers=[_to_lawyer_list_response(dto) for dto in search_result.lawyers],
        total=search_result.total,
        limit=search_result.limit,
        offset=search_result.offset,
        has_more=search_result.has_more,
    )


@router.get(
    "/top-rated",
    response_model=List[LawyerListResponse],
    summary="Топ юристов по рейтингу",
    description="""
    Получает топ юристов по рейтингу.

    **Фильтры:**
    - specialization: одна специализация (опционально)
    - location: город/регион (опционально)
    - limit: количество (1-50, по умолчанию 10)

    **Только:**
    - Верифицированные юристы
    - Доступные для консультаций
    - С рейтингом

    **Сортировка:**
    - Рейтинг DESC
    - Количество отзывов DESC

    **Публичный endpoint** (без auth)
    """,
)
async def get_top_rated(
    specialization: Annotated[
        str | None, Query(description="Фильтр по специализации")
    ] = None,
    location: Annotated[str | None, Query(max_length=100, description="Локация")] = None,
    limit: Annotated[int, Query(ge=1, le=50, description="Лимит")] = 10,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> List[LawyerListResponse]:
    """
    Топ юристов по рейтингу.

    Args:
        specialization: Фильтр по специализации
        location: Локация
        limit: Лимит
        db: Database session

    Returns:
        List[LawyerListResponse]
    """
    # Создаем repository и handler
    lawyer_repository = LawyerRepositoryImpl(db)
    handler = GetTopRatedHandler(lawyer_repository)

    # Создаем query
    query = GetTopRatedQuery(
        specialization=specialization,
        location=location,
        limit=limit,
    )

    # Выполняем запрос
    result = await handler.handle(query)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return [_to_lawyer_list_response(dto) for dto in result.value]


@router.get(
    "/{lawyer_id}",
    response_model=LawyerResponse,
    summary="Получить юриста по ID",
    description="""
    Возвращает полную информацию о юристе.

    **Публичный endpoint** (без auth)
    """,
)
async def get_lawyer(
    lawyer_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LawyerResponse:
    """
    Получить юриста по ID.

    Args:
        lawyer_id: ID юриста
        db: Database session

    Returns:
        LawyerResponse

    Raises:
        HTTPException: 404 если не найден
    """
    # Создаем repository и handler
    lawyer_repository = LawyerRepositoryImpl(db)
    handler = GetLawyerHandler(lawyer_repository)

    # Создаем query
    query = GetLawyerQuery(lawyer_id=lawyer_id)

    # Выполняем запрос
    result = await handler.handle(query)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.error,
        )

    return _to_lawyer_response(result.value)


@router.put(
    "/{lawyer_id}/availability",
    response_model=LawyerResponse,
    summary="Обновить доступность юриста",
    description="""
    Обновляет доступность юриста для консультаций.

    **Требования:**
    - Пользователь должен быть владельцем профиля юриста
    - Юрист должен быть верифицирован

    **Права:** Владелец профиля
    """,
)
async def update_availability(
    lawyer_id: str,
    request: UpdateAvailabilityRequest,
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LawyerResponse:
    """
    Обновить доступность.

    Args:
        lawyer_id: ID юриста
        request: Данные доступности
        current_user: Текущий пользователь
        db: Database session

    Returns:
        LawyerResponse

    Raises:
        HTTPException: 403 если не владелец, 404 если не найден
    """
    # Проверяем что пользователь - владелец профиля
    lawyer_repository = LawyerRepositoryImpl(db)
    lawyer_result = await lawyer_repository.find_by_id(lawyer_id)

    if not lawyer_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lawyer not found: {lawyer_id}",
        )

    # Проверка ownership через user_id
    if lawyer_result.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this lawyer profile",
        )

    # Создаем handler
    handler = UpdateAvailabilityHandler(lawyer_repository)

    # Создаем команду
    command = UpdateAvailabilityCommand(
        lawyer_id=lawyer_id,
        is_available=request.is_available,
    )

    # Выполняем обновление
    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return _to_lawyer_response(result.value)


@router.post(
    "/{lawyer_id}/verify",
    response_model=LawyerResponse,
    summary="Верифицировать юриста (Admin)",
    description="""
    Верифицирует юриста - подтверждает документы.

    **Требования:**
    - Пользователь должен быть администратором
    - Юрист должен быть в статусе PENDING или IN_REVIEW

    **Процесс:**
    1. Статус меняется на VERIFIED
    2. Юрист становится доступным для консультаций
    3. Инициализируется рейтинг (5.0)
    4. Отправляется уведомление юристу

    **Права:** ADMIN
    """,
    dependencies=[Depends(require_role("ADMIN"))],
)
async def verify_lawyer(
    lawyer_id: str,
    current_user: Annotated[UserDTO, Depends(require_role("ADMIN"))],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LawyerResponse:
    """
    Верифицировать юриста (Admin).

    Args:
        lawyer_id: ID юриста
        current_user: Текущий администратор
        db: Database session

    Returns:
        LawyerResponse

    Raises:
        HTTPException: 404 если не найден, 400 если не может быть верифицирован
    """
    # Создаем repository и handler
    lawyer_repository = LawyerRepositoryImpl(db)
    handler = VerifyLawyerHandler(lawyer_repository)

    # Создаем команду
    command = VerifyLawyerCommand(
        lawyer_id=lawyer_id,
        verified_by_admin_id=current_user.id,
    )

    # Выполняем верификацию
    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    return _to_lawyer_response(result.value)
