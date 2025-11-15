"""
Complete Refund Command

Команда для завершения возврата платежа.
"""
from dataclasses import dataclass
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.payment.domain import Payment, IPaymentRepository


@dataclass(frozen=True)
class CompleteRefundCommand(ICommand):
    """
    Команда для завершения возврата платежа.

    Attributes:
        payment_id: ID платежа
    """

    payment_id: UUID


class CompleteRefundHandler(ICommandHandler[CompleteRefundCommand, Payment]):
    """
    Обработчик команды завершения возврата.
    """

    def __init__(self, repository: IPaymentRepository):
        self._repository = repository

    async def handle(self, command: CompleteRefundCommand) -> Result[Payment]:
        """
        Обрабатывает команду завершения возврата.

        Args:
            command: Команда завершения возврата

        Returns:
            Result с обновленным платежом или ошибкой
        """
        # Находим платеж
        payment = await self._repository.find_by_id(command.payment_id)
        if not payment:
            return Result.fail(f"Payment {command.payment_id} not found")

        # Завершаем возврат
        refund_result = payment.mark_refunded()
        if refund_result.is_failure:
            return Result.fail(refund_result.error)

        # Сохраняем изменения
        saved_payment = await self._repository.save(payment)

        return Result.ok(saved_payment)
