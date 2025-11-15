"""
Book Consultation Command

Команда для бронирования новой консультации.
"""
from dataclasses import dataclass
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal

from app.core.application.command import ICommand, ICommandHandler
from app.core.domain.result import Result
from app.modules.consultation.domain import (
    Consultation,
    ConsultationType,
    ConsultationTypeEnum,
    Price,
    TimeSlot,
    IConsultationRepository,
)


@dataclass(frozen=True)
class BookConsultationCommand(ICommand):
    """
    Команда для бронирования консультации.

    Attributes:
        client_id: ID клиента
        lawyer_id: ID юриста
        consultation_type: Тип консультации (emergency/scheduled)
        price_amount: Цена консультации
        price_currency: Валюта (по умолчанию RUB)
        description: Описание проблемы от клиента
        scheduled_start: Время начала (для scheduled консультаций)
        duration_minutes: Длительность в минутах (для scheduled консультаций)
    """

    client_id: UUID
    lawyer_id: UUID
    consultation_type: ConsultationTypeEnum
    price_amount: Decimal
    description: str
    price_currency: str = "RUB"
    scheduled_start: Optional[datetime] = None
    duration_minutes: int = 60


class BookConsultationHandler(ICommandHandler[BookConsultationCommand, Consultation]):
    """
    Обработчик команды бронирования консультации.
    """

    def __init__(self, repository: IConsultationRepository):
        self._repository = repository

    async def handle(self, command: BookConsultationCommand) -> Result[Consultation]:
        """
        Обрабатывает команду бронирования консультации.

        Args:
            command: Команда бронирования

        Returns:
            Result с созданной консультацией или ошибкой
        """
        # Создаем Price
        price_result = Price.create(
            amount=command.price_amount, currency=command.price_currency
        )
        if price_result.is_failure:
            return Result.fail(price_result.error)

        # Создаем ConsultationType
        consultation_type_result = ConsultationType.create(command.consultation_type)
        if consultation_type_result.is_failure:
            return Result.fail(consultation_type_result.error)

        # Создаем TimeSlot если это scheduled консультация
        time_slot = None
        if command.consultation_type == ConsultationTypeEnum.SCHEDULED:
            if not command.scheduled_start:
                return Result.fail(
                    "Scheduled consultations require scheduled_start time"
                )

            time_slot_result = TimeSlot.create(
                start_time=command.scheduled_start,
                duration_minutes=command.duration_minutes,
            )
            if time_slot_result.is_failure:
                return Result.fail(time_slot_result.error)

            time_slot = time_slot_result.value

            # Проверяем конфликты расписания юриста
            conflicts = await self._repository.find_scheduled_in_timeframe(
                lawyer_id=command.lawyer_id,
                start_time=time_slot.start_time,
                end_time=time_slot.end_time,
            )
            if conflicts:
                return Result.fail(
                    f"Lawyer already has a consultation scheduled at this time"
                )

        # Создаем консультацию через Aggregate Root
        consultation_result = Consultation.book(
            client_id=command.client_id,
            lawyer_id=command.lawyer_id,
            consultation_type=consultation_type_result.value,
            price=price_result.value,
            description=command.description,
            time_slot=time_slot,
        )

        if consultation_result.is_failure:
            return Result.fail(consultation_result.error)

        # Сохраняем в репозитории
        saved_consultation = await self._repository.save(consultation_result.value)

        return Result.ok(saved_consultation)
