"""
Document Entity (Aggregate Root)

Доменная сущность документа с бизнес-логикой.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from app.shared.domain.aggregate_root import AggregateRoot
from app.shared.domain.result import Result
from app.modules.document.domain.value_objects.document_type import DocumentType
from app.modules.document.domain.value_objects.document_status import DocumentStatus
from app.modules.document.domain.value_objects.file_metadata import FileMetadata
from app.modules.document.domain.value_objects.document_category import DocumentCategory
from app.modules.document.domain.events.document_uploaded import DocumentUploadedEvent
from app.modules.document.domain.events.document_processed import DocumentProcessedEvent
from app.modules.document.domain.events.document_deleted import DocumentDeletedEvent


class Document(AggregateRoot):
    """
    Aggregate Root для документа.

    Представляет юридический документ в системе с полным жизненным циклом:
    загрузка → обработка → хранение → удаление.

    Business Rules:
    1. Документ всегда принадлежит пользователю (владелец)
    2. Документ может быть связан с консультацией
    3. Обработка документа включает OCR для изображений
    4. Удаленные документы физически не удаляются сразу
    5. Документы могут иметь теги для удобного поиска
    """

    def __init__(
        self,
        id: UUID,
        owner_id: UUID,
        document_type: DocumentType,
        category: DocumentCategory,
        file_metadata: FileMetadata,
        storage_path: str,
        title: str,
        status: DocumentStatus,
        description: Optional[str] = None,
        consultation_id: Optional[UUID] = None,
        extracted_text: Optional[str] = None,
        tags: Optional[List[str]] = None,
        processing_error: Optional[str] = None,
        uploaded_at: Optional[datetime] = None,
        processed_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        """
        Создает экземпляр документа.

        Args:
            id: Уникальный идентификатор
            owner_id: ID владельца документа
            document_type: Тип документа
            category: Категория документа
            file_metadata: Метаданные файла
            storage_path: Путь к файлу в хранилище
            title: Название документа
            status: Статус обработки
            description: Описание документа
            consultation_id: ID связанной консультации
            extracted_text: Извлеченный текст (после OCR)
            tags: Теги для поиска
            processing_error: Ошибка обработки
            uploaded_at: Дата загрузки
            processed_at: Дата обработки
            created_at: Дата создания
            updated_at: Дата обновления
        """
        super().__init__(id)
        self._owner_id = owner_id
        self._document_type = document_type
        self._category = category
        self._file_metadata = file_metadata
        self._storage_path = storage_path
        self._title = title
        self._status = status
        self._description = description
        self._consultation_id = consultation_id
        self._extracted_text = extracted_text
        self._tags = tags or []
        self._processing_error = processing_error
        self._uploaded_at = uploaded_at or datetime.utcnow()
        self._processed_at = processed_at
        self._created_at = created_at or datetime.utcnow()
        self._updated_at = updated_at or datetime.utcnow()

    @classmethod
    def create(
        cls,
        owner_id: UUID,
        document_type: DocumentType,
        category: DocumentCategory,
        file_metadata: FileMetadata,
        storage_path: str,
        title: str,
        description: Optional[str] = None,
        consultation_id: Optional[UUID] = None,
        tags: Optional[List[str]] = None,
    ) -> Result["Document"]:
        """
        Создает новый документ (фабричный метод).

        Args:
            owner_id: ID владельца документа
            document_type: Тип документа
            category: Категория документа
            file_metadata: Метаданные файла
            storage_path: Путь к файлу в хранилище
            title: Название документа
            description: Описание документа
            consultation_id: ID связанной консультации
            tags: Теги для поиска

        Returns:
            Result с новым Document или ошибкой
        """
        # Валидация названия
        if not title or len(title.strip()) == 0:
            return Result.fail("Document title cannot be empty")

        if len(title) > 200:
            return Result.fail(
                f"Document title too long: {len(title)} characters. "
                "Maximum: 200 characters"
            )

        # Валидация описания
        if description and len(description) > 2000:
            return Result.fail(
                f"Document description too long: {len(description)} characters. "
                "Maximum: 2000 characters"
            )

        # Валидация storage path
        if not storage_path or len(storage_path.strip()) == 0:
            return Result.fail("Storage path cannot be empty")

        # Валидация тегов
        if tags:
            if len(tags) > 20:
                return Result.fail(
                    f"Too many tags: {len(tags)}. Maximum: 20 tags"
                )

            for tag in tags:
                if len(tag) > 50:
                    return Result.fail(
                        f"Tag too long: '{tag}'. Maximum: 50 characters per tag"
                    )

        # Создаем документ с начальным статусом "Загружен"
        document = cls(
            id=uuid4(),
            owner_id=owner_id,
            document_type=document_type,
            category=category,
            file_metadata=file_metadata,
            storage_path=storage_path,
            title=title.strip(),
            status=DocumentStatus.uploaded(),
            description=description.strip() if description else None,
            consultation_id=consultation_id,
            tags=tags,
        )

        # Публикуем событие загрузки документа
        document.add_domain_event(
            DocumentUploadedEvent(
                document_id=str(document.id),
                owner_id=str(owner_id),
                document_type=document_type.value.value,
                category=category.value.value,
                file_size=file_metadata.file_size,
                mime_type=file_metadata.mime_type,
                consultation_id=str(consultation_id) if consultation_id else None,
            )
        )

        return Result.ok(document)

    def start_processing(self) -> Result[None]:
        """
        Начинает обработку документа (OCR, извлечение текста).

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.can_be_processed:
            return Result.fail(
                f"Cannot process document in status: {self._status.display_name}"
            )

        self._status = DocumentStatus.processing()
        self._processing_error = None
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def mark_as_processed(self, extracted_text: Optional[str] = None) -> Result[None]:
        """
        Помечает документ как успешно обработанный.

        Args:
            extracted_text: Извлеченный текст из документа

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.is_processing:
            return Result.fail(
                f"Cannot mark as processed. Current status: {self._status.display_name}"
            )

        self._status = DocumentStatus.processed()
        self._extracted_text = extracted_text
        self._processed_at = datetime.utcnow()
        self._processing_error = None
        self._updated_at = datetime.utcnow()

        # Публикуем событие обработки документа
        self.add_domain_event(
            DocumentProcessedEvent(
                document_id=str(self.id),
                owner_id=str(self._owner_id),
                has_extracted_text=extracted_text is not None,
                text_length=len(extracted_text) if extracted_text else 0,
            )
        )

        return Result.ok()

    def mark_as_failed(self, error_message: str) -> Result[None]:
        """
        Помечает документ как неуспешно обработанный.

        Args:
            error_message: Сообщение об ошибке

        Returns:
            Result с успехом или ошибкой
        """
        if not error_message or len(error_message.strip()) == 0:
            return Result.fail("Error message cannot be empty")

        self._status = DocumentStatus.failed()
        self._processing_error = error_message[:500]  # Ограничение на длину
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def update_metadata(
        self,
        title: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> Result[None]:
        """
        Обновляет метаданные документа.

        Args:
            title: Новое название
            description: Новое описание
            tags: Новые теги

        Returns:
            Result с успехом или ошибкой
        """
        # Обновляем название
        if title is not None:
            if len(title.strip()) == 0:
                return Result.fail("Document title cannot be empty")

            if len(title) > 200:
                return Result.fail(
                    f"Document title too long: {len(title)} characters. "
                    "Maximum: 200 characters"
                )

            self._title = title.strip()

        # Обновляем описание
        if description is not None:
            if len(description) > 2000:
                return Result.fail(
                    f"Document description too long: {len(description)} characters. "
                    "Maximum: 2000 characters"
                )

            self._description = description.strip() if description else None

        # Обновляем теги
        if tags is not None:
            if len(tags) > 20:
                return Result.fail(
                    f"Too many tags: {len(tags)}. Maximum: 20 tags"
                )

            for tag in tags:
                if len(tag) > 50:
                    return Result.fail(
                        f"Tag too long: '{tag}'. Maximum: 50 characters per tag"
                    )

            self._tags = tags

        self._updated_at = datetime.utcnow()
        return Result.ok()

    def link_to_consultation(self, consultation_id: UUID) -> Result[None]:
        """
        Связывает документ с консультацией.

        Args:
            consultation_id: ID консультации

        Returns:
            Result с успехом или ошибкой
        """
        if self._consultation_id is not None:
            return Result.fail(
                "Document is already linked to a consultation. "
                "Unlink first before linking to another consultation."
            )

        self._consultation_id = consultation_id
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def unlink_from_consultation(self) -> Result[None]:
        """
        Отвязывает документ от консультации.

        Returns:
            Result с успехом или ошибкой
        """
        if self._consultation_id is None:
            return Result.fail("Document is not linked to any consultation")

        self._consultation_id = None
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def archive(self) -> Result[None]:
        """
        Архивирует документ.

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.can_be_archived:
            return Result.fail(
                f"Cannot archive document in status: {self._status.display_name}"
            )

        self._status = DocumentStatus.archived()
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def delete(self) -> Result[None]:
        """
        Помечает документ на удаление.

        Returns:
            Result с успехом или ошибкой
        """
        if not self._status.can_be_deleted:
            return Result.fail(
                f"Cannot delete document in status: {self._status.display_name}"
            )

        self._status = DocumentStatus.deleted()
        self._updated_at = datetime.utcnow()

        # Публикуем событие удаления документа
        self.add_domain_event(
            DocumentDeletedEvent(
                document_id=str(self.id),
                owner_id=str(self._owner_id),
            )
        )

        return Result.ok()

    # Свойства (getters)

    @property
    def owner_id(self) -> UUID:
        """ID владельца документа"""
        return self._owner_id

    @property
    def document_type(self) -> DocumentType:
        """Тип документа"""
        return self._document_type

    @property
    def category(self) -> DocumentCategory:
        """Категория документа"""
        return self._category

    @property
    def file_metadata(self) -> FileMetadata:
        """Метаданные файла"""
        return self._file_metadata

    @property
    def storage_path(self) -> str:
        """Путь к файлу в хранилище"""
        return self._storage_path

    @property
    def title(self) -> str:
        """Название документа"""
        return self._title

    @property
    def status(self) -> DocumentStatus:
        """Статус обработки"""
        return self._status

    @property
    def description(self) -> Optional[str]:
        """Описание документа"""
        return self._description

    @property
    def consultation_id(self) -> Optional[UUID]:
        """ID связанной консультации"""
        return self._consultation_id

    @property
    def extracted_text(self) -> Optional[str]:
        """Извлеченный текст"""
        return self._extracted_text

    @property
    def tags(self) -> List[str]:
        """Теги документа"""
        return self._tags.copy()

    @property
    def processing_error(self) -> Optional[str]:
        """Ошибка обработки"""
        return self._processing_error

    @property
    def uploaded_at(self) -> datetime:
        """Дата загрузки"""
        return self._uploaded_at

    @property
    def processed_at(self) -> Optional[datetime]:
        """Дата обработки"""
        return self._processed_at

    @property
    def created_at(self) -> datetime:
        """Дата создания"""
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        """Дата обновления"""
        return self._updated_at

    def __repr__(self) -> str:
        """Представление для отладки"""
        return (
            f"Document(id={self.id}, title={self._title}, "
            f"type={self._document_type}, status={self._status})"
        )
