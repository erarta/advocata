"""
Identity API - Response Schemas

Pydantic схемы для ответов API.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    """
    Схема ответа с данными пользователя.

    Example:
        ```json
        {
            "id": "uuid-here",
            "phone": "+79991234567",
            "email": "user@example.com",
            "full_name": "Иван Иванов",
            "role": "CLIENT",
            "is_active": true,
            "phone_verified": true,
            "email_verified": false,
            "is_verified": true,
            "last_login_at": "2025-01-01T00:00:00Z",
            "created_at": "2025-01-01T00:00:00Z"
        }
        ```
    """

    id: str = Field(..., description="ID пользователя")
    phone: Optional[str] = Field(None, description="Номер телефона")
    email: Optional[str] = Field(None, description="Email адрес")
    full_name: str = Field(..., description="Полное имя")
    role: str = Field(..., description="Роль пользователя")
    is_active: bool = Field(..., description="Активен ли пользователь")
    phone_verified: bool = Field(..., description="Подтвержден ли телефон")
    email_verified: bool = Field(..., description="Подтвержден ли email")
    is_verified: bool = Field(..., description="Общая верификация")
    last_login_at: Optional[datetime] = Field(None, description="Время последнего входа")
    created_at: datetime = Field(..., description="Дата создания")

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "phone": "+79991234567",
                "email": None,
                "full_name": "Иван Иванов",
                "role": "CLIENT",
                "is_active": True,
                "phone_verified": True,
                "email_verified": False,
                "is_verified": True,
                "last_login_at": "2025-01-01T12:00:00Z",
                "created_at": "2025-01-01T10:00:00Z",
            }
        }
    }


class AuthResponse(BaseModel):
    """
    Схема ответа с токенами аутентификации.

    Example:
        ```json
        {
            "access_token": "eyJhbGciOiJIUzI1...",
            "refresh_token": "eyJhbGciOiJIUzI1...",
            "token_type": "bearer",
            "expires_in": 1800
        }
        ```
    """

    access_token: str = Field(..., description="JWT access токен")
    refresh_token: str = Field(..., description="JWT refresh токен")
    token_type: str = Field(default="bearer", description="Тип токена")
    expires_in: int = Field(..., description="Время жизни access токена (секунды)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
            }
        }
    }


class RegisterResponse(BaseModel):
    """
    Схема ответа регистрации.

    Example:
        ```json
        {
            "user_id": "uuid-here",
            "message": "OTP sent to +79991234567"
        }
        ```
    """

    user_id: str = Field(..., description="ID созданного пользователя")
    message: str = Field(..., description="Сообщение о результате")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "message": "OTP sent to +79991234567",
            }
        }
    }


class ErrorResponse(BaseModel):
    """
    Схема ответа с ошибкой.

    Example:
        ```json
        {
            "error": "Invalid credentials"
        }
        ```
    """

    error: str = Field(..., description="Сообщение об ошибке")

    model_config = {
        "json_schema_extra": {
            "example": {
                "error": "Invalid credentials",
            }
        }
    }
