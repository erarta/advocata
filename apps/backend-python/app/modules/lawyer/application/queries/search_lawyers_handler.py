"""
SearchLawyersHandler

Handler для поиска юристов с фильтрами.
"""

from typing import List, Optional

from app.core.domain.result import Result
from ...domain.repositories.lawyer_repository import ILawyerRepository
from ...domain.value_objects.specialization import SpecializationType
from ..dtos.lawyer_dto import LawyerSearchResultDTO
from .search_lawyers import SearchLawyersQuery


class SearchLawyersHandler:
    """
    Handler для запроса SearchLawyersQuery.

    Процесс:
    1. Конвертирует фильтры в domain types
    2. Вызывает метод search() на репозитории
    3. Возвращает LawyerSearchResultDTO с пагинацией

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
        self, query: SearchLawyersQuery
    ) -> Result[LawyerSearchResultDTO]:
        """
        Обрабатывает запрос поиска юристов.

        Args:
            query: Запрос с фильтрами

        Returns:
            Result с LawyerSearchResultDTO или ошибкой
        """
        # 1. Конвертируем специализации в enum types
        specializations_enum: Optional[List[SpecializationType]] = None
        if query.specializations:
            try:
                specializations_enum = []
                for spec_str in query.specializations:
                    # Пробуем найти по display name (русское название)
                    found = False
                    for spec_type in SpecializationType:
                        if spec_type.value == spec_str or spec_type.name == spec_str:
                            specializations_enum.append(spec_type)
                            found = True
                            break
                    if not found:
                        return Result.fail(f"Unknown specialization: {spec_str}")
            except Exception as e:
                return Result.fail(f"Invalid specialization format: {str(e)}")

        # 2. Валидация параметров
        if query.min_rating is not None and (
            query.min_rating < 1.0 or query.min_rating > 5.0
        ):
            return Result.fail("min_rating must be between 1.0 and 5.0")

        if query.max_price is not None and query.max_price <= 0:
            return Result.fail("max_price must be positive")

        if query.min_experience is not None and query.min_experience < 0:
            return Result.fail("min_experience cannot be negative")

        if query.limit <= 0 or query.limit > 100:
            return Result.fail("limit must be between 1 and 100")

        if query.offset < 0:
            return Result.fail("offset cannot be negative")

        # 3. Выполняем поиск
        lawyers, total = await self.lawyer_repository.search(
            specializations=specializations_enum,
            min_rating=query.min_rating,
            max_price=query.max_price,
            location=query.location,
            is_available=query.is_available,
            min_experience=query.min_experience,
            query=query.query,
            limit=query.limit,
            offset=query.offset,
        )

        # 4. Создаем DTO результата
        result_dto = LawyerSearchResultDTO.create(
            lawyers=lawyers,
            total=total,
            limit=query.limit,
            offset=query.offset,
        )

        return Result.ok(result_dto)
