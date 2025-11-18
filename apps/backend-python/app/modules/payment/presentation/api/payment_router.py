"""Payment API Router - REST endpoints"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query

from app.core.presentation.dependencies.auth import get_current_user
from app.modules.payment.domain import PaymentStatusEnum, PaymentMethodEnum, RefundReasonEnum
from app.modules.payment.application import (
    CreateConsultationPaymentCommand, CreateSubscriptionPaymentCommand,
    RequestRefundCommand, GetPaymentByIdQuery, GetUserPaymentsQuery,
    GetConsultationPaymentQuery, PaymentDTO, PaymentListItemDTO,
    PaymentSearchResultDTO, CreatePaymentRequestDTO, RequestRefundRequestDTO,
)
from app.modules.payment.presentation.dependencies.payment_deps import (
    CreateConsultationPaymentHandlerDep, CreateSubscriptionPaymentHandlerDep,
    RequestRefundHandlerDep, GetPaymentByIdHandlerDep,
    GetUserPaymentsHandlerDep, GetConsultationPaymentHandlerDep,
)

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/consultations", response_model=PaymentDTO, status_code=status.HTTP_201_CREATED)
async def create_consultation_payment(request: CreatePaymentRequestDTO, handler: CreateConsultationPaymentHandlerDep, current_user: dict = get_current_user) -> PaymentDTO:
    """Создать платеж за консультацию"""
    if not request.consultation_id:
        raise HTTPException(status_code=400, detail="consultation_id is required")
    
    command = CreateConsultationPaymentCommand(
        user_id=UUID(current_user["id"]), consultation_id=request.consultation_id,
        amount=request.amount, currency=request.currency, payment_method=request.payment_method
    )
    result = await handler.handle(command)
    if result.is_failure:
        raise HTTPException(status_code=400, detail=result.error)
    return PaymentDTO.from_entity(result.value)

@router.post("/subscriptions", response_model=PaymentDTO, status_code=status.HTTP_201_CREATED)
async def create_subscription_payment(request: CreatePaymentRequestDTO, handler: CreateSubscriptionPaymentHandlerDep, current_user: dict = get_current_user) -> PaymentDTO:
    """Создать платеж за подписку"""
    if not request.subscription_id:
        raise HTTPException(status_code=400, detail="subscription_id is required")
    
    command = CreateSubscriptionPaymentCommand(
        user_id=UUID(current_user["id"]), subscription_id=request.subscription_id,
        amount=request.amount, currency=request.currency, payment_method=request.payment_method
    )
    result = await handler.handle(command)
    if result.is_failure:
        raise HTTPException(status_code=400, detail=result.error)
    return PaymentDTO.from_entity(result.value)

@router.get("/{payment_id}", response_model=PaymentDTO)
async def get_payment(payment_id: UUID, handler: GetPaymentByIdHandlerDep, current_user: dict = get_current_user) -> PaymentDTO:
    """Получить платеж по ID"""
    query = GetPaymentByIdQuery(payment_id=payment_id, user_id=UUID(current_user["id"]))
    result = await handler.handle(query)
    if result.is_failure:
        raise HTTPException(status_code=403, detail=result.error)
    if not result.value:
        raise HTTPException(status_code=404, detail="Payment not found")
    return PaymentDTO.from_entity(result.value)

@router.get("/", response_model=PaymentSearchResultDTO)
async def get_my_payments(handler: GetUserPaymentsHandlerDep, current_user: dict = get_current_user, 
                          status_filter: Optional[PaymentStatusEnum] = Query(None, alias="status"),
                          limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0)) -> PaymentSearchResultDTO:
    """Получить мои платежи"""
    query = GetUserPaymentsQuery(user_id=UUID(current_user["id"]), status=status_filter, limit=limit, offset=offset)
    result = await handler.handle(query)
    if result.is_failure:
        raise HTTPException(status_code=400, detail=result.error)
    
    payments, total = result.value
    items = [PaymentListItemDTO.from_entity(p) for p in payments]
    return PaymentSearchResultDTO(items=items, total=total, limit=limit, offset=offset)

@router.post("/{payment_id}/refund", response_model=PaymentDTO)
async def request_refund(payment_id: UUID, request: RequestRefundRequestDTO, handler: RequestRefundHandlerDep, current_user: dict = get_current_user) -> PaymentDTO:
    """Запросить возврат платежа"""
    command = RequestRefundCommand(payment_id=payment_id, reason=request.reason, 
                                   reason_comment=request.reason_comment, refund_amount=request.refund_amount)
    result = await handler.handle(command)
    if result.is_failure:
        raise HTTPException(status_code=400, detail=result.error)
    return PaymentDTO.from_entity(result.value)

@router.get("/consultation/{consultation_id}", response_model=PaymentDTO)
async def get_consultation_payment(consultation_id: UUID, handler: GetConsultationPaymentHandlerDep, current_user: dict = get_current_user) -> PaymentDTO:
    """Получить платеж за консультацию"""
    query = GetConsultationPaymentQuery(consultation_id=consultation_id, user_id=UUID(current_user["id"]))
    result = await handler.handle(query)
    if result.is_failure:
        raise HTTPException(status_code=403, detail=result.error)
    if not result.value:
        raise HTTPException(status_code=404, detail="Payment not found")
    return PaymentDTO.from_entity(result.value)
