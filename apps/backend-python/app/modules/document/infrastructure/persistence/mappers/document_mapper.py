"""
Document Mapper

Mapper для конвертации между Domain Entity и ORM Model.
"""
from uuid import UUID
from typing import Optional

from app.modules.document.domain.entities.document import Document
from app.modules.document.domain.value_objects.document_type import DocumentType
from app.modules.document.domain.value_objects.document_status import DocumentStatus
from app.modules.document.domain.value_objects.file_metadata import FileMetadata
from app.modules.document.domain.value_objects.document_category import DocumentCategory
from app.modules.document.infrastructure.persistence.models.document_model import (
    DocumentModel,
)


class DocumentMapper:
    """
    Mapper для конвертации Document Entity <-> DocumentModel ORM.

    Handles:
    - Конвертация Value Objects в примитивные типы
    - Конвертация примитивных типов в Value Objects
    - Маппинг полей между Domain и Infrastructure слоями
    """

    @staticmethod
    def to_domain(model: DocumentModel) -> Document:
        """
        Конвертирует ORM модель в доменную сущность.

        Args:
            model: ORM модель DocumentModel

        Returns:
            Document entity
        """
        # Создаем Value Objects
        document_type_result = DocumentType.create(model.document_type)
        if not document_type_result.is_success:
            raise ValueError(f"Invalid document type in DB: {model.document_type}")
        document_type = document_type_result.value

        category_result = DocumentCategory.create(model.category)
        if not category_result.is_success:
            raise ValueError(f"Invalid category in DB: {model.category}")
        category = category_result.value

        status_result = DocumentStatus.create(model.status)
        if not status_result.is_success:
            raise ValueError(f"Invalid status in DB: {model.status}")
        status = status_result.value

        file_metadata_result = FileMetadata.create(
            file_size=model.file_size,
            mime_type=model.mime_type,
            original_filename=model.original_filename,
            file_extension=model.file_extension,
        )
        if not file_metadata_result.is_success:
            raise ValueError(f"Invalid file metadata in DB: {file_metadata_result.error}")
        file_metadata = file_metadata_result.value

        # Создаем доменную сущность
        document = Document(
            id=UUID(model.id),
            owner_id=UUID(model.owner_id),
            document_type=document_type,
            category=category,
            file_metadata=file_metadata,
            storage_path=model.storage_path,
            title=model.title,
            status=status,
            description=model.description,
            consultation_id=UUID(model.consultation_id) if model.consultation_id else None,
            extracted_text=model.extracted_text,
            tags=model.tags if model.tags else [],
            processing_error=model.processing_error,
            uploaded_at=model.uploaded_at,
            processed_at=model.processed_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

        # Очищаем domain events (они уже обработаны при сохранении)
        document.clear_domain_events()

        return document

    @staticmethod
    def to_model(document: Document) -> DocumentModel:
        """
        Конвертирует доменную сущность в ORM модель.

        Args:
            document: Document entity

        Returns:
            DocumentModel ORM
        """
        return DocumentModel(
            id=str(document.id),
            owner_id=str(document.owner_id),
            document_type=document.document_type.value.value,
            category=document.category.value.value,
            title=document.title,
            description=document.description,
            file_size=document.file_metadata.file_size,
            mime_type=document.file_metadata.mime_type,
            original_filename=document.file_metadata.original_filename,
            file_extension=document.file_metadata.file_extension,
            storage_path=document.storage_path,
            status=document.status.value.value,
            consultation_id=str(document.consultation_id) if document.consultation_id else None,
            extracted_text=document.extracted_text,
            processing_error=document.processing_error,
            tags=document.tags if document.tags else [],
            uploaded_at=document.uploaded_at,
            processed_at=document.processed_at,
            created_at=document.created_at,
            updated_at=document.updated_at,
        )

    @staticmethod
    def update_model(model: DocumentModel, document: Document) -> DocumentModel:
        """
        Обновляет существующую ORM модель данными из доменной сущности.

        Args:
            model: Существующая ORM модель
            document: Document entity с новыми данными

        Returns:
            Обновленная DocumentModel
        """
        # Обновляем только изменяемые поля
        model.title = document.title
        model.description = document.description
        model.status = document.status.value.value
        model.consultation_id = str(document.consultation_id) if document.consultation_id else None
        model.extracted_text = document.extracted_text
        model.processing_error = document.processing_error
        model.tags = document.tags if document.tags else []
        model.processed_at = document.processed_at
        model.updated_at = document.updated_at

        return model
