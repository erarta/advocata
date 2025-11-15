"""
Rate Consultation Command

Команда для оценки завершенной консультации.
"""
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.consultation.domain import Consultation, IConsultationRepository


@dataclass(frozen=True)
class RateConsultationCommand(ICommand):
    """
    Команда для оценки консультации клиентом.

    Attributes:
        consultation_id: ID консультации
        client_id: ID клиента (для проверки прав)
        rating: Оценка от 1 до 5
        review: Текстовый отзыв (опционально)
    """

    consultation_id: UUID
    client_id: UUID
    rating: int
    review: Optional[str] = None


class RateConsultationHandler(ICommandHandler[RateConsultationCommand, Consultation]):
    """
    Обработчик команды оценки консультации.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(self, command: RateConsultationCommand) -> Result[Consultation]:
        """
        Обрабатывает команду оценки консультации.

        Args:
            command: Команда оценки

        Returns:
            Result с обновленной консультацией или ошибкой
        """
        # Находим консультацию
        consultation = await self._repository.find_by_id(command.consultation_id)
        if not consultation:
            return Result.fail(f"Consultation {command.consultation_id} not found")

        # Проверяем права доступа
        if consultation.client_id != command.client_id:
            return Result.fail("Only the client can rate this consultation")

        # Оцениваем консультацию
        rate_result = consultation.rate(rating=command.rating, review=command.review)
        if rate_result.is_failure:
            return Result.fail(rate_result.error)

        # Сохраняем изменения
        saved_consultation = await self._repository.save(consultation)

        return Result.ok(saved_consultation)
