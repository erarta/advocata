"""
Consultation Type Value Object

Тип консультации (экстренная или запланированная).
"""
from dataclasses import dataclass
from enum import Enum

from app.core.domain.value_object import ValueObject
from app.core.domain.result import Result


class ConsultationTypeEnum(str, Enum):
    """Возможные типы консультаций."""

    EMERGENCY = "emergency"  # Экстренная (немедленно, в течение 15-30 мин)
    SCHEDULED = "scheduled"  # Запланированная (заранее выбранное время)


@dataclass(frozen=True)
class ConsultationType(ValueObject):
    """
    Value Object для типа консультации.

    Attributes:
        value: Enum типа консультации
    """

    value: ConsultationTypeEnum

    @classmethod
    def create(cls, consultation_type: str) -> Result["ConsultationType"]:
        """
        Создает тип консультации из строки.

        Args:
            consultation_type: Строковое значение типа

        Returns:
            Result с ConsultationType или ошибкой
        """
        try:
            type_enum = ConsultationTypeEnum(consultation_type.lower())
            return Result.ok(cls(value=type_enum))
        except ValueError:
            valid_values = [t.value for t in ConsultationTypeEnum]
            return Result.fail(
                f"Invalid consultation type: {consultation_type}. "
                f"Valid values: {', '.join(valid_values)}"
            )

    @classmethod
    def emergency(cls) -> "ConsultationType":
        """Создает экстренную консультацию."""
        return cls(value=ConsultationTypeEnum.EMERGENCY)

    @classmethod
    def scheduled(cls) -> "ConsultationType":
        """Создает запланированную консультацию."""
        return cls(value=ConsultationTypeEnum.SCHEDULED)

    def is_emergency(self) -> bool:
        """Проверяет, является ли консультация экстренной."""
        return self.value == ConsultationTypeEnum.EMERGENCY

    def is_scheduled(self) -> bool:
        """Проверяет, является ли консультация запланированной."""
        return self.value == ConsultationTypeEnum.SCHEDULED

    def get_display_name(self) -> str:
        """Возвращает человекочитаемое название типа."""
        display_names = {
            ConsultationTypeEnum.EMERGENCY: "Экстренная",
            ConsultationTypeEnum.SCHEDULED: "Запланированная",
        }
        return display_names.get(self.value, self.value.value)

    def get_expected_response_time_minutes(self) -> int:
        """
        Возвращает ожидаемое время ответа в минутах.

        Returns:
            Количество минут до ожидаемого начала консультации
        """
        if self.is_emergency():
            return 30  # Экстренная - до 30 минут
        else:
            return 0  # Запланированная - в назначенное время
