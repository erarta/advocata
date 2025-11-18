"""
Get Document By ID Query

Запрос для получения документа по ID.
"""
from dataclasses import dataclass


@dataclass
class GetDocumentByIdQuery:
    """
    Запрос для получения документа по ID.

    Args:
        document_id: ID документа
        owner_id: ID пользователя (для проверки прав доступа)
    """

    document_id: str
    owner_id: str
