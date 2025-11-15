"""
Complete Payment Command

Команда для завершения платежа (успешно).
"""
from dataclasses import dataclass
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.payment.domain import Payment, IPaymentRepository


@dataclass(frozen=True)
class CompletePaymentCommand(ICommand):
    """
    Команда для завершения платежа как успешного.

    Attributes:
        payment_id: ID платежа
    """

    payment_id: UUID


class CompletePaymentHandler(ICommandHandler[CompletePaymentCommand, Payment]):
    """
    Обработчик команды завершения платежа.
    """

    def __init__(self, repository: IPaymentRepository):
        self._repository = repository

    async def handle(self, command: CompletePaymentCommand) -> Result[Payment]:
        """
        Обрабатывает команду завершения платежа.

        Args:
            command: Команда завершения

        Returns:
            Result с обновленным платежом или ошибкой
        """
        # Находим платеж
        payment = await self._repository.find_by_id(command.payment_id)
        if not payment:
            return Result.fail(f"Payment {command.payment_id} not found")

        # Завершаем платеж
        complete_result = payment.mark_succeeded()
        if complete_result.is_failure:
            return Result.fail(complete_result.error)

        # Сохраняем изменения
        saved_payment = await self._repository.save(payment)

        return Result.ok(saved_payment)
