"""
Get Pending Consultations Query

Запрос для получения pending консультаций юриста (ожидающих подтверждения).
"""
from dataclasses import dataclass
from typing import List
from uuid import UUID

from app.core.application.query import IQuery, IQueryHandler
from app.core.domain.result import Result
from app.modules.consultation.domain import Consultation, IConsultationRepository


@dataclass(frozen=True)
class GetPendingConsultationsQuery(IQuery):
    """
    Запрос для получения pending консультаций юриста.

    Attributes:
        lawyer_id: ID юриста
        limit: Максимальное количество результатов
    """

    lawyer_id: UUID
    limit: int = 10


class GetPendingConsultationsHandler(
    IQueryHandler[GetPendingConsultationsQuery, List[Consultation]]
):
    """
    Обработчик запроса получения pending консультаций.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(
        self, query: GetPendingConsultationsQuery
    ) -> Result[List[Consultation]]:
        """
        Обрабатывает запрос получения pending консультаций.

        Args:
            query: Запрос

        Returns:
            Result со списком pending консультаций
        """
        # Валидация лимита
        if query.limit < 1 or query.limit > 50:
            return Result.fail("Limit must be between 1 and 50")

        # Получаем pending консультации
        consultations = await self._repository.find_pending_by_lawyer(
            lawyer_id=query.lawyer_id, limit=query.limit
        )

        return Result.ok(consultations)
