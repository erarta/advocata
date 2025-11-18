"""
Get Documents By Owner Query

Запрос для получения всех документов владельца.
"""
from dataclasses import dataclass


@dataclass
class GetDocumentsByOwnerQuery:
    """
    Запрос для получения всех документов владельца с пагинацией.

    Args:
        owner_id: ID владельца документов
        limit: Количество результатов (по умолчанию 50)
        offset: Смещение для пагинации (по умолчанию 0)
    """

    owner_id: str
    limit: int = 50
    offset: int = 0
