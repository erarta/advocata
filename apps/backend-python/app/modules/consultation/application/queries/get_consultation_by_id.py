"""
Get Consultation By ID Query

Запрос для получения консультации по ID.
"""
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from app.core.application.query import IQuery, IQueryHandler
from app.core.domain.result import Result
from app.modules.consultation.domain import Consultation, IConsultationRepository


@dataclass(frozen=True)
class GetConsultationByIdQuery(IQuery):
    """
    Запрос для получения консультации по ID.

    Attributes:
        consultation_id: ID консультации
        user_id: ID пользователя (для проверки прав доступа)
    """

    consultation_id: UUID
    user_id: UUID


class GetConsultationByIdHandler(
    IQueryHandler[GetConsultationByIdQuery, Optional[Consultation]]
):
    """
    Обработчик запроса получения консультации по ID.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(
        self, query: GetConsultationByIdQuery
    ) -> Result[Optional[Consultation]]:
        """
        Обрабатывает запрос получения консультации.

        Args:
            query: Запрос

        Returns:
            Result с консультацией или None если не найдена
        """
        consultation = await self._repository.find_by_id(query.consultation_id)

        if not consultation:
            return Result.ok(None)

        # Проверяем права доступа
        if (
            consultation.client_id != query.user_id
            and consultation.lawyer_id != query.user_id
        ):
            return Result.fail("Access denied: you are not part of this consultation")

        return Result.ok(consultation)
