"""
User Registered Event

Событие регистрации нового пользователя.
"""

from typing import Any, Dict, Optional

from app.core.domain.domain_event import DomainEvent


class UserRegisteredEvent(DomainEvent):
    """
    Событие: пользователь зарегистрирован.

    Генерируется когда новый пользователь создан в системе.
    Может использоваться для:
    - Отправки приветственного email/SMS
    - Логирования
    - Аналитики
    - Интеграции с внешними системами

    Attributes:
        user_id: ID пользователя
        phone: Номер телефона (если указан)
        email: Email (если указан)
        role: Роль пользователя
    """

    def __init__(
        self,
        user_id: str,
        phone: Optional[str],
        email: Optional[str],
        role: str,
    ) -> None:
        """
        Инициализация события.

        Args:
            user_id: ID пользователя
            phone: Номер телефона
            email: Email адрес
            role: Роль пользователя
        """
        super().__init__(aggregate_id=user_id)
        self.user_id = user_id
        self.phone = phone
        self.email = email
        self.role = role

    def to_dict(self) -> Dict[str, Any]:
        """Преобразовать событие в словарь."""
        base_dict = super().to_dict()
        base_dict.update({
            "user_id": self.user_id,
            "phone": self.phone,
            "email": self.email,
            "role": self.role,
        })
        return base_dict
