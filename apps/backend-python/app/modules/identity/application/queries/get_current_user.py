"""
Get Current User Query

Запрос для получения текущего пользователя.
"""

from dataclasses import dataclass


@dataclass
class GetCurrentUserQuery:
    """
    Запрос: получить текущего пользователя.

    Attributes:
        user_id: ID пользователя из JWT токена
    """

    user_id: str
