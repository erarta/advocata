"""
Process Payment Command

Команда для начала обработки платежа.
"""
from dataclasses import dataclass
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.payment.domain import Payment, IPaymentRepository


@dataclass(frozen=True)
class ProcessPaymentCommand(ICommand):
    """
    Команда для начала обработки платежа.

    Attributes:
        payment_id: ID платежа
        external_payment_id: ID платежа в платежной системе (ЮКасса)
    """

    payment_id: UUID
    external_payment_id: str


class ProcessPaymentHandler(ICommandHandler[ProcessPaymentCommand, Payment]):
    """
    Обработчик команды обработки платежа.
    """

    def __init__(self, repository: IPaymentRepository):
        self._repository = repository

    async def handle(self, command: ProcessPaymentCommand) -> Result[Payment]:
        """
        Обрабатывает команду начала обработки платежа.

        Args:
            command: Команда обработки

        Returns:
            Result с обновленным платежом или ошибкой
        """
        # Находим платеж
        payment = await self._repository.find_by_id(command.payment_id)
        if not payment:
            return Result.fail(f"Payment {command.payment_id} not found")

        # Начинаем обработку
        process_result = payment.start_processing(command.external_payment_id)
        if process_result.is_failure:
            return Result.fail(process_result.error)

        # Сохраняем изменения
        saved_payment = await self._repository.save(payment)

        return Result.ok(saved_payment)
