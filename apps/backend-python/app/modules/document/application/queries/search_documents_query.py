"""
Search Documents Query

Запрос для поиска документов с фильтрами.
"""
from dataclasses import dataclass
from typing import Optional, List


@dataclass
class SearchDocumentsQuery:
    """
    Запрос для поиска документов владельца с фильтрами.

    Args:
        owner_id: ID владельца документов
        document_types: Фильтр по типам документов (опционально)
        categories: Фильтр по категориям (опционально)
        statuses: Фильтр по статусам (опционально)
        query: Текстовый поиск по названию/описанию (опционально)
        tags: Фильтр по тегам (опционально)
        consultation_id: Фильтр по консультации (опционально)
        limit: Количество результатов (по умолчанию 50)
        offset: Смещение для пагинации (по умолчанию 0)
    """

    owner_id: str
    document_types: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    statuses: Optional[List[str]] = None
    query: Optional[str] = None
    tags: Optional[List[str]] = None
    consultation_id: Optional[str] = None
    limit: int = 50
    offset: int = 0
