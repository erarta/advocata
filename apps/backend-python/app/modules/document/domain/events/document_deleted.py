"""
Document Deleted Event

Событие удаления документа.
"""
from dataclasses import dataclass

from app.shared.domain.domain_event import DomainEvent


@dataclass(frozen=True)
class DocumentDeletedEvent(DomainEvent):
    """
    Событие: Документ помечен на удаление.

    Публикуется когда документ удаляется пользователем.

    Use cases:
    - Планирование физического удаления файла
    - Очистка индексов поиска
    - Удаление из векторной БД (RAG)
    - Обновление статистики
    - Отвязка от консультаций
    """

    document_id: str
    owner_id: str

    @property
    def event_name(self) -> str:
        """Имя события"""
        return "document.deleted"
