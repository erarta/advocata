"""
GetTopRatedHandler

Handler для получения топ юристов по рейтингу.
"""

from typing import List, Optional

from app.core.domain.result import Result
from ...domain.repositories.lawyer_repository import ILawyerRepository
from ...domain.value_objects.specialization import SpecializationType
from ..dtos.lawyer_dto import LawyerListItemDTO
from .get_top_rated import GetTopRatedQuery


class GetTopRatedHandler:
    """
    Handler для запроса GetTopRatedQuery.

    Процесс:
    1. Конвертирует фильтры в domain types
    2. Вызывает метод get_top_rated() на репозитории
    3. Возвращает список LawyerListItemDTO

    Dependencies:
        lawyer_repository: Репозиторий юристов
    """

    def __init__(self, lawyer_repository: ILawyerRepository) -> None:
        """
        Инициализирует handler.

        Args:
            lawyer_repository: Репозиторий юристов
        """
        self.lawyer_repository = lawyer_repository

    async def handle(
        self, query: GetTopRatedQuery
    ) -> Result[List[LawyerListItemDTO]]:
        """
        Обрабатывает запрос получения топ юристов.

        Args:
            query: Запрос с фильтрами

        Returns:
            Result со списком LawyerListItemDTO или ошибкой
        """
        # 1. Конвертируем специализацию в enum type
        specialization_enum: Optional[SpecializationType] = None
        if query.specialization:
            try:
                # Пробуем найти по display name или enum name
                found = False
                for spec_type in SpecializationType:
                    if (
                        spec_type.value == query.specialization
                        or spec_type.name == query.specialization
                    ):
                        specialization_enum = spec_type
                        found = True
                        break
                if not found:
                    return Result.fail(
                        f"Unknown specialization: {query.specialization}"
                    )
            except Exception as e:
                return Result.fail(f"Invalid specialization format: {str(e)}")

        # 2. Валидация параметров
        if query.limit <= 0 or query.limit > 50:
            return Result.fail("limit must be between 1 and 50")

        # 3. Получаем топ юристов
        lawyers = await self.lawyer_repository.get_top_rated(
            specialization=specialization_enum,
            location=query.location,
            limit=query.limit,
        )

        # 4. Конвертируем в DTO
        lawyer_dtos = [LawyerListItemDTO.from_entity(lawyer) for lawyer in lawyers]

        return Result.ok(lawyer_dtos)
