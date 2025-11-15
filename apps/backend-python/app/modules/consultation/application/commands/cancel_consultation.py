"""
Cancel Consultation Command

Команда для отмены консультации.
"""
from dataclasses import dataclass
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.consultation.domain import Consultation, IConsultationRepository


@dataclass(frozen=True)
class CancelConsultationCommand(ICommand):
    """
    Команда для отмены консультации.

    Attributes:
        consultation_id: ID консультации
        user_id: ID пользователя (клиента или юриста)
        reason: Причина отмены
        cancelled_by: Кто отменил ("client" или "lawyer")
    """

    consultation_id: UUID
    user_id: UUID
    reason: str
    cancelled_by: str  # "client" or "lawyer"


class CancelConsultationHandler(
    ICommandHandler[CancelConsultationCommand, Consultation]
):
    """
    Обработчик команды отмены консультации.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(
        self, command: CancelConsultationCommand
    ) -> Result[Consultation]:
        """
        Обрабатывает команду отмены консультации.

        Args:
            command: Команда отмены

        Returns:
            Result с обновленной консультацией или ошибкой
        """
        # Находим консультацию
        consultation = await self._repository.find_by_id(command.consultation_id)
        if not consultation:
            return Result.fail(f"Consultation {command.consultation_id} not found")

        # Проверяем права доступа
        if command.cancelled_by == "client":
            if consultation.client_id != command.user_id:
                return Result.fail("Only the client can cancel as client")
        elif command.cancelled_by == "lawyer":
            if consultation.lawyer_id != command.user_id:
                return Result.fail("Only the lawyer can cancel as lawyer")
        else:
            return Result.fail("cancelled_by must be 'client' or 'lawyer'")

        # Отменяем консультацию
        cancel_result = consultation.cancel(
            reason=command.reason, cancelled_by=command.cancelled_by
        )
        if cancel_result.is_failure:
            return Result.fail(cancel_result.error)

        # Сохраняем изменения
        saved_consultation = await self._repository.save(consultation)

        return Result.ok(saved_consultation)
