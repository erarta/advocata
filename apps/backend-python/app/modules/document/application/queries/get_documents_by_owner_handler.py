"""
Get Documents By Owner Handler

Обработчик запроса получения всех документов владельца.
"""
from uuid import UUID

from app.shared.domain.result import Result
from app.modules.document.application.queries.get_documents_by_owner_query import (
    GetDocumentsByOwnerQuery,
)
from app.modules.document.application.dtos.document_dto import (
    DocumentSearchResultDTO,
    DocumentListItemDTO,
)
from app.modules.document.domain.repositories.document_repository import (
    IDocumentRepository,
)


class GetDocumentsByOwnerHandler:
    """
    Handler для запроса получения документов владельца.

    Возвращает все документы пользователя с пагинацией.
    """

    def __init__(self, document_repository: IDocumentRepository):
        """
        Инициализирует handler.

        Args:
            document_repository: Репозиторий документов
        """
        self.document_repository = document_repository

    async def handle(
        self, query: GetDocumentsByOwnerQuery
    ) -> Result[DocumentSearchResultDTO]:
        """
        Обрабатывает запрос получения документов владельца.

        Args:
            query: Запрос с ID владельца

        Returns:
            Result с DocumentSearchResultDTO или ошибкой
        """
        # 1. Валидация параметров пагинации
        if query.limit < 1 or query.limit > 100:
            return Result.fail("Limit must be between 1 and 100")

        if query.offset < 0:
            return Result.fail("Offset must be non-negative")

        # 2. Получаем документы владельца
        owner_id = UUID(query.owner_id)

        documents, total = await self.document_repository.find_by_owner(
            owner_id=owner_id,
            limit=query.limit,
            offset=query.offset,
        )

        # 3. Конвертируем в DTOs
        items = [DocumentListItemDTO.from_entity(doc) for doc in documents]

        # 4. Формируем результат с пагинацией
        result = DocumentSearchResultDTO(
            items=items,
            total=total,
            limit=query.limit,
            offset=query.offset,
        )

        return Result.ok(result)
