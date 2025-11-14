"""
Message Role Value Object

Роль отправителя сообщения в чате.
"""
from enum import Enum

from app.shared.domain.value_object import ValueObject
from app.shared.domain.result import Result


class MessageRoleEnum(str, Enum):
    """Перечисление ролей сообщений"""

    USER = "user"  # Сообщение от пользователя
    ASSISTANT = "assistant"  # Ответ AI ассистента
    SYSTEM = "system"  # Системное сообщение (для промптов)


class MessageRole(ValueObject):
    """
    Value Object для роли сообщения.

    Определяет, кто отправил сообщение: пользователь, AI или система.
    """

    # Отображаемые названия ролей
    DISPLAY_NAMES = {
        MessageRoleEnum.USER: "Пользователь",
        MessageRoleEnum.ASSISTANT: "AI Ассистент",
        MessageRoleEnum.SYSTEM: "Система",
    }

    def __init__(self, value: MessageRoleEnum):
        """
        Создает экземпляр роли сообщения.

        Args:
            value: Роль из перечисления
        """
        self._value = value

    @classmethod
    def create(cls, value: str) -> Result["MessageRole"]:
        """
        Создает экземпляр роли с валидацией.

        Args:
            value: Строковое значение роли

        Returns:
            Result с MessageRole или ошибкой
        """
        try:
            role_enum = MessageRoleEnum(value)
            return Result.ok(cls(role_enum))
        except ValueError:
            valid_roles = ", ".join([r.value for r in MessageRoleEnum])
            return Result.fail(
                f"Invalid message role: {value}. "
                f"Valid roles: {valid_roles}"
            )

    @classmethod
    def user(cls) -> "MessageRole":
        """Создает роль 'Пользователь'"""
        return cls(MessageRoleEnum.USER)

    @classmethod
    def assistant(cls) -> "MessageRole":
        """Создает роль 'AI Ассистент'"""
        return cls(MessageRoleEnum.ASSISTANT)

    @classmethod
    def system(cls) -> "MessageRole":
        """Создает роль 'Система'"""
        return cls(MessageRoleEnum.SYSTEM)

    @property
    def value(self) -> MessageRoleEnum:
        """Возвращает значение перечисления"""
        return self._value

    @property
    def display_name(self) -> str:
        """Возвращает отображаемое название"""
        return self.DISPLAY_NAMES.get(self._value, self._value.value)

    @property
    def is_user(self) -> bool:
        """Проверяет, является ли сообщение от пользователя"""
        return self._value == MessageRoleEnum.USER

    @property
    def is_assistant(self) -> bool:
        """Проверяет, является ли сообщение от AI"""
        return self._value == MessageRoleEnum.ASSISTANT

    @property
    def is_system(self) -> bool:
        """Проверяет, является ли системным сообщением"""
        return self._value == MessageRoleEnum.SYSTEM

    def _get_equality_components(self) -> tuple:
        """Возвращает компоненты для сравнения"""
        return (self._value,)

    def __str__(self) -> str:
        """Строковое представление"""
        return self.display_name

    def __repr__(self) -> str:
        """Представление для отладки"""
        return f"MessageRole({self._value.value})"
