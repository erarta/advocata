"""
Queries для Lawyer Module

Запросы для чтения данных юристов.
"""

from .search_lawyers import SearchLawyersQuery
from .search_lawyers_handler import SearchLawyersHandler
from .get_lawyer import GetLawyerQuery
from .get_lawyer_handler import GetLawyerHandler
from .get_top_rated import GetTopRatedQuery
from .get_top_rated_handler import GetTopRatedHandler

__all__ = [
    "SearchLawyersQuery",
    "SearchLawyersHandler",
    "GetLawyerQuery",
    "GetLawyerHandler",
    "GetTopRatedQuery",
    "GetTopRatedHandler",
]
