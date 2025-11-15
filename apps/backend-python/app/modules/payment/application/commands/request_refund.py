"""
Request Refund Command

Команда для запроса возврата платежа.
"""
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.payment.domain import (
    Payment,
    Money,
    RefundReason,
    RefundReasonEnum,
    IPaymentRepository,
)


@dataclass(frozen=True)
class RequestRefundCommand(ICommand):
    """
    Команда для запроса возврата платежа.

    Attributes:
        payment_id: ID платежа
        reason: Причина возврата
        reason_comment: Комментарий к причине
        refund_amount: Сумма возврата (если частичный, иначе полный)
    """

    payment_id: UUID
    reason: RefundReasonEnum
    reason_comment: str = ""
    refund_amount: Optional[Decimal] = None


class RequestRefundHandler(ICommandHandler[RequestRefundCommand, Payment]):
    """
    Обработчик команды запроса возврата.
    """

    def __init__(self, repository: IPaymentRepository):
        self._repository = repository

    async def handle(self, command: RequestRefundCommand) -> Result[Payment]:
        """
        Обрабатывает команду запроса возврата.

        Args:
            command: Команда запроса возврата

        Returns:
            Result с обновленным платежом или ошибкой
        """
        # Находим платеж
        payment = await self._repository.find_by_id(command.payment_id)
        if not payment:
            return Result.fail(f"Payment {command.payment_id} not found")

        # Создаем RefundReason
        refund_reason = RefundReason(
            value=command.reason, comment=command.reason_comment
        )

        # Создаем Money для суммы возврата (если указана)
        refund_money = None
        if command.refund_amount:
            money_result = Money.create(
                amount=command.refund_amount, currency=payment.amount.currency
            )
            if money_result.is_failure:
                return Result.fail(money_result.error)
            refund_money = money_result.value

        # Запрашиваем возврат
        refund_result = payment.request_refund(
            reason=refund_reason, amount=refund_money
        )
        if refund_result.is_failure:
            return Result.fail(refund_result.error)

        # Сохраняем изменения
        saved_payment = await self._repository.save(payment)

        return Result.ok(saved_payment)
