"""
GetTopRatedQuery

Запрос для получения топ юристов по рейтингу.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class GetTopRatedQuery:
    """
    Запрос: Получить топ юристов по рейтингу.

    Возвращает юристов с лучшими рейтингами.
    Можно фильтровать по специализации и локации.

    Attributes:
        specialization: Фильтр по специализации (опционально)
        location: Фильтр по локации (опционально)
        limit: Максимальное количество результатов (по умолчанию 10)
    """

    specialization: Optional[str] = None
    location: Optional[str] = None
    limit: int = 10
