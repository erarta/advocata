"""
Time Slot Value Object

Временной слот для запланированной консультации.
"""
from dataclasses import dataclass
from datetime import datetime, timedelta

from app.core.domain.value_object import ValueObject
from app.core.domain.result import Result


@dataclass(frozen=True)
class TimeSlot(ValueObject):
    """
    Value Object для временного слота консультации.

    Attributes:
        start_time: Время начала консультации (UTC)
        duration_minutes: Длительность в минутах (по умолчанию 60)
    """

    start_time: datetime
    duration_minutes: int = 60  # По умолчанию 1 час

    @classmethod
    def create(
        cls,
        start_time: datetime,
        duration_minutes: int = 60,
    ) -> Result["TimeSlot"]:
        """
        Создает временной слот с валидацией.

        Args:
            start_time: Время начала
            duration_minutes: Длительность в минутах

        Returns:
            Result с TimeSlot или ошибкой
        """
        # Валидация длительности
        if duration_minutes < 15:
            return Result.fail("Duration must be at least 15 minutes")

        if duration_minutes > 480:  # 8 часов
            return Result.fail("Duration cannot exceed 480 minutes (8 hours)")

        # Валидация времени (не в прошлом)
        if start_time < datetime.utcnow():
            return Result.fail("Start time cannot be in the past")

        # Проверка, что время не слишком далеко в будущем (макс 90 дней)
        max_future = datetime.utcnow() + timedelta(days=90)
        if start_time > max_future:
            return Result.fail("Cannot schedule consultation more than 90 days in advance")

        return Result.ok(cls(start_time=start_time, duration_minutes=duration_minutes))

    @property
    def end_time(self) -> datetime:
        """Вычисляет время окончания консультации."""
        return self.start_time + timedelta(minutes=self.duration_minutes)

    def is_in_past(self) -> bool:
        """Проверяет, в прошлом ли этот слот."""
        return self.end_time < datetime.utcnow()

    def is_starting_soon(self, minutes: int = 15) -> bool:
        """
        Проверяет, скоро ли начнется консультация.

        Args:
            minutes: Количество минут для проверки

        Returns:
            True если консультация начнется в ближайшие N минут
        """
        now = datetime.utcnow()
        threshold = now + timedelta(minutes=minutes)
        return now <= self.start_time <= threshold

    def is_active_now(self) -> bool:
        """Проверяет, идет ли консультация прямо сейчас."""
        now = datetime.utcnow()
        return self.start_time <= now <= self.end_time

    def conflicts_with(self, other: "TimeSlot") -> bool:
        """
        Проверяет, пересекается ли этот слот с другим.

        Args:
            other: Другой временной слот

        Returns:
            True если слоты пересекаются
        """
        # Два слота пересекаются если:
        # - начало одного находится внутри другого
        # - или конец одного находится внутри другого
        return (
            self.start_time < other.end_time and self.end_time > other.start_time
        )

    def get_time_until_start(self) -> timedelta:
        """Возвращает время до начала консультации."""
        return self.start_time - datetime.utcnow()

    def get_time_remaining(self) -> timedelta:
        """Возвращает оставшееся время консультации (если она идет)."""
        if not self.is_active_now():
            return timedelta(0)
        return self.end_time - datetime.utcnow()

    def format_time_range(self) -> str:
        """Форматирует временной диапазон для отображения."""
        return f"{self.start_time.strftime('%Y-%m-%d %H:%M')} - {self.end_time.strftime('%H:%M')} UTC"
