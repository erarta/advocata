"""
VerificationStatus Value Object

Статус верификации юриста.
"""

from enum import Enum
from typing import Any

from app.core.domain.value_object import ValueObject


class VerificationStatusType(str, Enum):
    """
    Статусы верификации юриста.

    Lifecycle:
    1. PENDING - Ожидает проверки (начальный статус)
    2. IN_REVIEW - На проверке у администратора
    3. VERIFIED - Верифицирован (документы проверены)
    4. REJECTED - Отклонен (документы не прошли проверку)
    5. SUSPENDED - Приостановлен (временная блокировка)
    """

    PENDING = "pending"
    IN_REVIEW = "in_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

    @property
    def display_name(self) -> str:
        """Возвращает русское название статуса."""
        display_names = {
            self.PENDING: "Ожидает проверки",
            self.IN_REVIEW: "На проверке",
            self.VERIFIED: "Верифицирован",
            self.REJECTED: "Отклонен",
            self.SUSPENDED: "Приостановлен",
        }
        return display_names[self]

    @property
    def description(self) -> str:
        """Возвращает описание статуса."""
        descriptions = {
            self.PENDING: "Заявка отправлена, ожидает рассмотрения администратором",
            self.IN_REVIEW: "Администратор проверяет документы",
            self.VERIFIED: "Документы проверены, юрист может принимать заказы",
            self.REJECTED: "Документы не прошли проверку, требуется повторная подача",
            self.SUSPENDED: "Аккаунт временно заблокирован администратором",
        }
        return descriptions[self]

    @property
    def can_accept_consultations(self) -> bool:
        """Может ли юрист принимать консультации."""
        return self == self.VERIFIED

    @property
    def is_active(self) -> bool:
        """Является ли статус активным."""
        return self in [self.IN_REVIEW, self.VERIFIED]

    @property
    def requires_action(self) -> bool:
        """Требует ли статус действия от администратора."""
        return self in [self.PENDING, self.IN_REVIEW]


class VerificationStatus(ValueObject):
    """
    Value Object для статуса верификации юриста.

    Представляет текущий статус проверки документов юриста.
    Неизменяемый объект.

    Business Rules:
    - Новый юрист всегда начинает со статуса PENDING
    - Только VERIFIED юристы могут принимать консультации
    - REJECTED юристы должны повторно подать документы
    - SUSPENDED юристы временно заблокированы

    Examples:
        >>> status = VerificationStatus(VerificationStatusType.PENDING)
        >>> status.is_pending
        True
        >>> status.can_accept_consultations
        False
        >>> status = VerificationStatus(VerificationStatusType.VERIFIED)
        >>> status.can_accept_consultations
        True
    """

    def __init__(self, value: VerificationStatusType | str) -> None:
        """
        Создает статус верификации.

        Args:
            value: Тип статуса (enum или строка)

        Raises:
            ValueError: Если статус невалидный
        """
        if isinstance(value, str):
            try:
                value = VerificationStatusType(value)
            except ValueError:
                raise ValueError(f"Invalid verification status: {value}")

        if not isinstance(value, VerificationStatusType):
            raise ValueError(f"Invalid verification status type: {type(value)}")

        self._value = value

    @classmethod
    def pending(cls) -> "VerificationStatus":
        """Создает статус PENDING."""
        return cls(VerificationStatusType.PENDING)

    @classmethod
    def in_review(cls) -> "VerificationStatus":
        """Создает статус IN_REVIEW."""
        return cls(VerificationStatusType.IN_REVIEW)

    @classmethod
    def verified(cls) -> "VerificationStatus":
        """Создает статус VERIFIED."""
        return cls(VerificationStatusType.VERIFIED)

    @classmethod
    def rejected(cls) -> "VerificationStatus":
        """Создает статус REJECTED."""
        return cls(VerificationStatusType.REJECTED)

    @classmethod
    def suspended(cls) -> "VerificationStatus":
        """Создает статус SUSPENDED."""
        return cls(VerificationStatusType.SUSPENDED)

    @property
    def value(self) -> VerificationStatusType:
        """Возвращает enum статуса."""
        return self._value

    @property
    def display_name(self) -> str:
        """Возвращает русское название статуса."""
        return self._value.display_name

    @property
    def description(self) -> str:
        """Возвращает описание статуса."""
        return self._value.description

    @property
    def can_accept_consultations(self) -> bool:
        """Может ли юрист принимать консультации."""
        return self._value.can_accept_consultations

    @property
    def is_pending(self) -> bool:
        """Проверяет, находится ли статус в ожидании."""
        return self._value == VerificationStatusType.PENDING

    @property
    def is_in_review(self) -> bool:
        """Проверяет, находится ли статус на проверке."""
        return self._value == VerificationStatusType.IN_REVIEW

    @property
    def is_verified(self) -> bool:
        """Проверяет, верифицирован ли юрист."""
        return self._value == VerificationStatusType.VERIFIED

    @property
    def is_rejected(self) -> bool:
        """Проверяет, отклонен ли юрист."""
        return self._value == VerificationStatusType.REJECTED

    @property
    def is_suspended(self) -> bool:
        """Проверяет, приостановлен ли юрист."""
        return self._value == VerificationStatusType.SUSPENDED

    @property
    def is_active(self) -> bool:
        """Проверяет, активен ли статус."""
        return self._value.is_active

    @property
    def requires_action(self) -> bool:
        """Требует ли статус действия от администратора."""
        return self._value.requires_action

    def _get_equality_components(self) -> tuple[Any, ...]:
        """Компоненты для сравнения."""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление."""
        return self.display_name

    def __repr__(self) -> str:
        """Представление для отладки."""
        return f"VerificationStatus({self._value.value})"
