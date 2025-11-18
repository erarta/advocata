"""
Send Message Handler

Обработчик команды отправки сообщения с AI ответом.
"""
from uuid import UUID
from typing import Protocol

from app.shared.domain.result import Result
from app.modules.chat.application.commands.send_message_command import (
    SendMessageCommand,
)
from app.modules.chat.application.dtos.conversation_dto import ConversationDTO
from app.modules.chat.domain.repositories.conversation_repository import (
    IConversationRepository,
)
from app.modules.chat.domain.services.rag_service import IRAGService


class IAIService(Protocol):
    """
    Интерфейс для AI сервиса (OpenAI/GPT-4).

    Определен здесь как Protocol для избежания циклических зависимостей.
    Реализация будет в Infrastructure Layer.
    """

    async def generate_response(
        self,
        conversation_history: list[dict],
        context: str | None = None,
    ) -> Result[tuple[str, int]]:
        """
        Генерирует ответ от AI на основе истории беседы.

        Args:
            conversation_history: История сообщений в формате OpenAI
            context: Дополнительный контекст из документов (RAG)

        Returns:
            Result с кортежем (текст_ответа, количество_токенов) или ошибкой
        """
        ...


class SendMessageHandler:
    """
    Handler для команды отправки сообщения.

    Orchestrates:
    1. Загрузка беседы
    2. Проверка прав доступа
    3. Добавление сообщения пользователя
    4. Поиск релевантных документов (RAG)
    5. Генерация ответа от AI
    6. Добавление ответа ассистента
    7. Сохранение беседы
    """

    def __init__(
        self,
        conversation_repository: IConversationRepository,
        ai_service: IAIService,
        rag_service: IRAGService,
    ):
        """
        Инициализирует handler.

        Args:
            conversation_repository: Репозиторий бесед
            ai_service: AI сервис (OpenAI)
            rag_service: RAG сервис (поиск документов)
        """
        self.conversation_repository = conversation_repository
        self.ai_service = ai_service
        self.rag_service = rag_service

    async def handle(self, command: SendMessageCommand) -> Result[ConversationDTO]:
        """
        Обрабатывает команду отправки сообщения.

        Args:
            command: Команда отправки сообщения

        Returns:
            Result с обновленным ConversationDTO или ошибкой
        """
        # 1. Загружаем беседу
        conversation_id = UUID(command.conversation_id)
        conversation = await self.conversation_repository.find_by_id(
            conversation_id, include_messages=True
        )

        if conversation is None:
            return Result.fail(f"Conversation not found: {command.conversation_id}")

        # 2. Проверяем права доступа
        if str(conversation.user_id) != command.user_id:
            return Result.fail(
                "Access denied. You can only send messages to your own conversations."
            )

        # 3. Добавляем сообщение пользователя
        user_message_result = conversation.add_user_message(command.message_content)

        if not user_message_result.is_success:
            return Result.fail(user_message_result.error)

        user_message = user_message_result.value

        # 4. Поиск релевантных документов (RAG)
        context = None
        referenced_documents = []

        if command.use_rag:
            rag_result = await self.rag_service.search_relevant_documents(
                user_id=conversation.user_id,
                query=command.message_content,
                top_k=5,
                min_similarity=0.7,
            )

            if rag_result.is_success and rag_result.value:
                chunks = rag_result.value
                # Строим контекст из найденных документов
                context = await self.rag_service.build_context(
                    query=command.message_content,
                    chunks=chunks,
                    max_tokens=4000,
                )
                # Сохраняем ID документов для метаданных
                referenced_documents = [chunk.document_id for chunk in chunks]

        # 5. Формируем историю беседы для OpenAI
        conversation_history = self._build_conversation_history(conversation)

        # 6. Генерируем ответ от AI
        ai_response_result = await self.ai_service.generate_response(
            conversation_history=conversation_history,
            context=context,
        )

        if not ai_response_result.is_success:
            return Result.fail(f"AI response failed: {ai_response_result.error}")

        response_text, token_count = ai_response_result.value

        # 7. Добавляем ответ ассистента
        assistant_message_result = conversation.add_assistant_message(
            content=response_text,
            token_count=token_count,
            referenced_documents=referenced_documents if referenced_documents else None,
        )

        if not assistant_message_result.is_success:
            return Result.fail(assistant_message_result.error)

        # 8. Сохраняем обновленную беседу
        updated_conversation = await self.conversation_repository.save(conversation)

        # 9. Возвращаем DTO
        return Result.ok(ConversationDTO.from_entity(updated_conversation))

    def _build_conversation_history(self, conversation) -> list[dict]:
        """
        Строит историю беседы в формате OpenAI.

        Args:
            conversation: Беседа с сообщениями

        Returns:
            Список сообщений в формате OpenAI
        """
        history = []

        for message in conversation.messages:
            history.append({
                "role": message.role.value.value,
                "content": message.content,
            })

        return history
