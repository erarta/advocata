"""Subscription Repository Implementation"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.payment.domain import Subscription, SubscriptionPlanEnum, ISubscriptionRepository
from app.modules.payment.infrastructure.persistence.models import SubscriptionModel
from app.modules.payment.infrastructure.persistence.mappers import SubscriptionMapper


class SubscriptionRepositoryImpl(ISubscriptionRepository):
    def __init__(self, session: AsyncSession):
        self._session = session
        self._mapper = SubscriptionMapper()

    async def save(self, subscription: Subscription) -> Subscription:
        stmt = select(SubscriptionModel).where(SubscriptionModel.id == subscription.id)
        result = await self._session.execute(stmt)
        existing_model = result.scalar_one_or_none()

        if existing_model:
            self._mapper.update_model(subscription, existing_model)
        else:
            new_model = self._mapper.to_model(subscription)
            self._session.add(new_model)

        await self._session.flush()
        stmt = select(SubscriptionModel).where(SubscriptionModel.id == subscription.id)
        result = await self._session.execute(stmt)
        saved_model = result.scalar_one()
        return self._mapper.to_domain(saved_model)

    async def find_by_id(self, subscription_id: UUID) -> Optional[Subscription]:
        stmt = select(SubscriptionModel).where(SubscriptionModel.id == subscription_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._mapper.to_domain(model) if model else None

    async def find_active_by_user(self, user_id: UUID) -> Optional[Subscription]:
        stmt = select(SubscriptionModel).where(and_(SubscriptionModel.user_id == user_id, SubscriptionModel.is_active == True))
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._mapper.to_domain(model) if model else None

    async def find_by_user(self, user_id: UUID, include_inactive: bool = False, limit: int = 50, offset: int = 0) -> tuple[List[Subscription], int]:
        conditions = [SubscriptionModel.user_id == user_id]
        if not include_inactive:
            conditions.append(SubscriptionModel.is_active == True)

        count_stmt = select(func.count()).where(and_(*conditions))
        count_result = await self._session.execute(count_stmt)
        total = count_result.scalar_one()

        stmt = select(SubscriptionModel).where(and_(*conditions)).order_by(SubscriptionModel.created_at.desc()).limit(limit).offset(offset)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        subscriptions = [self._mapper.to_domain(model) for model in models]
        return subscriptions, total

    async def find_expiring_soon(self, days: int = 7) -> List[Subscription]:
        threshold = datetime.utcnow() + timedelta(days=days)
        stmt = select(SubscriptionModel).where(and_(SubscriptionModel.is_active == True, SubscriptionModel.end_date <= threshold, SubscriptionModel.end_date > datetime.utcnow()))
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._mapper.to_domain(model) for model in models]

    async def find_expired(self) -> List[Subscription]:
        stmt = select(SubscriptionModel).where(and_(SubscriptionModel.is_active == True, SubscriptionModel.end_date < datetime.utcnow()))
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._mapper.to_domain(model) for model in models]

    async def find_for_renewal(self) -> List[Subscription]:
        renewal_window = datetime.utcnow() + timedelta(days=1)
        stmt = select(SubscriptionModel).where(and_(SubscriptionModel.is_active == True, SubscriptionModel.auto_renew == True, SubscriptionModel.end_date <= renewal_window))
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._mapper.to_domain(model) for model in models]

    async def count_by_plan(self, plan: SubscriptionPlanEnum) -> int:
        stmt = select(func.count()).where(and_(SubscriptionModel.plan == plan, SubscriptionModel.is_active == True))
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def delete(self, subscription_id: UUID) -> bool:
        stmt = select(SubscriptionModel).where(SubscriptionModel.id == subscription_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True
