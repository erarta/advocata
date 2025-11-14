"""
Get Conversations By User Handler

Обработчик запроса получения всех бесед пользователя.
"""
from uuid import UUID
from typing import Optional

from app.shared.domain.result import Result
from app.modules.chat.application.queries.get_conversations_by_user_query import (
    GetConversationsByUserQuery,
)
from app.modules.chat.application.dtos.conversation_dto import (
    ConversationSearchResultDTO,
    ConversationListItemDTO,
)
from app.modules.chat.domain.repositories.conversation_repository import (
    IConversationRepository,
)
from app.modules.chat.domain.value_objects.conversation_status import (
    ConversationStatusEnum,
)


class GetConversationsByUserHandler:
    """
    Handler для запроса получения бесед пользователя.

    Возвращает список бесед с пагинацией.
    """

    def __init__(self, conversation_repository: IConversationRepository):
        """
        Инициализирует handler.

        Args:
            conversation_repository: Репозиторий бесед
        """
        self.conversation_repository = conversation_repository

    async def handle(
        self, query: GetConversationsByUserQuery
    ) -> Result[ConversationSearchResultDTO]:
        """
        Обрабатывает запрос получения бесед пользователя.

        Args:
            query: Запрос с ID пользователя

        Returns:
            Result с ConversationSearchResultDTO или ошибкой
        """
        # Валидация параметров пагинации
        if query.limit < 1 or query.limit > 100:
            return Result.fail("Limit must be between 1 and 100")

        if query.offset < 0:
            return Result.fail("Offset must be non-negative")

        # Конвертируем статус в enum (если указан)
        status_enum: Optional[ConversationStatusEnum] = None
        if query.status:
            try:
                status_enum = ConversationStatusEnum(query.status)
            except ValueError:
                return Result.fail(f"Invalid status: {query.status}")

        # Получаем беседы пользователя
        user_id = UUID(query.user_id)

        conversations, total = await self.conversation_repository.find_by_user(
            user_id=user_id,
            status=status_enum,
            limit=query.limit,
            offset=query.offset,
        )

        # Конвертируем в DTOs
        items = [
            ConversationListItemDTO.from_entity(conv) for conv in conversations
        ]

        # Формируем результат с пагинацией
        result = ConversationSearchResultDTO(
            items=items,
            total=total,
            limit=query.limit,
            offset=query.offset,
        )

        return Result.ok(result)
