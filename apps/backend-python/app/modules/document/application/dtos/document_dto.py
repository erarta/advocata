"""
Document DTO

Data Transfer Object для передачи данных документа между слоями.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List

from app.modules.document.domain.entities.document import Document


@dataclass
class DocumentDTO:
    """
    DTO для документа.

    Используется для передачи полных данных документа между слоями.
    """

    id: str
    owner_id: str
    document_type: str
    document_type_display: str
    category: str
    category_display: str
    title: str
    description: Optional[str]
    file_size: int
    file_size_human: str
    mime_type: str
    original_filename: str
    file_extension: str
    storage_path: str
    status: str
    status_display: str
    consultation_id: Optional[str]
    extracted_text: Optional[str]
    tags: List[str]
    processing_error: Optional[str]
    uploaded_at: datetime
    processed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    # Computed fields
    needs_ocr: bool
    can_be_processed: bool
    can_be_deleted: bool
    is_processed: bool

    @classmethod
    def from_entity(cls, document: Document) -> "DocumentDTO":
        """
        Создает DTO из доменной сущности.

        Args:
            document: Доменная сущность Document

        Returns:
            DocumentDTO с данными из сущности
        """
        return cls(
            id=str(document.id),
            owner_id=str(document.owner_id),
            document_type=document.document_type.value.value,
            document_type_display=document.document_type.display_name,
            category=document.category.value.value,
            category_display=document.category.display_name,
            title=document.title,
            description=document.description,
            file_size=document.file_metadata.file_size,
            file_size_human=document.file_metadata.file_size_human,
            mime_type=document.file_metadata.mime_type,
            original_filename=document.file_metadata.original_filename,
            file_extension=document.file_metadata.file_extension,
            storage_path=document.storage_path,
            status=document.status.value.value,
            status_display=document.status.display_name,
            consultation_id=str(document.consultation_id) if document.consultation_id else None,
            extracted_text=document.extracted_text,
            tags=document.tags,
            processing_error=document.processing_error,
            uploaded_at=document.uploaded_at,
            processed_at=document.processed_at,
            created_at=document.created_at,
            updated_at=document.updated_at,
            # Computed fields
            needs_ocr=document.file_metadata.needs_ocr,
            can_be_processed=document.status.can_be_processed,
            can_be_deleted=document.status.can_be_deleted,
            is_processed=document.status.is_processed,
        )


@dataclass
class DocumentListItemDTO:
    """
    DTO для краткой информации о документе (для списков).

    Используется для отображения списка документов без полных данных.
    """

    id: str
    owner_id: str
    title: str
    document_type: str
    document_type_display: str
    category: str
    category_display: str
    file_size_human: str
    original_filename: str
    status: str
    status_display: str
    tags: List[str]
    uploaded_at: datetime
    is_processed: bool

    @classmethod
    def from_entity(cls, document: Document) -> "DocumentListItemDTO":
        """
        Создает краткий DTO из доменной сущности.

        Args:
            document: Доменная сущность Document

        Returns:
            DocumentListItemDTO с краткими данными
        """
        return cls(
            id=str(document.id),
            owner_id=str(document.owner_id),
            title=document.title,
            document_type=document.document_type.value.value,
            document_type_display=document.document_type.display_name,
            category=document.category.value.value,
            category_display=document.category.display_name,
            file_size_human=document.file_metadata.file_size_human,
            original_filename=document.file_metadata.original_filename,
            status=document.status.value.value,
            status_display=document.status.display_name,
            tags=document.tags,
            uploaded_at=document.uploaded_at,
            is_processed=document.status.is_processed,
        )


@dataclass
class DocumentSearchResultDTO:
    """
    DTO для результатов поиска документов с пагинацией.
    """

    items: List[DocumentListItemDTO]
    total: int
    limit: int
    offset: int

    @property
    def has_more(self) -> bool:
        """Проверяет, есть ли еще результаты"""
        return self.offset + self.limit < self.total

    @property
    def page(self) -> int:
        """Возвращает номер текущей страницы (начиная с 1)"""
        return (self.offset // self.limit) + 1 if self.limit > 0 else 1

    @property
    def total_pages(self) -> int:
        """Возвращает общее количество страниц"""
        return (self.total + self.limit - 1) // self.limit if self.limit > 0 else 1
