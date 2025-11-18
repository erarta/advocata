"""
Fail Payment Command

Команда для отметки платежа как неудачного.
"""
from dataclasses import dataclass
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.payment.domain import Payment, IPaymentRepository


@dataclass(frozen=True)
class FailPaymentCommand(ICommand):
    """
    Команда для отметки платежа как неудачного.

    Attributes:
        payment_id: ID платежа
        reason: Причина неудачи
    """

    payment_id: UUID
    reason: str


class FailPaymentHandler(ICommandHandler[FailPaymentCommand, Payment]):
    """
    Обработчик команды неудачного платежа.
    """

    def __init__(self, repository: IPaymentRepository):
        self._repository = repository

    async def handle(self, command: FailPaymentCommand) -> Result[Payment]:
        """
        Обрабатывает команду отметки платежа как неудачного.

        Args:
            command: Команда неудачи

        Returns:
            Result с обновленным платежом или ошибкой
        """
        # Находим платеж
        payment = await self._repository.find_by_id(command.payment_id)
        if not payment:
            return Result.fail(f"Payment {command.payment_id} not found")

        # Отмечаем как неудачный
        fail_result = payment.mark_failed(command.reason)
        if fail_result.is_failure:
            return Result.fail(fail_result.error)

        # Сохраняем изменения
        saved_payment = await self._repository.save(payment)

        return Result.ok(saved_payment)
