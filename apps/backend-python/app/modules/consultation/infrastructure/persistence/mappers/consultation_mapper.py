"""
Consultation Mapper

Mapper для конвертации между Domain Entity и ORM Model.
"""
from typing import Optional

from app.modules.consultation.domain import (
    Consultation,
    ConsultationStatus,
    ConsultationType,
    TimeSlot,
    Price,
)
from app.modules.consultation.infrastructure.persistence.models import ConsultationModel


class ConsultationMapper:
    """
    Mapper для конвертации Consultation Entity <-> ConsultationModel.
    """

    @staticmethod
    def to_domain(model: ConsultationModel) -> Consultation:
        """
        Конвертирует ORM модель в Domain Entity.

        Args:
            model: ORM модель консультации

        Returns:
            Consultation domain entity
        """
        # Создаем Value Objects
        status = ConsultationStatus(value=model.status)
        consultation_type = ConsultationType(value=model.consultation_type)
        price = Price(amount=model.price_amount, currency=model.price_currency)

        # Создаем TimeSlot если есть scheduled время
        time_slot = None
        if model.scheduled_start and model.duration_minutes:
            time_slot = TimeSlot(
                start_time=model.scheduled_start,
                duration_minutes=model.duration_minutes,
            )

        # Создаем Entity
        # Используем __init__ напрямую, т.к. это восстановление из БД
        consultation = Consultation.__new__(Consultation)
        consultation._id = model.id
        consultation._client_id = model.client_id
        consultation._lawyer_id = model.lawyer_id
        consultation._status = status
        consultation._consultation_type = consultation_type
        consultation._description = model.description
        consultation._price = price
        consultation._time_slot = time_slot
        consultation._actual_start = model.actual_start
        consultation._actual_end = model.actual_end
        consultation._rating = model.rating
        consultation._review = model.review
        consultation._cancellation_reason = model.cancellation_reason
        consultation._cancelled_by = model.cancelled_by
        consultation._cancelled_at = model.cancelled_at
        consultation._created_at = model.created_at
        consultation._updated_at = model.updated_at
        consultation._domain_events = []

        return consultation

    @staticmethod
    def to_model(entity: Consultation) -> ConsultationModel:
        """
        Конвертирует Domain Entity в ORM модель.

        Args:
            entity: Consultation domain entity

        Returns:
            ConsultationModel ORM модель
        """
        return ConsultationModel(
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

    @staticmethod
    def update_model(entity: Consultation, model: ConsultationModel) -> None:
        """
        Обновляет существующую ORM модель данными из Entity.

        Args:
            entity: Consultation domain entity
            model: ConsultationModel для обновления
        """
        model.status = entity.status.value
        model.consultation_type = entity.consultation_type.value
        model.description = entity.description
        model.price_amount = entity.price.amount
        model.price_currency = entity.price.currency
        model.scheduled_start = (
            entity.time_slot.start_time if entity.time_slot else None
        )
        model.duration_minutes = (
            entity.time_slot.duration_minutes if entity.time_slot else None
        )
        model.actual_start = entity.actual_start
        model.actual_end = entity.actual_end
        model.rating = entity.rating
        model.review = entity.review
        model.cancellation_reason = entity.cancellation_reason
        model.cancelled_by = entity.cancelled_by
        model.cancelled_at = entity.cancelled_at
        model.updated_at = entity.updated_at
