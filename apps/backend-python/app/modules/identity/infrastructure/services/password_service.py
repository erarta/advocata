"""
Password Service

Сервис для хеширования и проверки паролей.
"""

from abc import ABC, abstractmethod

from passlib.context import CryptContext


class IPasswordService(ABC):
    """
    Интерфейс сервиса для работы с паролями.
    """

    @abstractmethod
    def hash_password(self, password: str) -> str:
        """Хешировать пароль."""
        pass

    @abstractmethod
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Проверить пароль."""
        pass


class PasswordService(IPasswordService):
    """
    Реализация сервиса паролей с использованием bcrypt.

    Использует passlib для хеширования паролей с bcrypt алгоритмом.
    Настроено 12 раундов для баланса между безопасностью и производительностью.
    """

    def __init__(self) -> None:
        """Инициализация сервиса."""
        self._pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=12,
        )

    def hash_password(self, password: str) -> str:
        """
        Хешировать пароль.

        Args:
            password: Пароль в открытом виде

        Returns:
            Хеш пароля

        Example:
            ```python
            service = PasswordService()
            hashed = service.hash_password("mypassword123")
            # Returns: "$2b$12$..."
            ```
        """
        return self._pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Проверить соответствие пароля хешу.

        Args:
            plain_password: Пароль в открытом виде
            hashed_password: Хеш пароля

        Returns:
            True если пароль верный

        Example:
            ```python
            service = PasswordService()
            is_valid = service.verify_password("mypassword123", hashed)
            # Returns: True
            ```
        """
        return self._pwd_context.verify(plain_password, hashed_password)
