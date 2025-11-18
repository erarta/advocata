"""
Start Consultation Command

Команда для начала консультации.
"""
from dataclasses import dataclass
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.consultation.domain import Consultation, IConsultationRepository


@dataclass(frozen=True)
class StartConsultationCommand(ICommand):
    """
    Команда для начала консультации.

    Attributes:
        consultation_id: ID консультации
        lawyer_id: ID юриста (для проверки прав)
    """

    consultation_id: UUID
    lawyer_id: UUID


class StartConsultationHandler(ICommandHandler[StartConsultationCommand, Consultation]):
    """
    Обработчик команды начала консультации.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(self, command: StartConsultationCommand) -> Result[Consultation]:
        """
        Обрабатывает команду начала консультации.

        Args:
            command: Команда начала

        Returns:
            Result с обновленной консультацией или ошибкой
        """
        # Находим консультацию
        consultation = await self._repository.find_by_id(command.consultation_id)
        if not consultation:
            return Result.fail(f"Consultation {command.consultation_id} not found")

        # Проверяем права доступа
        if consultation.lawyer_id != command.lawyer_id:
            return Result.fail("Only the assigned lawyer can start this consultation")

        # Проверяем, что у юриста нет активных консультаций
        active_consultation = await self._repository.find_active_by_lawyer(
            command.lawyer_id
        )
        if active_consultation and active_consultation.id != consultation.id:
            return Result.fail("Lawyer already has an active consultation")

        # Начинаем консультацию
        start_result = consultation.start()
        if start_result.is_failure:
            return Result.fail(start_result.error)

        # Сохраняем изменения
        saved_consultation = await self._repository.save(consultation)

        return Result.ok(saved_consultation)
