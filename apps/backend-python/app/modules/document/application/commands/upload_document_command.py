"""
Upload Document Command

Команда для загрузки нового документа.
"""
from dataclasses import dataclass
from typing import Optional, List


@dataclass
class UploadDocumentCommand:
    """
    Команда загрузки документа.

    Args:
        owner_id: ID владельца документа
        document_type: Тип документа (enum value)
        category: Категория документа (enum value)
        file_content: Содержимое файла (bytes)
        file_size: Размер файла в байтах
        mime_type: MIME-тип файла
        original_filename: Оригинальное имя файла
        title: Название документа
        description: Описание документа (опционально)
        consultation_id: ID консультации (опционально)
        tags: Теги документа (опционально)
    """

    owner_id: str
    document_type: str
    category: str
    file_content: bytes
    file_size: int
    mime_type: str
    original_filename: str
    title: str
    description: Optional[str] = None
    consultation_id: Optional[str] = None
    tags: Optional[List[str]] = None
