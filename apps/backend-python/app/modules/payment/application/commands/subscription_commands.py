"""
Subscription Commands

Команды для управления подписками.
"""
from dataclasses import dataclass
from uuid import UUID

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.payment.domain import (
    Subscription,
    SubscriptionPlan,
    SubscriptionPlanEnum,
    ISubscriptionRepository,
)


# ========== Create Subscription ==========

@dataclass(frozen=True)
class CreateSubscriptionCommand(ICommand):
    """Команда для создания подписки"""
    user_id: UUID
    plan: SubscriptionPlanEnum


class CreateSubscriptionHandler(ICommandHandler[CreateSubscriptionCommand, Subscription]):
    def __init__(self, repository: ISubscriptionRepository):
        self._repository = repository

    async def handle(self, command: CreateSubscriptionCommand) -> Result[Subscription]:
        # Проверяем, нет ли уже активной подписки
        existing = await self._repository.find_active_by_user(command.user_id)
        if existing:
            return Result.fail("User already has an active subscription")

        # Создаем план подписки
        plan = SubscriptionPlan(value=command.plan)

        # Создаем подписку
        subscription_result = Subscription.create(user_id=command.user_id, plan=plan)
        if subscription_result.is_failure:
            return Result.fail(subscription_result.error)

        # Сохраняем
        saved = await self._repository.save(subscription_result.value)
        return Result.ok(saved)


# ========== Activate Subscription ==========

@dataclass(frozen=True)
class ActivateSubscriptionCommand(ICommand):
    """Команда для активации подписки (после оплаты)"""
    subscription_id: UUID


class ActivateSubscriptionHandler(ICommandHandler[ActivateSubscriptionCommand, Subscription]):
    def __init__(self, repository: ISubscriptionRepository):
        self._repository = repository

    async def handle(self, command: ActivateSubscriptionCommand) -> Result[Subscription]:
        subscription = await self._repository.find_by_id(command.subscription_id)
        if not subscription:
            return Result.fail(f"Subscription {command.subscription_id} not found")

        activate_result = subscription.activate()
        if activate_result.is_failure:
            return Result.fail(activate_result.error)

        saved = await self._repository.save(subscription)
        return Result.ok(saved)


# ========== Cancel Subscription ==========

@dataclass(frozen=True)
class CancelSubscriptionCommand(ICommand):
    """Команда для отмены подписки"""
    subscription_id: UUID
    user_id: UUID


class CancelSubscriptionHandler(ICommandHandler[CancelSubscriptionCommand, Subscription]):
    def __init__(self, repository: ISubscriptionRepository):
        self._repository = repository

    async def handle(self, command: CancelSubscriptionCommand) -> Result[Subscription]:
        subscription = await self._repository.find_by_id(command.subscription_id)
        if not subscription:
            return Result.fail(f"Subscription {command.subscription_id} not found")

        # Проверяем права доступа
        if subscription.user_id != command.user_id:
            return Result.fail("Access denied: not your subscription")

        cancel_result = subscription.cancel()
        if cancel_result.is_failure:
            return Result.fail(cancel_result.error)

        saved = await self._repository.save(subscription)
        return Result.ok(saved)


# ========== Renew Subscription ==========

@dataclass(frozen=True)
class RenewSubscriptionCommand(ICommand):
    """Команда для продления подписки"""
    subscription_id: UUID


class RenewSubscriptionHandler(ICommandHandler[RenewSubscriptionCommand, Subscription]):
    def __init__(self, repository: ISubscriptionRepository):
        self._repository = repository

    async def handle(self, command: RenewSubscriptionCommand) -> Result[Subscription]:
        subscription = await self._repository.find_by_id(command.subscription_id)
        if not subscription:
            return Result.fail(f"Subscription {command.subscription_id} not found")

        renew_result = subscription.renew()
        if renew_result.is_failure:
            return Result.fail(renew_result.error)

        saved = await self._repository.save(subscription)
        return Result.ok(saved)


# ========== Change Plan ==========

@dataclass(frozen=True)
class ChangePlanCommand(ICommand):
    """Команда для изменения плана подписки"""
    subscription_id: UUID
    user_id: UUID
    new_plan: SubscriptionPlanEnum


class ChangePlanHandler(ICommandHandler[ChangePlanCommand, Subscription]):
    def __init__(self, repository: ISubscriptionRepository):
        self._repository = repository

    async def handle(self, command: ChangePlanCommand) -> Result[Subscription]:
        subscription = await self._repository.find_by_id(command.subscription_id)
        if not subscription:
            return Result.fail(f"Subscription {command.subscription_id} not found")

        # Проверяем права доступа
        if subscription.user_id != command.user_id:
            return Result.fail("Access denied: not your subscription")

        # Создаем новый план
        new_plan = SubscriptionPlan(value=command.new_plan)

        # Изменяем план
        change_result = subscription.change_plan(new_plan)
        if change_result.is_failure:
            return Result.fail(change_result.error)

        saved = await self._repository.save(subscription)
        return Result.ok(saved)
