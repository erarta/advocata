"""
Delete Document Command

Команда для удаления документа.
"""
from dataclasses import dataclass


@dataclass
class DeleteDocumentCommand:
    """
    Команда удаления документа.

    Args:
        document_id: ID документа для удаления
        owner_id: ID владельца (для проверки прав)
    """

    document_id: str
    owner_id: str
