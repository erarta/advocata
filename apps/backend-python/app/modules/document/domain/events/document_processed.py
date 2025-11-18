"""
Document Processed Event

Событие успешной обработки документа.
"""
from dataclasses import dataclass

from app.shared.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class DocumentProcessedEvent(DomainEvent):
    """
    Событие: Документ успешно обработан.

    Публикуется после завершения OCR и извлечения текста.

    Use cases:
    - Отправка уведомления владельцу
    - Индексация извлеченного текста для RAG
    - Обновление статистики обработки
    - Триггер для рекомендаций юристов
    """

    document_id: str
    owner_id: str
    has_extracted_text: bool
    text_length: int

    @property
    def event_name(self) -> str:
        """Имя события"""
        return "document.processed"
