"""
Consultation Status Value Object

Статус жизненного цикла консультации.
"""
from dataclasses import dataclass
from enum import Enum

from app.core.domain.value_object import ValueObject
from app.core.domain.result import Result


class ConsultationStatusEnum(str, Enum):
    """Возможные статусы консультации."""

    # Начальные статусы
    PENDING = "pending"  # Ожидает подтверждения юриста
    CONFIRMED = "confirmed"  # Подтверждена юристом, ожидает начала

    # Активные статусы
    ACTIVE = "active"  # Консультация идет (клиент и юрист на связи)

    # Завершающие статусы
    COMPLETED = "completed"  # Успешно завершена
    CANCELLED = "cancelled"  # Отменена (клиентом или юристом)
    FAILED = "failed"  # Не состоялась (юрист не вышел, технические проблемы)
    EXPIRED = "expired"  # Истекло время (никто не начал консультацию)


@dataclass(frozen=True)
class ConsultationStatus(ValueObject):
    """
    Value Object для статуса консультации.

    Attributes:
        value: Enum статуса
    """

    value: ConsultationStatusEnum

    @classmethod
    def create(cls, status: str) -> Result["ConsultationStatus"]:
        """
        Создает статус из строки.

        Args:
            status: Строковое значение статуса

        Returns:
            Result с ConsultationStatus или ошибкой
        """
        try:
            status_enum = ConsultationStatusEnum(status.lower())
            return Result.ok(cls(value=status_enum))
        except ValueError:
            valid_values = [s.value for s in ConsultationStatusEnum]
            return Result.fail(
                f"Invalid consultation status: {status}. "
                f"Valid values: {', '.join(valid_values)}"
            )

    @classmethod
    def pending(cls) -> "ConsultationStatus":
        """Создает статус PENDING."""
        return cls(value=ConsultationStatusEnum.PENDING)

    @classmethod
    def confirmed(cls) -> "ConsultationStatus":
        """Создает статус CONFIRMED."""
        return cls(value=ConsultationStatusEnum.CONFIRMED)

    @classmethod
    def active(cls) -> "ConsultationStatus":
        """Создает статус ACTIVE."""
        return cls(value=ConsultationStatusEnum.ACTIVE)

    @classmethod
    def completed(cls) -> "ConsultationStatus":
        """Создает статус COMPLETED."""
        return cls(value=ConsultationStatusEnum.COMPLETED)

    @classmethod
    def cancelled(cls) -> "ConsultationStatus":
        """Создает статус CANCELLED."""
        return cls(value=ConsultationStatusEnum.CANCELLED)

    @classmethod
    def failed(cls) -> "ConsultationStatus":
        """Создает статус FAILED."""
        return cls(value=ConsultationStatusEnum.FAILED)

    @classmethod
    def expired(cls) -> "ConsultationStatus":
        """Создает статус EXPIRED."""
        return cls(value=ConsultationStatusEnum.EXPIRED)

    def is_pending(self) -> bool:
        """Проверяет, ожидает ли консультация подтверждения."""
        return self.value == ConsultationStatusEnum.PENDING

    def is_confirmed(self) -> bool:
        """Проверяет, подтверждена ли консультация."""
        return self.value == ConsultationStatusEnum.CONFIRMED

    def is_active(self) -> bool:
        """Проверяет, активна ли консультация."""
        return self.value == ConsultationStatusEnum.ACTIVE

    def is_completed(self) -> bool:
        """Проверяет, завершена ли консультация."""
        return self.value == ConsultationStatusEnum.COMPLETED

    def is_cancelled(self) -> bool:
        """Проверяет, отменена ли консультация."""
        return self.value == ConsultationStatusEnum.CANCELLED

    def is_failed(self) -> bool:
        """Проверяет, провалилась ли консультация."""
        return self.value == ConsultationStatusEnum.FAILED

    def is_expired(self) -> bool:
        """Проверяет, истекла ли консультация."""
        return self.value == ConsultationStatusEnum.EXPIRED

    def is_final(self) -> bool:
        """
        Проверяет, в финальном ли статусе консультация.

        Финальные статусы: completed, cancelled, failed, expired
        """
        return self.value in [
            ConsultationStatusEnum.COMPLETED,
            ConsultationStatusEnum.CANCELLED,
            ConsultationStatusEnum.FAILED,
            ConsultationStatusEnum.EXPIRED,
        ]

    def can_transition_to(self, new_status: "ConsultationStatus") -> bool:
        """
        Проверяет, возможен ли переход в новый статус.

        Допустимые переходы:
        - pending → confirmed, cancelled, expired
        - confirmed → active, cancelled, expired
        - active → completed, failed
        - completed, cancelled, failed, expired → (нельзя менять)

        Args:
            new_status: Новый статус

        Returns:
            True если переход возможен
        """
        # Из финальных статусов нельзя переходить
        if self.is_final():
            return False

        # Допустимые переходы
        valid_transitions = {
            ConsultationStatusEnum.PENDING: [
                ConsultationStatusEnum.CONFIRMED,
                ConsultationStatusEnum.CANCELLED,
                ConsultationStatusEnum.EXPIRED,
            ],
            ConsultationStatusEnum.CONFIRMED: [
                ConsultationStatusEnum.ACTIVE,
                ConsultationStatusEnum.CANCELLED,
                ConsultationStatusEnum.EXPIRED,
            ],
            ConsultationStatusEnum.ACTIVE: [
                ConsultationStatusEnum.COMPLETED,
                ConsultationStatusEnum.FAILED,
            ],
        }

        return new_status.value in valid_transitions.get(self.value, [])

    def get_display_name(self) -> str:
        """Возвращает человекочитаемое название статуса."""
        display_names = {
            ConsultationStatusEnum.PENDING: "Ожидает подтверждения",
            ConsultationStatusEnum.CONFIRMED: "Подтверждена",
            ConsultationStatusEnum.ACTIVE: "Идет консультация",
            ConsultationStatusEnum.COMPLETED: "Завершена",
            ConsultationStatusEnum.CANCELLED: "Отменена",
            ConsultationStatusEnum.FAILED: "Не состоялась",
            ConsultationStatusEnum.EXPIRED: "Истекло время",
        }
        return display_names.get(self.value, self.value.value)
