"""
Chat WebSocket Handler

WebSocket handler для real-time чата с AI ассистентом.
"""

import json
from typing import Dict, Optional
from uuid import UUID

from fastapi import WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.chat.application.commands.send_message_command import (
    SendMessageCommand,
)
from app.modules.chat.application.commands.send_message_handler import (
    SendMessageHandler,
)
from app.modules.chat.infrastructure.persistence.repositories.conversation_repository_impl import (
    ConversationRepositoryImpl,
)
from app.modules.chat.infrastructure.services.openai_service import OpenAIService
from app.modules.chat.infrastructure.services.rag_service import RAGServiceImpl


class ConnectionManager:
    """
    Менеджер WebSocket подключений.

    Управляет активными соединениями для real-time чата.
    """

    def __init__(self):
        """Инициализирует менеджер."""
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, conversation_id: str, websocket: WebSocket):
        """
        Подключает клиента к беседе.

        Args:
            conversation_id: ID беседы
            websocket: WebSocket соединение
        """
        await websocket.accept()
        self.active_connections[conversation_id] = websocket

    def disconnect(self, conversation_id: str):
        """
        Отключает клиента от беседы.

        Args:
            conversation_id: ID беседы
        """
        if conversation_id in self.active_connections:
            del self.active_connections[conversation_id]

    async def send_message(self, conversation_id: str, message: dict):
        """
        Отправляет сообщение клиенту.

        Args:
            conversation_id: ID беседы
            message: Сообщение в формате dict
        """
        if conversation_id in self.active_connections:
            websocket = self.active_connections[conversation_id]
            await websocket.send_json(message)

    async def send_error(self, conversation_id: str, error: str):
        """
        Отправляет ошибку клиенту.

        Args:
            conversation_id: ID беседы
            error: Описание ошибки
        """
        await self.send_message(
            conversation_id,
            {
                "type": "error",
                "error": error,
            },
        )


# Глобальный менеджер соединений
manager = ConnectionManager()


class ChatWebSocketHandler:
    """
    Handler для WebSocket чата.

    Обрабатывает входящие сообщения и отправляет ответы в real-time.
    """

    def __init__(
        self,
        db: AsyncSession,
        conversation_id: str,
        user_id: str,
    ):
        """
        Инициализирует handler.

        Args:
            db: Database session
            conversation_id: ID беседы
            user_id: ID пользователя
        """
        self.db = db
        self.conversation_id = conversation_id
        self.user_id = user_id

        # Создаем dependencies
        self.repository = ConversationRepositoryImpl(db)
        self.ai_service = OpenAIService()
        self.rag_service = RAGServiceImpl(db)
        self.handler = SendMessageHandler(
            self.repository,
            self.ai_service,
            self.rag_service,
        )

    async def handle_message(self, data: dict) -> Optional[dict]:
        """
        Обрабатывает входящее сообщение.

        Args:
            data: Данные сообщения
                {
                    "type": "message",
                    "content": "текст сообщения",
                    "use_rag": true
                }

        Returns:
            Ответ для отправки клиенту или None при ошибке
        """
        try:
            # Валидация данных
            message_type = data.get("type")
            if message_type != "message":
                return {"type": "error", "error": f"Unknown message type: {message_type}"}

            content = data.get("content")
            if not content or not isinstance(content, str):
                return {"type": "error", "error": "Message content is required"}

            use_rag = data.get("use_rag", True)

            # Создаем команду
            command = SendMessageCommand(
                conversation_id=self.conversation_id,
                user_id=self.user_id,
                message_content=content,
                use_rag=use_rag,
            )

            # Выполняем команду
            result = await self.handler.handle(command)

            if not result.is_success:
                return {"type": "error", "error": result.error}

            # Формируем ответ
            conversation_dto = result.value

            # Находим последнее сообщение ассистента
            assistant_message = None
            if conversation_dto.messages:
                for msg in reversed(conversation_dto.messages):
                    if msg.role == "assistant":
                        assistant_message = msg
                        break

            if not assistant_message:
                return {"type": "error", "error": "No assistant response"}

            # Возвращаем сообщение
            return {
                "type": "message",
                "message": {
                    "id": assistant_message.id,
                    "conversation_id": assistant_message.conversation_id,
                    "role": assistant_message.role,
                    "content": assistant_message.content,
                    "token_count": assistant_message.token_count,
                    "referenced_documents": assistant_message.referenced_documents,
                    "created_at": assistant_message.created_at.isoformat(),
                },
                "conversation": {
                    "total_tokens": conversation_dto.total_tokens,
                    "messages_count": conversation_dto.messages_count,
                },
            }

        except Exception as e:
            return {"type": "error", "error": f"Internal error: {str(e)}"}


async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: str,
    user_id: str,
    db: AsyncSession,
):
    """
    WebSocket endpoint для чата.

    Args:
        websocket: WebSocket соединение
        conversation_id: ID беседы
        user_id: ID пользователя
        db: Database session
    """
    # Подключаем клиента
    await manager.connect(conversation_id, websocket)

    # Создаем handler
    chat_handler = ChatWebSocketHandler(db, conversation_id, user_id)

    try:
        # Отправляем приветственное сообщение
        await manager.send_message(
            conversation_id,
            {
                "type": "connected",
                "conversation_id": conversation_id,
                "message": "Connected to chat",
            },
        )

        # Обрабатываем входящие сообщения
        while True:
            # Получаем сообщение
            data = await websocket.receive_json()

            # Обрабатываем сообщение
            response = await chat_handler.handle_message(data)

            # Отправляем ответ
            if response:
                await manager.send_message(conversation_id, response)

    except WebSocketDisconnect:
        # Клиент отключился
        manager.disconnect(conversation_id)

    except Exception as e:
        # Ошибка - отправляем и отключаемся
        await manager.send_error(conversation_id, f"WebSocket error: {str(e)}")
        manager.disconnect(conversation_id)
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
