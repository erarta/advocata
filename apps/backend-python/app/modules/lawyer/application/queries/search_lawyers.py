"""
SearchLawyersQuery

Запрос для поиска юристов с фильтрами.
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class SearchLawyersQuery:
    """
    Запрос: Поиск юристов с фильтрами.

    Поддерживает множественные фильтры для точного поиска.
    Возвращает пагинированный результат.

    Attributes:
        specializations: Фильтр по специализациям (русские названия или enum names)
        min_rating: Минимальный рейтинг (1.0-5.0)
        max_price: Максимальная цена (рубли)
        location: Город/регион (частичное совпадение)
        is_available: Только доступные юристы
        min_experience: Минимальный опыт (годы)
        query: Текстовый поиск (по имени, описанию, образованию)
        limit: Максимальное количество результатов (по умолчанию 20)
        offset: Смещение для пагинации (по умолчанию 0)
    """

    specializations: Optional[List[str]] = None
    min_rating: Optional[float] = None
    max_price: Optional[float] = None
    location: Optional[str] = None
    is_available: Optional[bool] = None
    min_experience: Optional[int] = None
    query: Optional[str] = None
    limit: int = 20
    offset: int = 0
