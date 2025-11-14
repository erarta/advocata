"""
GetLawyerQuery

Запрос для получения юриста по ID.
"""

from dataclasses import dataclass


@dataclass
class GetLawyerQuery:
    """
    Запрос: Получить юриста по ID.

    Возвращает полную информацию о юристе.

    Attributes:
        lawyer_id: ID юриста
    """

    lawyer_id: str
