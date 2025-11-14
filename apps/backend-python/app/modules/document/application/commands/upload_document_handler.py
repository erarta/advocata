"""
Upload Document Handler

Обработчик команды загрузки документа.
"""
from uuid import UUID

from app.shared.domain.result import Result
from app.modules.document.application.commands.upload_document_command import (
    UploadDocumentCommand,
)
from app.modules.document.application.dtos.document_dto import DocumentDTO
from app.modules.document.domain.entities.document import Document
from app.modules.document.domain.value_objects.document_type import DocumentType
from app.modules.document.domain.value_objects.document_category import DocumentCategory
from app.modules.document.domain.value_objects.file_metadata import FileMetadata
from app.modules.document.domain.repositories.document_repository import (
    IDocumentRepository,
)
from app.modules.document.domain.services.document_validation_service import (
    DocumentValidationService,
)


class UploadDocumentHandler:
    """
    Handler для команды загрузки документа.

    Orchestrates:
    1. Валидация метаданных файла
    2. Загрузка файла в S3 хранилище
    3. Создание Document aggregate
    4. Сохранение в репозиторий
    """

    def __init__(
        self,
        document_repository: IDocumentRepository,
        storage_service,  # IStorageService из Infrastructure
    ):
        """
        Инициализирует handler.

        Args:
            document_repository: Репозиторий документов
            storage_service: Сервис для работы с S3
        """
        self.document_repository = document_repository
        self.storage_service = storage_service

    async def handle(self, command: UploadDocumentCommand) -> Result[DocumentDTO]:
        """
        Обрабатывает команду загрузки документа.

        Args:
            command: Команда загрузки документа

        Returns:
            Result с DocumentDTO или ошибкой
        """
        # 1. Создаем FileMetadata Value Object
        file_metadata_result = FileMetadata.create(
            file_size=command.file_size,
            mime_type=command.mime_type,
            original_filename=command.original_filename,
        )

        if not file_metadata_result.is_success:
            return Result.fail(file_metadata_result.error)

        file_metadata = file_metadata_result.value

        # 2. Валидируем метаданные файла через Domain Service
        validation_result = DocumentValidationService.validate_file_metadata(
            file_metadata
        )

        if not validation_result.is_success:
            return Result.fail(validation_result.error)

        # 3. Проверяем на потенциально опасные файлы
        if DocumentValidationService.is_potentially_dangerous(file_metadata):
            return Result.fail(
                f"File type '{file_metadata.mime_type}' is not allowed for security reasons"
            )

        # 4. Создаем DocumentType Value Object
        document_type_result = DocumentType.create(command.document_type)

        if not document_type_result.is_success:
            return Result.fail(document_type_result.error)

        document_type = document_type_result.value

        # 5. Создаем DocumentCategory Value Object
        category_result = DocumentCategory.create(command.category)

        if not category_result.is_success:
            return Result.fail(category_result.error)

        category = category_result.value

        # 6. Валидируем теги (если есть)
        if command.tags:
            tags_validation = DocumentValidationService.validate_tags(command.tags)
            if not tags_validation.is_success:
                return Result.fail(tags_validation.error)

        # 7. Создаем временный Document для получения ID
        owner_id = UUID(command.owner_id)
        consultation_id = UUID(command.consultation_id) if command.consultation_id else None

        # Вычисляем storage path
        temp_document_id = Document.create(
            owner_id=owner_id,
            document_type=document_type,
            category=category,
            file_metadata=file_metadata,
            storage_path="temp",  # Временный путь
            title=command.title,
            description=command.description,
            consultation_id=consultation_id,
            tags=command.tags,
        )

        if not temp_document_id.is_success:
            return Result.fail(temp_document_id.error)

        document = temp_document_id.value

        # Вычисляем реальный storage path
        storage_path = DocumentValidationService.calculate_storage_path(
            owner_id=str(owner_id),
            document_id=str(document.id),
            original_filename=command.original_filename,
        )

        # 8. Загружаем файл в S3
        upload_result = await self.storage_service.upload_file(
            file_content=command.file_content,
            storage_path=storage_path,
            mime_type=command.mime_type,
        )

        if not upload_result.is_success:
            return Result.fail(f"Failed to upload file: {upload_result.error}")

        # 9. Пересоздаем Document с правильным storage_path
        document_result = Document.create(
            owner_id=owner_id,
            document_type=document_type,
            category=category,
            file_metadata=file_metadata,
            storage_path=storage_path,
            title=command.title,
            description=command.description,
            consultation_id=consultation_id,
            tags=command.tags,
        )

        if not document_result.is_success:
            # Откатываем загрузку файла
            await self.storage_service.delete_file(storage_path)
            return Result.fail(document_result.error)

        document = document_result.value

        # 10. Сохраняем в репозиторий
        saved_document = await self.document_repository.save(document)

        # 11. Возвращаем DTO
        return Result.ok(DocumentDTO.from_entity(saved_document))
