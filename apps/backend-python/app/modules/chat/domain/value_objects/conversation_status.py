"""
Conversation Status Value Object

Статус беседы с AI ассистентом.
"""
from enum import Enum

from app.shared.domain.value_object import ValueObject
from app.shared.domain.result import Result


class ConversationStatusEnum(str, Enum):
    """Перечисление статусов беседы"""

    ACTIVE = "active"  # Активная беседа
    ARCHIVED = "archived"  # Архивирована
    DELETED = "deleted"  # Удалена


class ConversationStatus(ValueObject):
    """
    Value Object для статуса беседы.

    Определяет жизненный цикл беседы в системе.
    """

    # Отображаемые названия статусов
    DISPLAY_NAMES = {
        ConversationStatusEnum.ACTIVE: "Активная",
        ConversationStatusEnum.ARCHIVED: "Архивирована",
        ConversationStatusEnum.DELETED: "Удалена",
    }

    def __init__(self, value: ConversationStatusEnum):
        """
        Создает экземпляр статуса беседы.

        Args:
            value: Статус из перечисления
        """
        self._value = value

    @classmethod
    def create(cls, value: str) -> Result["ConversationStatus"]:
        """
        Создает экземпляр статуса с валидацией.

        Args:
            value: Строковое значение статуса

        Returns:
            Result с ConversationStatus или ошибкой
        """
        try:
            status_enum = ConversationStatusEnum(value)
            return Result.ok(cls(status_enum))
        except ValueError:
            valid_statuses = ", ".join([s.value for s in ConversationStatusEnum])
            return Result.fail(
                f"Invalid conversation status: {value}. "
                f"Valid statuses: {valid_statuses}"
            )

    @classmethod
    def active(cls) -> "ConversationStatus":
        """Создает статус 'Активная'"""
        return cls(ConversationStatusEnum.ACTIVE)

    @classmethod
    def archived(cls) -> "ConversationStatus":
        """Создает статус 'Архивирована'"""
        return cls(ConversationStatusEnum.ARCHIVED)

    @classmethod
    def deleted(cls) -> "ConversationStatus":
        """Создает статус 'Удалена'"""
        return cls(ConversationStatusEnum.DELETED)

    @property
    def value(self) -> ConversationStatusEnum:
        """Возвращает значение перечисления"""
        return self._value

    @property
    def display_name(self) -> str:
        """Возвращает отображаемое название"""
        return self.DISPLAY_NAMES.get(self._value, self._value.value)

    @property
    def is_active(self) -> bool:
        """Проверяет, активна ли беседа"""
        return self._value == ConversationStatusEnum.ACTIVE

    @property
    def is_archived(self) -> bool:
        """Проверяет, архивирована ли беседа"""
        return self._value == ConversationStatusEnum.ARCHIVED

    @property
    def is_deleted(self) -> bool:
        """Проверяет, удалена ли беседа"""
        return self._value == ConversationStatusEnum.DELETED

    @property
    def can_send_messages(self) -> bool:
        """Проверяет, можно ли отправлять сообщения"""
        return self._value == ConversationStatusEnum.ACTIVE

    @property
    def can_be_archived(self) -> bool:
        """Проверяет, можно ли архивировать"""
        return self._value == ConversationStatusEnum.ACTIVE

    @property
    def can_be_deleted(self) -> bool:
        """Проверяет, можно ли удалить"""
        return self._value in {
            ConversationStatusEnum.ACTIVE,
            ConversationStatusEnum.ARCHIVED,
        }

    def _get_equality_components(self) -> tuple:
        """Возвращает компоненты для сравнения"""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление"""
        return self.display_name

    def __repr__(self) -> str:
        """Представление для отладки"""
        return f"ConversationStatus({self._value.value})"
