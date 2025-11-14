"""
Start Conversation Handler

Обработчик команды начала новой беседы.
"""
from uuid import UUID

from app.shared.domain.result import Result
from app.modules.chat.application.commands.start_conversation_command import (
    StartConversationCommand,
)
from app.modules.chat.application.dtos.conversation_dto import ConversationDTO
from app.modules.chat.domain.entities.conversation import Conversation
from app.modules.chat.domain.repositories.conversation_repository import (
    IConversationRepository,
)


class StartConversationHandler:
    """
    Handler для команды начала беседы.

    Orchestrates:
    1. Создание новой беседы
    2. Добавление первого сообщения от пользователя
    3. Сохранение в репозиторий
    """

    def __init__(self, conversation_repository: IConversationRepository):
        """
        Инициализирует handler.

        Args:
            conversation_repository: Репозиторий бесед
        """
        self.conversation_repository = conversation_repository

    async def handle(self, command: StartConversationCommand) -> Result[ConversationDTO]:
        """
        Обрабатывает команду начала беседы.

        Args:
            command: Команда начала беседы

        Returns:
            Result с ConversationDTO или ошибкой
        """
        # Создаем беседу через доменный метод
        user_id = UUID(command.user_id)

        conversation_result = Conversation.start(
            user_id=user_id,
            initial_message_content=command.initial_message,
            title=command.title,
        )

        if not conversation_result.is_success:
            return Result.fail(conversation_result.error)

        conversation = conversation_result.value

        # Сохраняем в репозиторий
        saved_conversation = await self.conversation_repository.save(conversation)

        # Возвращаем DTO
        return Result.ok(ConversationDTO.from_entity(saved_conversation))
