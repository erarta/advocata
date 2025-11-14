"""
Login User Command

Команда для входа пользователя в систему.
"""

from dataclasses import dataclass


@dataclass
class LoginUserCommand:
    """
    Команда: вход пользователя.

    Attributes:
        phone: Номер телефона (опционально)
        email: Email адрес (опционально)
        password: Пароль
    """

    phone: str | None
    email: str | None
    password: str

    def __post_init__(self) -> None:
        """Валидация после инициализации."""
        if not self.phone and not self.email:
            raise ValueError("Either phone or email must be provided")

        if not self.password:
            raise ValueError("Password is required")
