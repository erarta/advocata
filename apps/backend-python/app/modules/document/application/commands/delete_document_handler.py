"""
Delete Document Handler

Обработчик команды удаления документа.
"""
from uuid import UUID

from app.shared.domain.result import Result
from app.modules.document.application.commands.delete_document_command import (
    DeleteDocumentCommand,
)
from app.modules.document.domain.repositories.document_repository import (
    IDocumentRepository,
)


class DeleteDocumentHandler:
    """
    Handler для команды удаления документа.

    Orchestrates:
    1. Поиск документа
    2. Проверка владельца
    3. Пометка на удаление (soft delete)
    4. Сохранение изменений

    Note: Физическое удаление файла из S3 происходит асинхронно
    через обработчик события DocumentDeletedEvent.
    """

    def __init__(self, document_repository: IDocumentRepository):
        """
        Инициализирует handler.

        Args:
            document_repository: Репозиторий документов
        """
        self.document_repository = document_repository

    async def handle(self, command: DeleteDocumentCommand) -> Result[None]:
        """
        Обрабатывает команду удаления документа.

        Args:
            command: Команда удаления

        Returns:
            Result с успехом или ошибкой
        """
        # 1. Находим документ
        document_id = UUID(command.document_id)
        document = await self.document_repository.find_by_id(document_id)

        if document is None:
            return Result.fail(f"Document not found: {command.document_id}")

        # 2. Проверяем владельца
        if str(document.owner_id) != command.owner_id:
            return Result.fail(
                "Access denied. You can only delete your own documents."
            )

        # 3. Помечаем документ на удаление через доменный метод
        delete_result = document.delete()

        if not delete_result.is_success:
            return Result.fail(delete_result.error)

        # 4. Сохраняем изменения (soft delete)
        await self.document_repository.save(document)

        # 5. Domain event DocumentDeletedEvent будет обработан
        # асинхронно для физического удаления файла из S3

        return Result.ok()
