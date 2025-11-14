"""
Auth Tokens DTO

DTO для JWT токенов аутентификации.
"""

from dataclasses import dataclass


@dataclass
class AuthTokensDTO:
    """
    DTO для токенов аутентификации.

    Attributes:
        access_token: JWT access токен
        refresh_token: JWT refresh токен
        token_type: Тип токена (обычно "bearer")
        expires_in: Время жизни access токена в секундах
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 1800  # 30 минут по умолчанию
