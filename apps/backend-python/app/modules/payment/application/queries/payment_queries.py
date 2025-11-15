"""
Payment Queries

Запросы для получения информации о платежах.
"""
from dataclasses import dataclass
from typing import List, Optional, Tuple
from uuid import UUID

from app.core.application.query import IQuery, IQueryHandler
from app.core.domain.result import Result
from app.modules.payment.domain import Payment, PaymentStatusEnum, IPaymentRepository


# ========== Get Payment By ID ==========

@dataclass(frozen=True)
class GetPaymentByIdQuery(IQuery):
    """Запрос для получения платежа по ID"""
    payment_id: UUID
    user_id: UUID  # Для проверки прав доступа


class GetPaymentByIdHandler(IQueryHandler[GetPaymentByIdQuery, Optional[Payment]]):
    def __init__(self, repository: IPaymentRepository):
        self._repository = repository

    async def handle(self, query: GetPaymentByIdQuery) -> Result[Optional[Payment]]:
        payment = await self._repository.find_by_id(query.payment_id)
        if not payment:
            return Result.ok(None)

        # Проверяем права доступа
        if payment.user_id != query.user_id:
            return Result.fail("Access denied: not your payment")

        return Result.ok(payment)


# ========== Get User Payments ==========

@dataclass(frozen=True)
class GetUserPaymentsQuery(IQuery):
    """Запрос для получения платежей пользователя"""
    user_id: UUID
    status: Optional[PaymentStatusEnum] = None
    limit: int = 50
    offset: int = 0


class GetUserPaymentsHandler(IQueryHandler[GetUserPaymentsQuery, Tuple[List[Payment], int]]):
    def __init__(self, repository: IPaymentRepository):
        self._repository = repository

    async def handle(self, query: GetUserPaymentsQuery) -> Result[Tuple[List[Payment], int]]:
        # Валидация пагинации
        if query.limit < 1 or query.limit > 100:
            return Result.fail("Limit must be between 1 and 100")
        if query.offset < 0:
            return Result.fail("Offset must be non-negative")

        # Получаем платежи
        payments, total = await self._repository.find_by_user(
            user_id=query.user_id,
            status=query.status,
            limit=query.limit,
            offset=query.offset,
        )

        return Result.ok((payments, total))


# ========== Get Consultation Payment ==========

@dataclass(frozen=True)
class GetConsultationPaymentQuery(IQuery):
    """Запрос для получения платежа за консультацию"""
    consultation_id: UUID
    user_id: UUID  # Для проверки прав доступа


class GetConsultationPaymentHandler(IQueryHandler[GetConsultationPaymentQuery, Optional[Payment]]):
    def __init__(self, repository: IPaymentRepository):
        self._repository = repository

    async def handle(self, query: GetConsultationPaymentQuery) -> Result[Optional[Payment]]:
        payment = await self._repository.find_by_consultation(query.consultation_id)
        if not payment:
            return Result.ok(None)

        # Проверяем права доступа
        if payment.user_id != query.user_id:
            return Result.fail("Access denied: not your payment")

        return Result.ok(payment)
