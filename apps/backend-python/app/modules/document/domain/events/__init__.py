"""Domain Events exports"""
from app.modules.document.domain.events.document_uploaded import DocumentUploadedEvent
from app.modules.document.domain.events.document_processed import DocumentProcessedEvent
from app.modules.document.domain.events.document_deleted import DocumentDeletedEvent

__all__ = [
    "DocumentUploadedEvent",
    "DocumentProcessedEvent",
    "DocumentDeletedEvent",
]
