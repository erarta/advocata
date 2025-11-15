"""
Create Subscription Payment Command

Команда для создания платежа за подписку.
"""
from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.payment.domain import (
    Payment,
    Money,
    PaymentMethod,
    PaymentMethodEnum,
    IPaymentRepository,
)


@dataclass(frozen=True)
class CreateSubscriptionPaymentCommand(ICommand):
    """
    Команда для создания платежа за подписку.

    Attributes:
        user_id: ID пользователя
        subscription_id: ID подписки
        amount: Сумма платежа
        currency: Валюта (по умолчанию RUB)
        payment_method: Способ оплаты
    """

    user_id: UUID
    subscription_id: UUID
    amount: Decimal
    currency: str = "RUB"
    payment_method: PaymentMethodEnum = PaymentMethodEnum.SUBSCRIPTION


class CreateSubscriptionPaymentHandler(
    ICommandHandler[CreateSubscriptionPaymentCommand, Payment]
):
    """
    Обработчик команды создания платежа за подписку.
    """

    def __init__(self, repository: IPaymentRepository):
        self._repository = repository

    async def handle(
        self, command: CreateSubscriptionPaymentCommand
    ) -> Result[Payment]:
        """
        Обрабатывает команду создания платежа.

        Args:
            command: Команда создания платежа

        Returns:
            Result с созданным платежом или ошибкой
        """
        # Создаем Money
        money_result = Money.create(amount=command.amount, currency=command.currency)
        if money_result.is_failure:
            return Result.fail(money_result.error)

        # Создаем PaymentMethod
        payment_method = PaymentMethod(value=command.payment_method)

        # Создаем Payment через Aggregate Root
        payment_result = Payment.create_subscription_payment(
            user_id=command.user_id,
            subscription_id=command.subscription_id,
            amount=money_result.value,
            payment_method=payment_method,
        )

        if payment_result.is_failure:
            return Result.fail(payment_result.error)

        # Сохраняем в репозитории
        saved_payment = await self._repository.save(payment_result.value)

        return Result.ok(saved_payment)
