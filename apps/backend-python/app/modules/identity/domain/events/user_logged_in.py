"""
User Logged In Event

Событие входа пользователя в систему.
"""

from typing import Any, Dict

from app.core.domain.domain_event import DomainEvent


class UserLoggedInEvent(DomainEvent):
    """
    Событие: пользователь вошел в систему.

    Генерируется при успешной аутентификации пользователя.
    Может использоваться для:
    - Логирования активности
    - Безопасности (обнаружение подозрительной активности)
    - Аналитики использования
    - Обновления last_login_at

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
