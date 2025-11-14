"""
User Role Value Object

Роли пользователей в системе.
"""

from enum import Enum


class UserRole(str, Enum):
    """
    Роли пользователей в системе Advocata.

    Attributes:
        CLIENT: Клиент, ищущий юридическую помощь
        LAWYER: Юрист, предоставляющий услуги
        ADMIN: Администратор системы
    """

    CLIENT = "CLIENT"
    LAWYER = "LAWYER"
    ADMIN = "ADMIN"

    def __str__(self) -> str:
        """Строковое представление."""
        return self.value

    @classmethod
    def default(cls) -> "UserRole":
        """
        Роль по умолчанию для новых пользователей.

        Returns:
            UserRole.CLIENT
        """
        return cls.CLIENT

    @property
    def is_client(self) -> bool:
        """Проверка роли клиента."""
        return self == UserRole.CLIENT

    @property
    def is_lawyer(self) -> bool:
        """Проверка роли юриста."""
        return self == UserRole.LAWYER

    @property
    def is_admin(self) -> bool:
        """Проверка роли администратора."""
        return self == UserRole.ADMIN

    @property
    def display_name(self) -> str:
        """
        Человекочитаемое название роли.

        Returns:
            Название роли на русском
        """
        names = {
            UserRole.CLIENT: "Клиент",
            UserRole.LAWYER: "Юрист",
            UserRole.ADMIN: "Администратор",
        }
        return names[self]
