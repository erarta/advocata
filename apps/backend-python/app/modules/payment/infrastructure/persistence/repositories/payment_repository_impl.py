"""Payment Repository Implementation"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.payment.domain import Payment, PaymentStatusEnum, IPaymentRepository
from app.modules.payment.infrastructure.persistence.models import PaymentModel
from app.modules.payment.infrastructure.persistence.mappers import PaymentMapper


class PaymentRepositoryImpl(IPaymentRepository):
    def __init__(self, session: AsyncSession):
        self._session = session
        self._mapper = PaymentMapper()

    async def save(self, payment: Payment) -> Payment:
        stmt = select(PaymentModel).where(PaymentModel.id == payment.id)
        result = await self._session.execute(stmt)
        existing_model = result.scalar_one_or_none()

        if existing_model:
            self._mapper.update_model(payment, existing_model)
        else:
            new_model = self._mapper.to_model(payment)
            self._session.add(new_model)

        await self._session.flush()
        stmt = select(PaymentModel).where(PaymentModel.id == payment.id)
        result = await self._session.execute(stmt)
        saved_model = result.scalar_one()
        return self._mapper.to_domain(saved_model)

    async def find_by_id(self, payment_id: UUID) -> Optional[Payment]:
        stmt = select(PaymentModel).where(PaymentModel.id == payment_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._mapper.to_domain(model) if model else None

    async def find_by_external_id(self, external_payment_id: str) -> Optional[Payment]:
        stmt = select(PaymentModel).where(PaymentModel.external_payment_id == external_payment_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._mapper.to_domain(model) if model else None

    async def find_by_user(self, user_id: UUID, status: Optional[PaymentStatusEnum] = None, limit: int = 50, offset: int = 0) -> tuple[List[Payment], int]:
        conditions = [PaymentModel.user_id == user_id]
        if status:
            conditions.append(PaymentModel.status == status)

        count_stmt = select(func.count()).where(and_(*conditions))
        count_result = await self._session.execute(count_stmt)
        total = count_result.scalar_one()

        stmt = select(PaymentModel).where(and_(*conditions)).order_by(PaymentModel.created_at.desc()).limit(limit).offset(offset)
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        payments = [self._mapper.to_domain(model) for model in models]
        return payments, total

    async def find_by_consultation(self, consultation_id: UUID) -> Optional[Payment]:
        stmt = select(PaymentModel).where(PaymentModel.consultation_id == consultation_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._mapper.to_domain(model) if model else None

    async def find_by_subscription(self, subscription_id: UUID) -> List[Payment]:
        stmt = select(PaymentModel).where(PaymentModel.subscription_id == subscription_id).order_by(PaymentModel.created_at.desc())
        result = await self._session.execute(stmt)
        models = result.scalars().all()
        return [self._mapper.to_domain(model) for model in models]

    async def count_by_user(self, user_id: UUID, status: Optional[PaymentStatusEnum] = None) -> int:
        conditions = [PaymentModel.user_id == user_id]
        if status:
            conditions.append(PaymentModel.status == status)
        stmt = select(func.count()).where(and_(*conditions))
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def delete(self, payment_id: UUID) -> bool:
        stmt = select(PaymentModel).where(PaymentModel.id == payment_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return False
        await self._session.delete(model)
        await self._session.flush()
        return True
