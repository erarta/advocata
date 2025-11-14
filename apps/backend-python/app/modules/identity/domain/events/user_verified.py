"""
User Verified Event

Событие верификации пользователя.
"""

from typing import Any, Dict

from app.core.domain.domain_event import DomainEvent


class UserVerifiedEvent(DomainEvent):
    """
    Событие: пользователь верифицирован.

    Генерируется когда пользователь успешно подтвердил свой телефон/email через OTP.
    Может использоваться для:
    - Активации полного функционала
    - Отправки уведомления о успешной верификации
    - Обновления статистики

    Attributes:
        user_id: ID пользователя
    """

    def __init__(self, user_id: str) -> None:
        """
        Инициализация события.

        Args:
            user_id: ID пользователя
        """
        super().__init__(aggregate_id=user_id)
        self.user_id = user_id

    def to_dict(self) -> Dict[str, Any]:
        """Преобразовать событие в словарь."""
        base_dict = super().to_dict()
        base_dict.update({"user_id": self.user_id})
        return base_dict
