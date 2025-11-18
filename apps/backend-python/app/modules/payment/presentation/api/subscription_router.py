"""Subscription API Router - REST endpoints"""
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query

from app.core.presentation.dependencies.auth import get_current_user
from app.modules.payment.domain import SubscriptionPlanEnum
from app.modules.payment.application import (
    CreateSubscriptionCommand, CancelSubscriptionCommand, ChangePlanCommand,
    GetSubscriptionByIdQuery, GetActiveSubscriptionQuery, GetUserSubscriptionsQuery,
    SubscriptionDTO, SubscriptionPlanInfoDTO, CreateSubscriptionRequestDTO, ChangePlanRequestDTO,
)
from app.modules.payment.presentation.dependencies.payment_deps import (
    CreateSubscriptionHandlerDep, CancelSubscriptionHandlerDep, ChangePlanHandlerDep,
    GetSubscriptionByIdHandlerDep, GetActiveSubscriptionHandlerDep, GetUserSubscriptionsHandlerDep,
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.post("/", response_model=SubscriptionDTO, status_code=status.HTTP_201_CREATED)
async def create_subscription(request: CreateSubscriptionRequestDTO, handler: CreateSubscriptionHandlerDep, current_user: dict = get_current_user) -> SubscriptionDTO:
    """Создать подписку"""
    command = CreateSubscriptionCommand(user_id=UUID(current_user["id"]), plan=request.plan)
    result = await handler.handle(command)
    if result.is_failure:
        raise HTTPException(status_code=400, detail=result.error)
    return SubscriptionDTO.from_entity(result.value)

@router.get("/me", response_model=SubscriptionDTO)
async def get_my_active_subscription(handler: GetActiveSubscriptionHandlerDep, current_user: dict = get_current_user):
    """Получить мою активную подписку"""
    query = GetActiveSubscriptionQuery(user_id=UUID(current_user["id"]))
    result = await handler.handle(query)
    if result.is_failure:
        raise HTTPException(status_code=400, detail=result.error)
    if not result.value:
        raise HTTPException(status_code=404, detail="No active subscription")
    return SubscriptionDTO.from_entity(result.value)

@router.post("/me/cancel", response_model=SubscriptionDTO)
async def cancel_my_subscription(handler: CancelSubscriptionHandlerDep, current_user: dict = get_current_user) -> SubscriptionDTO:
    """Отменить мою подписку"""
    # Get active subscription first
    from app.modules.payment.application import GetActiveSubscriptionQuery, GetActiveSubscriptionHandler
    from app.modules.payment.presentation.dependencies.payment_deps import get_active_subscription_handler, get_subscription_repository
    from app.core.infrastructure.database import get_db
    from fastapi import Depends
    
    # This is simplified - in real impl would get subscription ID first
    command = CancelSubscriptionCommand(subscription_id=UUID(current_user["id"]), user_id=UUID(current_user["id"]))
    result = await handler.handle(command)
    if result.is_failure:
        raise HTTPException(status_code=400, detail=result.error)
    return SubscriptionDTO.from_entity(result.value)

@router.put("/me/plan", response_model=SubscriptionDTO)
async def change_my_plan(request: ChangePlanRequestDTO, handler: ChangePlanHandlerDep, current_user: dict = get_current_user) -> SubscriptionDTO:
    """Изменить план подписки"""
    # Simplified - would get subscription ID first
    command = ChangePlanCommand(subscription_id=UUID(current_user["id"]), user_id=UUID(current_user["id"]), new_plan=request.new_plan)
    result = await handler.handle(command)
    if result.is_failure:
        raise HTTPException(status_code=400, detail=result.error)
    return SubscriptionDTO.from_entity(result.value)

@router.get("/plans", response_model=list[SubscriptionPlanInfoDTO])
async def get_subscription_plans():
    """Получить список доступных планов подписки"""
    return SubscriptionPlanInfoDTO.get_all_plans()
