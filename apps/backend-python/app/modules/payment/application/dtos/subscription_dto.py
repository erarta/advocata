"""
Subscription DTOs

DTOs для подписок (запросы и ответы API).
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.modules.payment.domain import (
    Subscription,
    SubscriptionPlanEnum,
)


# ========== Response DTOs ==========


class SubscriptionDTO(BaseModel):
    """Полная DTO подписки для детального просмотра"""

    id: UUID
    user_id: UUID
    plan: SubscriptionPlanEnum

    # Status
    is_active: bool
    auto_renew: bool

    # Dates
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    # Usage
    consultations_used: int

    # Timestamps
    created_at: datetime
    updated_at: datetime

    # Computed fields
    days_until_expiration: Optional[int] = None
    can_use_consultation: bool = False

    class Config:
        from_attributes = True

    @classmethod
    def from_entity(cls, entity: Subscription) -> "SubscriptionDTO":
        """Создает DTO из Domain Entity"""
        return cls(
            id=entity.id,
            user_id=entity.user_id,
            plan=entity.plan.value,
            is_active=entity.is_active,
            auto_renew=entity.auto_renew,
            start_date=entity.start_date,
            end_date=entity.end_date,
            cancelled_at=entity.cancelled_at,
            consultations_used=entity.consultations_used,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            days_until_expiration=entity.days_until_expiration() if entity.is_active else None,
            can_use_consultation=entity.can_use_consultation(),
        )


class SubscriptionPlanInfoDTO(BaseModel):
    """DTO для информации о плане подписки (для отображения тарифов)"""

    plan: SubscriptionPlanEnum
    name: str
    monthly_price: Decimal
    consultations_limit: int  # -1 = безлимит
    discount_percent: float
    has_priority_support: bool
    has_document_analysis: bool

    @classmethod
    def from_plan_enum(cls, plan: SubscriptionPlanEnum) -> "SubscriptionPlanInfoDTO":
        """Создает DTO из SubscriptionPlanEnum"""
        from app.modules.payment.domain import SubscriptionPlan

        plan_obj = SubscriptionPlan(value=plan)

        return cls(
            plan=plan,
            name=plan_obj.get_display_name(),
            monthly_price=plan_obj.get_monthly_price(),
            consultations_limit=plan_obj.get_consultations_limit(),
            discount_percent=plan_obj.get_discount_percent(),
            has_priority_support=plan_obj.has_priority_support(),
            has_document_analysis=plan_obj.has_document_analysis(),
        )

    @classmethod
    def get_all_plans(cls) -> list["SubscriptionPlanInfoDTO"]:
        """Получить информацию о всех доступных планах"""
        return [
            cls.from_plan_enum(SubscriptionPlanEnum.FREE),
            cls.from_plan_enum(SubscriptionPlanEnum.BASIC),
            cls.from_plan_enum(SubscriptionPlanEnum.PRO),
            cls.from_plan_enum(SubscriptionPlanEnum.ENTERPRISE),
        ]


# ========== Request DTOs ==========


class CreateSubscriptionRequestDTO(BaseModel):
    """DTO для создания подписки"""

    plan: SubscriptionPlanEnum = Field(..., description="План подписки")


class ChangePlanRequestDTO(BaseModel):
    """DTO для изменения плана подписки"""

    new_plan: SubscriptionPlanEnum = Field(..., description="Новый план подписки")
