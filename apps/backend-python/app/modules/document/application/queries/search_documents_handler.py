"""
Search Documents Handler

Обработчик запроса поиска документов.
"""
from uuid import UUID
from typing import List

from app.shared.domain.result import Result
from app.modules.document.application.queries.search_documents_query import (
    SearchDocumentsQuery,
)
from app.modules.document.application.dtos.document_dto import (
    DocumentSearchResultDTO,
    DocumentListItemDTO,
)
from app.modules.document.domain.repositories.document_repository import (
    IDocumentRepository,
)
from app.modules.document.domain.value_objects.document_type import DocumentTypeEnum
from app.modules.document.domain.value_objects.document_status import DocumentStatusEnum
from app.modules.document.domain.value_objects.document_category import DocumentCategoryEnum


class SearchDocumentsHandler:
    """
    Handler для запроса поиска документов.

    Поддерживает множественные фильтры и пагинацию.
    """

    def __init__(self, document_repository: IDocumentRepository):
        """
        Инициализирует handler.

        Args:
            document_repository: Репозиторий документов
        """
        self.document_repository = document_repository

    async def handle(
        self, query: SearchDocumentsQuery
    ) -> Result[DocumentSearchResultDTO]:
        """
        Обрабатывает запрос поиска документов.

        Args:
            query: Запрос с параметрами поиска

        Returns:
            Result с DocumentSearchResultDTO или ошибкой
        """
        # 1. Конвертируем строковые фильтры в enum
        document_types_enum = None
        if query.document_types:
            try:
                document_types_enum = [
                    DocumentTypeEnum(dt) for dt in query.document_types
                ]
            except ValueError as e:
                return Result.fail(f"Invalid document type: {str(e)}")

        categories_enum = None
        if query.categories:
            try:
                categories_enum = [
                    DocumentCategoryEnum(cat) for cat in query.categories
                ]
            except ValueError as e:
                return Result.fail(f"Invalid category: {str(e)}")

        statuses_enum = None
        if query.statuses:
            try:
                statuses_enum = [
                    DocumentStatusEnum(status) for status in query.statuses
                ]
            except ValueError as e:
                return Result.fail(f"Invalid status: {str(e)}")

        # 2. Валидация параметров пагинации
        if query.limit < 1 or query.limit > 100:
            return Result.fail("Limit must be between 1 and 100")

        if query.offset < 0:
            return Result.fail("Offset must be non-negative")

        # 3. Конвертируем consultation_id в UUID (если указан)
        consultation_id = None
        if query.consultation_id:
            try:
                consultation_id = UUID(query.consultation_id)
            except ValueError:
                return Result.fail(f"Invalid consultation ID: {query.consultation_id}")

        # 4. Выполняем поиск через репозиторий
        owner_id = UUID(query.owner_id)

        documents, total = await self.document_repository.search(
            owner_id=owner_id,
            document_types=document_types_enum,
            categories=categories_enum,
            statuses=statuses_enum,
            query=query.query,
            tags=query.tags,
            consultation_id=consultation_id,
            limit=query.limit,
            offset=query.offset,
        )

        # 5. Конвертируем в DTOs
        items = [DocumentListItemDTO.from_entity(doc) for doc in documents]

        # 6. Формируем результат с пагинацией
        result = DocumentSearchResultDTO(
            items=items,
            total=total,
            limit=query.limit,
            offset=query.offset,
        )

        return Result.ok(result)
