"""
Get Document By ID Handler

Обработчик запроса получения документа по ID.
"""
from uuid import UUID

from app.shared.domain.result import Result
from app.modules.document.application.queries.get_document_by_id_query import (
    GetDocumentByIdQuery,
)
from app.modules.document.application.dtos.document_dto import DocumentDTO
from app.modules.document.domain.repositories.document_repository import (
    IDocumentRepository,
)


class GetDocumentByIdHandler:
    """
    Handler для запроса получения документа по ID.

    Возвращает полную информацию о документе, если пользователь
    является владельцем.
    """

    def __init__(self, document_repository: IDocumentRepository):
        """
        Инициализирует handler.

        Args:
            document_repository: Репозиторий документов
        """
        self.document_repository = document_repository

    async def handle(self, query: GetDocumentByIdQuery) -> Result[DocumentDTO]:
        """
        Обрабатывает запрос получения документа.

        Args:
            query: Запрос с ID документа

        Returns:
            Result с DocumentDTO или ошибкой
        """
        # 1. Находим документ
        document_id = UUID(query.document_id)
        document = await self.document_repository.find_by_id(document_id)

        if document is None:
            return Result.fail(f"Document not found: {query.document_id}")

        # 2. Проверяем права доступа
        if str(document.owner_id) != query.owner_id:
            return Result.fail(
                "Access denied. You can only view your own documents."
            )

        # 3. Возвращаем DTO
        return Result.ok(DocumentDTO.from_entity(document))
