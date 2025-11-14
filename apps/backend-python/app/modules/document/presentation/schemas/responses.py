"""
Response Schemas

Pydantic схемы для форматирования ответов API.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.modules.document.application.dtos.document_dto import (
    DocumentDTO,
    DocumentListItemDTO,
    DocumentSearchResultDTO,
)


class DocumentResponse(BaseModel):
    """
    Полная информация о документе.
    """

    id: str = Field(..., description="ID документа")
    owner_id: str = Field(..., description="ID владельца")
    document_type: str = Field(..., description="Тип документа")
    document_type_display: str = Field(..., description="Отображаемый тип документа")
    category: str = Field(..., description="Категория документа")
    category_display: str = Field(..., description="Отображаемая категория")
    title: str = Field(..., description="Название документа")
    description: Optional[str] = Field(None, description="Описание документа")
    file_size: int = Field(..., description="Размер файла в байтах")
    file_size_human: str = Field(..., description="Размер файла (человекочитаемый)")
    mime_type: str = Field(..., description="MIME-тип файла")
    original_filename: str = Field(..., description="Оригинальное имя файла")
    file_extension: str = Field(..., description="Расширение файла")
    storage_path: str = Field(..., description="Путь в хранилище")
    status: str = Field(..., description="Статус обработки")
    status_display: str = Field(..., description="Отображаемый статус")
    consultation_id: Optional[str] = Field(None, description="ID консультации")
    extracted_text: Optional[str] = Field(None, description="Извлеченный текст")
    tags: List[str] = Field(default_factory=list, description="Теги документа")
    processing_error: Optional[str] = Field(None, description="Ошибка обработки")
    uploaded_at: datetime = Field(..., description="Дата загрузки")
    processed_at: Optional[datetime] = Field(None, description="Дата обработки")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")
    needs_ocr: bool = Field(..., description="Требуется ли OCR")
    can_be_processed: bool = Field(..., description="Можно ли обработать")
    can_be_deleted: bool = Field(..., description="Можно ли удалить")
    is_processed: bool = Field(..., description="Обработан ли документ")

    @classmethod
    def from_dto(cls, dto: DocumentDTO) -> "DocumentResponse":
        """Создает response из DTO"""
        return cls(
            id=dto.id,
            owner_id=dto.owner_id,
            document_type=dto.document_type,
            document_type_display=dto.document_type_display,
            category=dto.category,
            category_display=dto.category_display,
            title=dto.title,
            description=dto.description,
            file_size=dto.file_size,
            file_size_human=dto.file_size_human,
            mime_type=dto.mime_type,
            original_filename=dto.original_filename,
            file_extension=dto.file_extension,
            storage_path=dto.storage_path,
            status=dto.status,
            status_display=dto.status_display,
            consultation_id=dto.consultation_id,
            extracted_text=dto.extracted_text,
            tags=dto.tags,
            processing_error=dto.processing_error,
            uploaded_at=dto.uploaded_at,
            processed_at=dto.processed_at,
            created_at=dto.created_at,
            updated_at=dto.updated_at,
            needs_ocr=dto.needs_ocr,
            can_be_processed=dto.can_be_processed,
            can_be_deleted=dto.can_be_deleted,
            is_processed=dto.is_processed,
        )


class DocumentListItemResponse(BaseModel):
    """
    Краткая информация о документе для списков.
    """

    id: str = Field(..., description="ID документа")
    owner_id: str = Field(..., description="ID владельца")
    title: str = Field(..., description="Название документа")
    document_type: str = Field(..., description="Тип документа")
    document_type_display: str = Field(..., description="Отображаемый тип")
    category: str = Field(..., description="Категория документа")
    category_display: str = Field(..., description="Отображаемая категория")
    file_size_human: str = Field(..., description="Размер файла")
    original_filename: str = Field(..., description="Имя файла")
    status: str = Field(..., description="Статус")
    status_display: str = Field(..., description="Отображаемый статус")
    tags: List[str] = Field(default_factory=list, description="Теги")
    uploaded_at: datetime = Field(..., description="Дата загрузки")
    is_processed: bool = Field(..., description="Обработан ли")

    @classmethod
    def from_dto(cls, dto: DocumentListItemDTO) -> "DocumentListItemResponse":
        """Создает response из DTO"""
        return cls(
            id=dto.id,
            owner_id=dto.owner_id,
            title=dto.title,
            document_type=dto.document_type,
            document_type_display=dto.document_type_display,
            category=dto.category,
            category_display=dto.category_display,
            file_size_human=dto.file_size_human,
            original_filename=dto.original_filename,
            status=dto.status,
            status_display=dto.status_display,
            tags=dto.tags,
            uploaded_at=dto.uploaded_at,
            is_processed=dto.is_processed,
        )


class DocumentSearchResponse(BaseModel):
    """
    Результаты поиска документов с пагинацией.
    """

    items: List[DocumentListItemResponse] = Field(
        default_factory=list, description="Список документов"
    )
    total: int = Field(..., description="Общее количество результатов")
    limit: int = Field(..., description="Лимит результатов на странице")
    offset: int = Field(..., description="Смещение")
    has_more: bool = Field(..., description="Есть ли еще результаты")
    page: int = Field(..., description="Номер текущей страницы")
    total_pages: int = Field(..., description="Общее количество страниц")

    @classmethod
    def from_dto(cls, dto: DocumentSearchResultDTO) -> "DocumentSearchResponse":
        """Создает response из DTO"""
        return cls(
            items=[DocumentListItemResponse.from_dto(item) for item in dto.items],
            total=dto.total,
            limit=dto.limit,
            offset=dto.offset,
            has_more=dto.has_more,
            page=dto.page,
            total_pages=dto.total_pages,
        )
