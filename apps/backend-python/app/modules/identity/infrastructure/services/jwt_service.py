"""
JWT Service

Сервис для генерации и валидации JWT токенов.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from jose import JWTError, jwt

from app.config import settings


class IJWTService(ABC):
    """
    Интерфейс сервиса для работы с JWT.
    """

    @property
    @abstractmethod
    def access_token_expire_minutes(self) -> int:
        """Время жизни access токена в минутах."""
        pass

    @abstractmethod
    def create_access_token(self, user_id: str) -> str:
        """Создать access токен."""
        pass

    @abstractmethod
    def create_refresh_token(self, user_id: str) -> str:
        """Создать refresh токен."""
        pass

    @abstractmethod
    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Декодировать токен."""
        pass


class JWTService(IJWTService):
    """
    Реализация JWT сервиса с использованием python-jose.

    Генерирует и валидирует JWT токены для аутентификации пользователей.
    """

    def __init__(self) -> None:
        """Инициализация сервиса."""
        self._secret_key = settings.jwt_secret_key
        self._algorithm = settings.jwt_algorithm
        self._access_token_expire = settings.jwt_access_token_expire_minutes
        self._refresh_token_expire = settings.jwt_refresh_token_expire_days

    @property
    def access_token_expire_minutes(self) -> int:
        """Время жизни access токена."""
        return self._access_token_expire

    def create_access_token(self, user_id: str) -> str:
        """
        Создать access токен.

        Args:
            user_id: ID пользователя

        Returns:
            JWT access токен

        Example:
            ```python
            service = JWTService()
            token = service.create_access_token("user-123")
            # Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            ```
        """
        expire = datetime.utcnow() + timedelta(minutes=self._access_token_expire)

        payload = {
            "sub": user_id,
            "type": "access",
            "exp": expire,
            "iat": datetime.utcnow(),
        }

        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def create_refresh_token(self, user_id: str) -> str:
        """
        Создать refresh токен.

        Args:
            user_id: ID пользователя

        Returns:
            JWT refresh токен

        Example:
            ```python
            service = JWTService()
            token = service.create_refresh_token("user-123")
            ```
        """
        expire = datetime.utcnow() + timedelta(days=self._refresh_token_expire)

        payload = {
            "sub": user_id,
            "type": "refresh",
            "exp": expire,
            "iat": datetime.utcnow(),
        }

        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Декодировать и валидировать токен.

        Args:
            token: JWT токен

        Returns:
            Payload токена или None если невалидный

        Example:
            ```python
            service = JWTService()
            payload = service.decode_token(token)
            if payload:
                user_id = payload["sub"]
            ```
        """
        try:
            payload = jwt.decode(
                token,
                self._secret_key,
                algorithms=[self._algorithm],
            )
            return payload
        except JWTError:
            return None

    def verify_access_token(self, token: str) -> Optional[str]:
        """
        Верифицировать access токен и получить user_id.

        Args:
            token: JWT access токен

        Returns:
            User ID или None если токен невалидный
        """
        payload = self.decode_token(token)

        if not payload:
            return None

        if payload.get("type") != "access":
            return None

        return payload.get("sub")

    def verify_refresh_token(self, token: str) -> Optional[str]:
        """
        Верифицировать refresh токен и получить user_id.

        Args:
            token: JWT refresh токен

        Returns:
            User ID или None если токен невалидный
        """
        payload = self.decode_token(token)

        if not payload:
            return None

        if payload.get("type") != "refresh":
            return None

        return payload.get("sub")
