"""
Get Conversations By User Query

Запрос для получения всех бесед пользователя.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class GetConversationsByUserQuery:
    """
    Запрос для получения всех бесед пользователя с пагинацией.

    Args:
        user_id: ID пользователя
        status: Фильтр по статусу (опционально)
        limit: Количество результатов (по умолчанию 50)
        offset: Смещение для пагинации (по умолчанию 0)
    """

    user_id: str
    status: Optional[str] = None
    limit: int = 50
    offset: int = 0
