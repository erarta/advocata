"""
Get Consultations By Lawyer Query

Запрос для получения консультаций юриста.
"""
from dataclasses import dataclass
from typing import List, Optional, Tuple
from uuid import UUID

from app.core.application.query import IQuery, IQueryHandler
from app.core.domain.result import Result
from app.modules.consultation.domain import (
    Consultation,
    ConsultationStatusEnum,
    IConsultationRepository,
)


@dataclass(frozen=True)
class GetConsultationsByLawyerQuery(IQuery):
    """
    Запрос для получения консультаций юриста с фильтрацией и пагинацией.

    Attributes:
        lawyer_id: ID юриста
        status: Фильтр по статусу (опционально)
        limit: Максимальное количество результатов
        offset: Смещение для пагинации
    """

    lawyer_id: UUID
    status: Optional[ConsultationStatusEnum] = None
    limit: int = 50
    offset: int = 0


class GetConsultationsByLawyerHandler(
    IQueryHandler[GetConsultationsByLawyerQuery, Tuple[List[Consultation], int]]
):
    """
    Обработчик запроса получения консультаций юриста.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(
        self, query: GetConsultationsByLawyerQuery
    ) -> Result[Tuple[List[Consultation], int]]:
        """
        Обрабатывает запрос получения консультаций юриста.

        Args:
            query: Запрос

        Returns:
            Result с кортежем (список консультаций, общее количество)
        """
        # Валидация пагинации
        if query.limit < 1 or query.limit > 100:
            return Result.fail("Limit must be between 1 and 100")

        if query.offset < 0:
            return Result.fail("Offset must be non-negative")

        # Получаем консультации
        consultations, total = await self._repository.find_by_lawyer(
            lawyer_id=query.lawyer_id,
            status=query.status,
            limit=query.limit,
            offset=query.offset,
        )

        return Result.ok((consultations, total))
