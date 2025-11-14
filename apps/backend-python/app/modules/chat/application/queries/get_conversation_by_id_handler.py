"""
Get Conversation By ID Handler

Обработчик запроса получения беседы по ID.
"""
from uuid import UUID

from app.shared.domain.result import Result
from app.modules.chat.application.queries.get_conversation_by_id_query import (
    GetConversationByIdQuery,
)
from app.modules.chat.application.dtos.conversation_dto import ConversationDTO
from app.modules.chat.domain.repositories.conversation_repository import (
    IConversationRepository,
)


class GetConversationByIdHandler:
    """
    Handler для запроса получения беседы по ID.

    Возвращает полную информацию о беседе с историей сообщений,
    если пользователь является владельцем.
    """

    def __init__(self, conversation_repository: IConversationRepository):
        """
        Инициализирует handler.

        Args:
            conversation_repository: Репозиторий бесед
        """
        self.conversation_repository = conversation_repository

    async def handle(
        self, query: GetConversationByIdQuery
    ) -> Result[ConversationDTO]:
        """
        Обрабатывает запрос получения беседы.

        Args:
            query: Запрос с ID беседы

        Returns:
            Result с ConversationDTO или ошибкой
        """
        # Находим беседу
        conversation_id = UUID(query.conversation_id)
        conversation = await self.conversation_repository.find_by_id(
            conversation_id, include_messages=query.include_messages
        )

        if conversation is None:
            return Result.fail(f"Conversation not found: {query.conversation_id}")

        # Проверяем права доступа
        if str(conversation.user_id) != query.user_id:
            return Result.fail(
                "Access denied. You can only view your own conversations."
            )

        # Возвращаем DTO
        return Result.ok(ConversationDTO.from_entity(conversation))
