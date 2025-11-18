"""
Identity API - Request Schemas

Pydantic схемы для запросов к API.
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator


class RegisterRequest(BaseModel):
    """
    Схема запроса регистрации пользователя.

    Example:
        ```json
        {
            "phone": "+79991234567",
            "email": "user@example.com",
            "full_name": "Иван Иванов",
            "password": "SecurePass123!",
            "role": "CLIENT"
        }
        ```
    """

    phone: Optional[str] = Field(
        None,
        description="Номер телефона в международном формате",
        examples=["+79991234567"],
    )
    email: Optional[str] = Field(
        None,
        description="Email адрес",
        examples=["user@example.com"],
    )
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Полное имя пользователя",
        examples=["Иван Иванов"],
    )
    password: str = Field(
        ...,
        min_length=8,
        description="Пароль (минимум 8 символов)",
        examples=["SecurePass123!"],
    )
    role: str = Field(
        default="CLIENT",
        description="Роль пользователя",
        examples=["CLIENT", "LAWYER"],
    )

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        """Валидация роли."""
        allowed_roles = ["CLIENT", "LAWYER"]
        if v not in allowed_roles:
            raise ValueError(f"Role must be one of: {', '.join(allowed_roles)}")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "phone": "+79991234567",
                "full_name": "Иван Иванов",
                "password": "SecurePass123!",
                "role": "CLIENT",
            }
        }
    }


class VerifyOTPRequest(BaseModel):
    """
    Схема запроса верификации OTP.

    Example:
        ```json
        {
            "phone": "+79991234567",
            "otp_code": "123456"
        }
        ```
    """

    phone: Optional[str] = Field(
        None,
        description="Номер телефона",
        examples=["+79991234567"],
    )
    email: Optional[str] = Field(
        None,
        description="Email адрес",
        examples=["user@example.com"],
    )
    otp_code: str = Field(
        ...,
        min_length=6,
        max_length=6,
        description="6-значный OTP код",
        examples=["123456"],
    )

    @field_validator("otp_code")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        """Валидация OTP кода."""
        if not v.isdigit():
            raise ValueError("OTP code must contain only digits")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "phone": "+79991234567",
                "otp_code": "123456",
            }
        }
    }


class LoginRequest(BaseModel):
    """
    Схема запроса входа.

    Example:
        ```json
        {
            "phone": "+79991234567",
            "password": "SecurePass123!"
        }
        ```
    """

    phone: Optional[str] = Field(
        None,
        description="Номер телефона",
        examples=["+79991234567"],
    )
    email: Optional[str] = Field(
        None,
        description="Email адрес",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        description="Пароль",
        examples=["SecurePass123!"],
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "phone": "+79991234567",
                "password": "SecurePass123!",
            }
        }
    }
