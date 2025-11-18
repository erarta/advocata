"""
User Repository Interface

Интерфейс репозитория для управления пользователями.
"""

from abc import ABC, abstractmethod
from typing import Optional

from ..entities.user import User
from ..value_objects.email import Email
from ..value_objects.phone import Phone


class IUserRepository(ABC):
    """
    Интерфейс репозитория пользователей.

    Определяет контракт для persistence layer без привязки к конкретной реализации.
    Следует принципу Dependency Inversion (SOLID).
    """

    @abstractmethod
    async def save(self, user: User) -> None:
        """
        Сохранить пользователя (создать или обновить).

        Args:
            user: Пользователь для сохранения

        Raises:
            RepositoryError: При ошибке сохранения
        """
        pass

    @abstractmethod
    async def find_by_id(self, user_id: str) -> Optional[User]:
        """
        Найти пользователя по ID.

        Args:
            user_id: ID пользователя

        Returns:
            User или None если не найден
        """
        pass

    @abstractmethod
    async def find_by_phone(self, phone: Phone) -> Optional[User]:
        """
        Найти пользователя по номеру телефона.

        Args:
            phone: Номер телефона

        Returns:
            User или None если не найден
        """
        pass

    @abstractmethod
    async def find_by_email(self, email: Email) -> Optional[User]:
        """
        Найти пользователя по email.

        Args:
            email: Email адрес

        Returns:
            User или None если не найден
        """
        pass

    @abstractmethod
    async def exists_by_phone(self, phone: Phone) -> bool:
        """
        Проверить существование пользователя по телефону.

        Args:
            phone: Номер телефона

        Returns:
            True если пользователь существует
        """
        pass

    @abstractmethod
    async def exists_by_email(self, email: Email) -> bool:
        """
        Проверить существование пользователя по email.

        Args:
            email: Email адрес

        Returns:
            True если пользователь существует
        """
        pass

    @abstractmethod
    async def delete(self, user_id: str) -> None:
        """
        Удалить пользователя.

        Args:
            user_id: ID пользователя

        Raises:
            RepositoryError: При ошибке удаления
        """
        pass
