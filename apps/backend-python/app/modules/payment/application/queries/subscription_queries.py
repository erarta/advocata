"""
Subscription Queries

Запросы для получения информации о подписках.
"""
from dataclasses import dataclass
from typing import List, Optional, Tuple
from uuid import UUID

from app.core.application.query import IQuery, IQueryHandler
from app.core.domain.result import Result
from app.modules.payment.domain import Subscription, ISubscriptionRepository


# ========== Get Subscription By ID ==========

@dataclass(frozen=True)
class GetSubscriptionByIdQuery(IQuery):
    """Запрос для получения подписки по ID"""
    subscription_id: UUID
    user_id: UUID  # Для проверки прав доступа


class GetSubscriptionByIdHandler(IQueryHandler[GetSubscriptionByIdQuery, Optional[Subscription]]):
    def __init__(self, repository: ISubscriptionRepository):
        self._repository = repository

    async def handle(self, query: GetSubscriptionByIdQuery) -> Result[Optional[Subscription]]:
        subscription = await self._repository.find_by_id(query.subscription_id)
        if not subscription:
            return Result.ok(None)

        # Проверяем права доступа
        if subscription.user_id != query.user_id:
            return Result.fail("Access denied: not your subscription")

        return Result.ok(subscription)


# ========== Get Active Subscription ==========

@dataclass(frozen=True)
class GetActiveSubscriptionQuery(IQuery):
    """Запрос для получения активной подписки пользователя"""
    user_id: UUID


class GetActiveSubscriptionHandler(IQueryHandler[GetActiveSubscriptionQuery, Optional[Subscription]]):
    def __init__(self, repository: ISubscriptionRepository):
        self._repository = repository

    async def handle(self, query: GetActiveSubscriptionQuery) -> Result[Optional[Subscription]]:
        subscription = await self._repository.find_active_by_user(query.user_id)
        return Result.ok(subscription)


# ========== Get User Subscriptions ==========

@dataclass(frozen=True)
class GetUserSubscriptionsQuery(IQuery):
    """Запрос для получения всех подписок пользователя (история)"""
    user_id: UUID
    include_inactive: bool = True
    limit: int = 50
    offset: int = 0


class GetUserSubscriptionsHandler(IQueryHandler[GetUserSubscriptionsQuery, Tuple[List[Subscription], int]]):
    def __init__(self, repository: ISubscriptionRepository):
        self._repository = repository

    async def handle(self, query: GetUserSubscriptionsQuery) -> Result[Tuple[List[Subscription], int]]:
        # Валидация пагинации
        if query.limit < 1 or query.limit > 100:
            return Result.fail("Limit must be between 1 and 100")
        if query.offset < 0:
            return Result.fail("Offset must be non-negative")

        # Получаем подписки
        subscriptions, total = await self._repository.find_by_user(
            user_id=query.user_id,
            include_inactive=query.include_inactive,
            limit=query.limit,
            offset=query.offset,
        )

        return Result.ok((subscriptions, total))
