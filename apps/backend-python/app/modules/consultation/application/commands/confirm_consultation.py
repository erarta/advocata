"""
Confirm Consultation Command

Команда для подтверждения консультации юристом.
"""
from dataclasses import dataclass
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.consultation.domain import Consultation, IConsultationRepository


@dataclass(frozen=True)
class ConfirmConsultationCommand(ICommand):
    """
    Команда для подтверждения консультации юристом.

    Attributes:
        consultation_id: ID консультации
        lawyer_id: ID юриста (для проверки прав)
    """

    consultation_id: UUID
    lawyer_id: UUID


class ConfirmConsultationHandler(
    ICommandHandler[ConfirmConsultationCommand, Consultation]
):
    """
    Обработчик команды подтверждения консультации.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(
        self, command: ConfirmConsultationCommand
    ) -> Result[Consultation]:
        """
        Обрабатывает команду подтверждения консультации.

        Args:
            command: Команда подтверждения

        Returns:
            Result с обновленной консультацией или ошибкой
        """
        # Находим консультацию
        consultation = await self._repository.find_by_id(command.consultation_id)
        if not consultation:
            return Result.fail(f"Consultation {command.consultation_id} not found")

        # Проверяем права доступа
        if consultation.lawyer_id != command.lawyer_id:
            return Result.fail("Only the assigned lawyer can confirm this consultation")

        # Подтверждаем консультацию
        confirm_result = consultation.confirm()
        if confirm_result.is_failure:
            return Result.fail(confirm_result.error)

        # Сохраняем изменения
        saved_consultation = await self._repository.save(consultation)

        return Result.ok(saved_consultation)
