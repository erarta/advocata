"""
Consultation Entity (Aggregate Root)

Доменная сущность консультации.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from app.core.domain.aggregate_root import AggregateRoot
from app.core.domain.result import Result
from app.modules.consultation.domain.value_objects.consultation_status import (
    ConsultationStatus,
)
from app.modules.consultation.domain.value_objects.consultation_type import (
    ConsultationType,
)
from app.modules.consultation.domain.value_objects.time_slot import TimeSlot
from app.modules.consultation.domain.value_objects.price import Price
from app.modules.consultation.domain.events.consultation_booked import (
    ConsultationBookedEvent,
)
from app.modules.consultation.domain.events.consultation_confirmed import (
    ConsultationConfirmedEvent,
)
from app.modules.consultation.domain.events.consultation_started import (
    ConsultationStartedEvent,
)
from app.modules.consultation.domain.events.consultation_completed import (
    ConsultationCompletedEvent,
)
from app.modules.consultation.domain.events.consultation_cancelled import (
    ConsultationCancelledEvent,
)


class Consultation(AggregateRoot):
    """
    Aggregate Root для консультации.

    Представляет консультацию между клиентом и юристом.

    Business Rules:
    1. Консультация всегда принадлежит клиенту и юристу
    2. Emergency консультации не требуют временного слота
    3. Scheduled консультации требуют временной слот
    4. Только юрист может подтвердить консультацию
    5. Только pending консультации могут быть подтверждены
    6. Только confirmed консультации могут быть начаты
    7. Консультацию можно оценить только после completion
    8. Отменить можно только pending или confirmed консультации
    """

    MAX_DESCRIPTION_LENGTH = 2000
    MIN_DESCRIPTION_LENGTH = 10

    def __init__(
        self,
        id: UUID,
        client_id: UUID,
        lawyer_id: UUID,
        consultation_type: ConsultationType,
        price: Price,
        status: ConsultationStatus,
        description: str,
        time_slot: Optional[TimeSlot] = None,
        rating: Optional[int] = None,
        review: Optional[str] = None,
        cancellation_reason: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        confirmed_at: Optional[datetime] = None,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        cancelled_at: Optional[datetime] = None,
    ):
        """
        Создает экземпляр консультации.

        Args:
            id: Уникальный идентификатор
            client_id: ID клиента
            lawyer_id: ID юриста
            consultation_type: Тип консультации
            price: Цена консультации
            status: Статус консультации
            description: Описание проблемы
            time_slot: Временной слот (для scheduled)
            rating: Оценка (1-5) после завершения
            review: Отзыв клиента
            cancellation_reason: Причина отмены
            created_at: Дата создания
            updated_at: Дата обновления
            confirmed_at: Дата подтверждения
            started_at: Дата начала
            completed_at: Дата завершения
            cancelled_at: Дата отмены
        """
        super().__init__(id)
        self._client_id = client_id
        self._lawyer_id = lawyer_id
        self._consultation_type = consultation_type
        self._price = price
        self._status = status
        self._description = description
        self._time_slot = time_slot
        self._rating = rating
        self._review = review
        self._cancellation_reason = cancellation_reason
        self._created_at = created_at or datetime.utcnow()
        self._updated_at = updated_at or datetime.utcnow()
        self._confirmed_at = confirmed_at
        self._started_at = started_at
        self._completed_at = completed_at
        self._cancelled_at = cancelled_at

    @classmethod
    def book(
        cls,
        client_id: UUID,
        lawyer_id: UUID,
        consultation_type: ConsultationType,
        price: Price,
        description: str,
        time_slot: Optional[TimeSlot] = None,
    ) -> Result["Consultation"]:
        """
        Бронирует новую консультацию (фабричный метод).

        Args:
            client_id: ID клиента
            lawyer_id: ID юриста
            consultation_type: Тип консультации
            price: Цена
            description: Описание проблемы
            time_slot: Временной слот (обязателен для scheduled)

        Returns:
            Result с новой Consultation или ошибкой
        """
        # Валидация description
        if len(description) < cls.MIN_DESCRIPTION_LENGTH:
            return Result.fail(
                f"Description too short: {len(description)} characters. "
                f"Minimum: {cls.MIN_DESCRIPTION_LENGTH} characters"
            )

        if len(description) > cls.MAX_DESCRIPTION_LENGTH:
            return Result.fail(
                f"Description too long: {len(description)} characters. "
                f"Maximum: {cls.MAX_DESCRIPTION_LENGTH} characters"
            )

        # Валидация временного слота для scheduled консультаций
        if consultation_type.is_scheduled() and time_slot is None:
            return Result.fail("Time slot is required for scheduled consultations")

        # Emergency консультации не должны иметь time_slot
        if consultation_type.is_emergency() and time_slot is not None:
            return Result.fail("Emergency consultations cannot have a time slot")

        # Создаем консультацию
        consultation_id = uuid4()
        consultation = cls(
            id=consultation_id,
            client_id=client_id,
            lawyer_id=lawyer_id,
            consultation_type=consultation_type,
            price=price,
            status=ConsultationStatus.pending(),
            description=description,
            time_slot=time_slot,
        )

        # Добавляем domain event
        consultation.add_domain_event(
            ConsultationBookedEvent(
                consultation_id=str(consultation_id),
                client_id=str(client_id),
                lawyer_id=str(lawyer_id),
                consultation_type=consultation_type.value.value,
                price_amount=float(price.amount),
                scheduled_time=time_slot.start_time.isoformat() if time_slot else None,
            )
        )

        return Result.ok(consultation)

    def confirm(self) -> Result[None]:
        """
        Подтверждает консультацию (вызывается юристом).

        Returns:
            Result с None или ошибкой
        """
        # Проверка текущего статуса
        if not self._status.is_pending():
            return Result.fail(
                f"Cannot confirm consultation in status: {self._status.get_display_name()}"
            )

        # Изменяем статус
        self._status = ConsultationStatus.confirmed()
        self._confirmed_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

        # Добавляем domain event
        self.add_domain_event(
            ConsultationConfirmedEvent(
                consultation_id=str(self.id),
                lawyer_id=str(self._lawyer_id),
                confirmed_at=self._confirmed_at.isoformat(),
            )
        )

        return Result.ok(None)

    def start(self) -> Result[None]:
        """
        Начинает консультацию (открывает чат/видеозвонок).

        Returns:
            Result с None или ошибкой
        """
        # Проверка текущего статуса
        if not self._status.is_confirmed():
            return Result.fail(
                f"Cannot start consultation in status: {self._status.get_display_name()}"
            )

        # Для scheduled консультаций проверяем время
        if self._time_slot and not self._time_slot.is_starting_soon(minutes=15):
            time_until = self._time_slot.get_time_until_start()
            return Result.fail(
                f"Cannot start consultation yet. "
                f"Scheduled time: {self._time_slot.start_time.isoformat()}. "
                f"Time remaining: {time_until}"
            )

        # Изменяем статус
        self._status = ConsultationStatus.active()
        self._started_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

        # Добавляем domain event
        self.add_domain_event(
            ConsultationStartedEvent(
                consultation_id=str(self.id),
                client_id=str(self._client_id),
                lawyer_id=str(self._lawyer_id),
                started_at=self._started_at.isoformat(),
            )
        )

        return Result.ok(None)

    def complete(self) -> Result[None]:
        """
        Завершает консультацию.

        Returns:
            Result с None или ошибкой
        """
        # Проверка текущего статуса
        if not self._status.is_active():
            return Result.fail(
                f"Cannot complete consultation in status: {self._status.get_display_name()}"
            )

        # Изменяем статус
        self._status = ConsultationStatus.completed()
        self._completed_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

        # Добавляем domain event
        self.add_domain_event(
            ConsultationCompletedEvent(
                consultation_id=str(self.id),
                client_id=str(self._client_id),
                lawyer_id=str(self._lawyer_id),
                completed_at=self._completed_at.isoformat(),
                duration_minutes=self._get_duration_minutes(),
            )
        )

        return Result.ok(None)

    def cancel(self, reason: str, cancelled_by: str) -> Result[None]:
        """
        Отменяет консультацию.

        Args:
            reason: Причина отмены
            cancelled_by: Кто отменил (client/lawyer)

        Returns:
            Result с None или ошибкой
        """
        # Проверка текущего статуса (можно отменить только pending или confirmed)
        if not (self._status.is_pending() or self._status.is_confirmed()):
            return Result.fail(
                f"Cannot cancel consultation in status: {self._status.get_display_name()}"
            )

        # Валидация причины
        if len(reason) < 5:
            return Result.fail("Cancellation reason too short (minimum 5 characters)")

        # Изменяем статус
        self._status = ConsultationStatus.cancelled()
        self._cancellation_reason = reason
        self._cancelled_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

        # Добавляем domain event
        self.add_domain_event(
            ConsultationCancelledEvent(
                consultation_id=str(self.id),
                client_id=str(self._client_id),
                lawyer_id=str(self._lawyer_id),
                cancelled_by=cancelled_by,
                reason=reason,
                cancelled_at=self._cancelled_at.isoformat(),
            )
        )

        return Result.ok(None)

    def rate(self, rating: int, review: Optional[str] = None) -> Result[None]:
        """
        Оценивает консультацию (вызывается клиентом после завершения).

        Args:
            rating: Оценка от 1 до 5
            review: Текстовый отзыв (опционально)

        Returns:
            Result с None или ошибкой
        """
        # Проверка статуса (можно оценить только completed)
        if not self._status.is_completed():
            return Result.fail("Can only rate completed consultations")

        # Проверка, что еще не оценена
        if self._rating is not None:
            return Result.fail("Consultation already rated")

        # Валидация рейтинга
        if rating < 1 or rating > 5:
            return Result.fail("Rating must be between 1 and 5")

        # Валидация отзыва
        if review and len(review) > 2000:
            return Result.fail("Review too long (maximum 2000 characters)")

        # Устанавливаем оценку
        self._rating = rating
        self._review = review
        self._updated_at = datetime.utcnow()

        return Result.ok(None)

    def _get_duration_minutes(self) -> Optional[int]:
        """Вычисляет длительность консультации в минутах."""
        if self._started_at and self._completed_at:
            duration = self._completed_at - self._started_at
            return int(duration.total_seconds() / 60)
        return None

    # Свойства для доступа к полям (read-only)
    @property
    def client_id(self) -> UUID:
        return self._client_id

    @property
    def lawyer_id(self) -> UUID:
        return self._lawyer_id

    @property
    def consultation_type(self) -> ConsultationType:
        return self._consultation_type

    @property
    def price(self) -> Price:
        return self._price

    @property
    def status(self) -> ConsultationStatus:
        return self._status

    @property
    def description(self) -> str:
        return self._description

    @property
    def time_slot(self) -> Optional[TimeSlot]:
        return self._time_slot

    @property
    def rating(self) -> Optional[int]:
        return self._rating

    @property
    def review(self) -> Optional[str]:
        return self._review

    @property
    def cancellation_reason(self) -> Optional[str]:
        return self._cancellation_reason

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        return self._updated_at

    @property
    def confirmed_at(self) -> Optional[datetime]:
        return self._confirmed_at

    @property
    def started_at(self) -> Optional[datetime]:
        return self._started_at

    @property
    def completed_at(self) -> Optional[datetime]:
        return self._completed_at

    @property
    def cancelled_at(self) -> Optional[datetime]:
        return self._cancelled_at
