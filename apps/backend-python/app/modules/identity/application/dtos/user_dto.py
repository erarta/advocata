"""
User DTO

DTO для передачи данных пользователя.
"""

from datetime import datetime
from typing import Optional
from dataclasses import dataclass

from ...domain.value_objects.user_role import UserRole


@dataclass
class UserDTO:
    """
    DTO для пользователя.

    Используется для передачи данных пользователя между слоями
    без раскрытия доменной модели.

    Attributes:
        id: ID пользователя
        phone: Номер телефона (опционально)
        email: Email адрес (опционально)
        full_name: Полное имя
        role: Роль пользователя
        is_active: Активен ли пользователь
        phone_verified: Подтвержден ли телефон
        email_verified: Подтвержден ли email
        is_verified: Общая верификация
        last_login_at: Время последнего входа
        created_at: Дата создания
    """

    id: str
    phone: Optional[str]
    email: Optional[str]
    full_name: str
    role: str
    is_active: bool
    phone_verified: bool
    email_verified: bool
    is_verified: bool
    last_login_at: Optional[datetime]
    created_at: datetime

    @classmethod
    def from_entity(cls, user) -> "UserDTO":
        """
        Создать DTO из доменной сущности.

        Args:
            user: User entity

        Returns:
            UserDTO
        """
        return cls(
            id=user.id,
            phone=user.phone.value if user.phone else None,
            email=user.email.value if user.email else None,
            full_name=user.full_name,
            role=user.role.value,
            is_active=user.is_active,
            phone_verified=user.phone_verified,
            email_verified=user.email_verified,
            is_verified=user.is_verified,
            last_login_at=user.last_login_at,
            created_at=user.created_at,
        )
