"""
Update Document Metadata Command

Команда для обновления метаданных документа.
"""
from dataclasses import dataclass
from typing import Optional, List


@dataclass
class UpdateDocumentMetadataCommand:
    """
    Команда обновления метаданных документа.

    Args:
        document_id: ID документа
        owner_id: ID владельца (для проверки прав)
        title: Новое название (опционально)
        description: Новое описание (опционально)
        tags: Новые теги (опционально)
    """

    document_id: str
    owner_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
