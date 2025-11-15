"""
Complete Consultation Command

Команда для завершения консультации.
"""
from dataclasses import dataclass
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.consultation.domain import Consultation, IConsultationRepository


@dataclass(frozen=True)
class CompleteConsultationCommand(ICommand):
    """
    Команда для завершения консультации.

    Attributes:
        consultation_id: ID консультации
        lawyer_id: ID юриста (для проверки прав)
    """

    consultation_id: UUID
    lawyer_id: UUID


class CompleteConsultationHandler(
    ICommandHandler[CompleteConsultationCommand, Consultation]
):
    """
    Обработчик команды завершения консультации.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(
        self, command: CompleteConsultationCommand
    ) -> Result[Consultation]:
        """
        Обрабатывает команду завершения консультации.

        Args:
            command: Команда завершения

        Returns:
            Result с обновленной консультацией или ошибкой
        """
        # Находим консультацию
        consultation = await self._repository.find_by_id(command.consultation_id)
        if not consultation:
            return Result.fail(f"Consultation {command.consultation_id} not found")

        # Проверяем права доступа
        if consultation.lawyer_id != command.lawyer_id:
            return Result.fail("Only the assigned lawyer can complete this consultation")

        # Завершаем консультацию
        complete_result = consultation.complete()
        if complete_result.is_failure:
            return Result.fail(complete_result.error)

        # Сохраняем изменения
        saved_consultation = await self._repository.save(consultation)

        return Result.ok(saved_consultation)
