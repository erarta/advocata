"""
Consultation DTOs

DTOs для консультаций (запросы и ответы API).
"""
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.modules.consultation.domain import (
    Consultation,
    ConsultationStatusEnum,
    ConsultationTypeEnum,
)


# ========== Response DTOs ==========


class ConsultationDTO(BaseModel):
    """
    Полная DTO консультации для детального просмотра.
    """

    id: UUID
    client_id: UUID
    lawyer_id: UUID
    status: ConsultationStatusEnum
    consultation_type: ConsultationTypeEnum
    description: str
    price_amount: Decimal
    price_currency: str

    # Time information
    scheduled_start: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None

    # Rating information
    rating: Optional[int] = None
    review: Optional[str] = None

    # Cancellation information
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[str] = None
    cancelled_at: Optional[datetime] = None

    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_entity(cls, entity: Consultation) -> "ConsultationDTO":
        """
        Создает DTO из Domain Entity.

        Args:
            entity: Domain entity консультации

        Returns:
            ConsultationDTO
        """
        return cls(
            id=entity.id,
            client_id=entity.client_id,
            lawyer_id=entity.lawyer_id,
            status=entity.status.value,
            consultation_type=entity.consultation_type.value,
            description=entity.description,
            price_amount=entity.price.amount,
            price_currency=entity.price.currency,
            scheduled_start=(
                entity.time_slot.start_time if entity.time_slot else None
            ),
            duration_minutes=(
                entity.time_slot.duration_minutes if entity.time_slot else None
            ),
            actual_start=entity.actual_start,
            actual_end=entity.actual_end,
            rating=entity.rating,
            review=entity.review,
            cancellation_reason=entity.cancellation_reason,
            cancelled_by=entity.cancelled_by,
            cancelled_at=entity.cancelled_at,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )


class ConsultationListItemDTO(BaseModel):
    """
    Сокращенная DTO консультации для списков.
    """

    id: UUID
    client_id: UUID
    lawyer_id: UUID
    status: ConsultationStatusEnum
    consultation_type: ConsultationTypeEnum
    price_amount: Decimal
    price_currency: str
    scheduled_start: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_entity(cls, entity: Consultation) -> "ConsultationListItemDTO":
        """
        Создает DTO из Domain Entity.

        Args:
            entity: Domain entity консультации

        Returns:
            ConsultationListItemDTO
        """
        return cls(
            id=entity.id,
            client_id=entity.client_id,
            lawyer_id=entity.lawyer_id,
            status=entity.status.value,
            consultation_type=entity.consultation_type.value,
            price_amount=entity.price.amount,
            price_currency=entity.price.currency,
            scheduled_start=(
                entity.time_slot.start_time if entity.time_slot else None
            ),
            created_at=entity.created_at,
        )


class ConsultationSearchResultDTO(BaseModel):
    """
    DTO для результатов поиска с пагинацией.
    """

    items: List[ConsultationListItemDTO]
    total: int
    limit: int
    offset: int

    @property
    def has_more(self) -> bool:
        """Есть ли еще результаты после текущей страницы."""
        return self.offset + self.limit < self.total


# ========== Request DTOs ==========


class CreateConsultationRequestDTO(BaseModel):
    """
    DTO для создания новой консультации.
    """

    lawyer_id: UUID = Field(..., description="ID юриста")
    consultation_type: ConsultationTypeEnum = Field(
        ..., description="Тип консультации (emergency/scheduled)"
    )
    description: str = Field(
        ..., min_length=10, max_length=2000, description="Описание проблемы"
    )
    price_amount: Decimal = Field(..., gt=0, description="Цена консультации")
    price_currency: str = Field(default="RUB", description="Валюта")

    # For scheduled consultations
    scheduled_start: Optional[datetime] = Field(
        None, description="Время начала (для scheduled консультаций)"
    )
    duration_minutes: int = Field(
        default=60, ge=15, le=180, description="Длительность в минутах"
    )

    @field_validator("consultation_type")
    @classmethod
    def validate_consultation_type(cls, v: ConsultationTypeEnum) -> ConsultationTypeEnum:
        """Валидация типа консультации."""
        if v not in ConsultationTypeEnum:
            raise ValueError(f"Invalid consultation type: {v}")
        return v

    @field_validator("price_currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Валидация валюты."""
        allowed_currencies = ["RUB", "USD", "EUR"]
        if v not in allowed_currencies:
            raise ValueError(f"Currency must be one of: {allowed_currencies}")
        return v


class ConfirmConsultationRequestDTO(BaseModel):
    """
    DTO для подтверждения консультации юристом.
    """

    # Пустая DTO - все данные берутся из path параметров и auth
    pass


class CancelConsultationRequestDTO(BaseModel):
    """
    DTO для отмены консультации.
    """

    reason: str = Field(..., min_length=5, max_length=500, description="Причина отмены")


class RateConsultationRequestDTO(BaseModel):
    """
    DTO для оценки завершенной консультации.
    """

    rating: int = Field(..., ge=1, le=5, description="Оценка от 1 до 5")
    review: Optional[str] = Field(
        None, max_length=1000, description="Текстовый отзыв (опционально)"
    )
