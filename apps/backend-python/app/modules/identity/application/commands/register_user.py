"""
Register User Command

Команда для регистрации нового пользователя.
"""

from typing import Optional
from dataclasses import dataclass


@dataclass
class RegisterUserCommand:
    """
    Команда: зарегистрировать нового пользователя.

    Attributes:
        phone: Номер телефона (опционально)
        email: Email адрес (опционально)
        full_name: Полное имя
        password: Пароль в открытом виде
        role: Роль пользователя (по умолчанию CLIENT)
    """

    phone: Optional[str]
    email: Optional[str]
    full_name: str
    password: str
    role: str = "CLIENT"

    def __post_init__(self) -> None:
        """Валидация после инициализации."""
        if not self.phone and not self.email:
            raise ValueError("Either phone or email must be provided")

        if not self.password or len(self.password) < 8:
            raise ValueError("Password must be at least 8 characters long")
