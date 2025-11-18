"""
Update Document Metadata Handler

Обработчик команды обновления метаданных документа.
"""
from uuid import UUID

from app.shared.domain.result import Result
from app.modules.document.application.commands.update_document_metadata_command import (
    UpdateDocumentMetadataCommand,
)
from app.modules.document.application.dtos.document_dto import DocumentDTO
from app.modules.document.domain.repositories.document_repository import (
    IDocumentRepository,
)
from app.modules.document.domain.services.document_validation_service import (
    DocumentValidationService,
)


class UpdateDocumentMetadataHandler:
    """
    Handler для команды обновления метаданных документа.

    Orchestrates:
    1. Поиск документа
    2. Проверка владельца
    3. Валидация новых данных
    4. Обновление метаданных
    5. Сохранение изменений
    """

    def __init__(self, document_repository: IDocumentRepository):
        """
        Инициализирует handler.

        Args:
            document_repository: Репозиторий документов
        """
        self.document_repository = document_repository

    async def handle(
        self, command: UpdateDocumentMetadataCommand
    ) -> Result[DocumentDTO]:
        """
        Обрабатывает команду обновления метаданных.

        Args:
            command: Команда обновления

        Returns:
            Result с обновленным DocumentDTO или ошибкой
        """
        # 1. Находим документ
        document_id = UUID(command.document_id)
        document = await self.document_repository.find_by_id(document_id)

        if document is None:
            return Result.fail(f"Document not found: {command.document_id}")

        # 2. Проверяем владельца
        if str(document.owner_id) != command.owner_id:
            return Result.fail(
                "Access denied. You can only update your own documents."
            )

        # 3. Валидируем теги (если переданы)
        if command.tags is not None:
            tags_validation = DocumentValidationService.validate_tags(command.tags)
            if not tags_validation.is_success:
                return Result.fail(tags_validation.error)

        # 4. Обновляем метаданные через доменный метод
        update_result = document.update_metadata(
            title=command.title,
            description=command.description,
            tags=command.tags,
        )

        if not update_result.is_success:
            return Result.fail(update_result.error)

        # 5. Сохраняем изменения
        updated_document = await self.document_repository.save(document)

        # 6. Возвращаем DTO
        return Result.ok(DocumentDTO.from_entity(updated_document))
