"""
Document Uploaded Event

Событие загрузки нового документа.
"""
from dataclasses import dataclass
from typing import Optional

from app.shared.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class DocumentUploadedEvent(DomainEvent):
    """
    Событие: Документ загружен в систему.

    Публикуется когда новый документ успешно загружен и сохранен.

    Use cases:
    - Отправка уведомления владельцу
    - Запуск автоматической обработки (OCR)
    - Обновление статистики
    - Индексация для поиска
    """

    document_id: str
    owner_id: str
    document_type: str
    category: str
    file_size: int
    mime_type: str
    consultation_id: Optional[str] = None

    @property
    def event_name(self) -> str:
        """Имя события"""
        return "document.uploaded"
