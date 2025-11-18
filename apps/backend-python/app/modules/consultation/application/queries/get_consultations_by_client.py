"""
Get Consultations By Client Query

Запрос для получения консультаций клиента.
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
class GetConsultationsByClientQuery(IQuery):
    """
    Запрос для получения консультаций клиента с фильтрацией и пагинацией.

    Attributes:
        client_id: ID клиента
        status: Фильтр по статусу (опционально)
        limit: Максимальное количество результатов
        offset: Смещение для пагинации
    """

    client_id: UUID
    status: Optional[ConsultationStatusEnum] = None
    limit: int = 50
    offset: int = 0


class GetConsultationsByClientHandler(
    IQueryHandler[GetConsultationsByClientQuery, Tuple[List[Consultation], int]]
):
    """
    Обработчик запроса получения консультаций клиента.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(
        self, query: GetConsultationsByClientQuery
    ) -> Result[Tuple[List[Consultation], int]]:
        """
        Обрабатывает запрос получения консультаций клиента.

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
        consultations, total = await self._repository.find_by_client(
            client_id=query.client_id,
            status=query.status,
            limit=query.limit,
            offset=query.offset,
        )

        return Result.ok((consultations, total))
