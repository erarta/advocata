"""
Response Schemas для Chat API

Pydantic модели для ответов API.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    """
    Схема ответа для сообщения.

    Attributes:
        id: ID сообщения
        conversation_id: ID беседы
        role: Роль отправителя (user, assistant, system)
        content: Текст сообщения
        token_count: Количество токенов (для assistant)
        referenced_documents: ID документов использованных для ответа
        created_at: Дата создания
    """

    id: str = Field(..., description="UUID сообщения")
    conversation_id: str = Field(..., description="UUID беседы")
    role: str = Field(..., description="Роль отправителя")
    content: str = Field(..., description="Текст сообщения")
    token_count: Optional[int] = Field(None, description="Количество токенов")
    referenced_documents: List[str] = Field(
        default_factory=list,
        description="ID документов",
    )
    created_at: datetime = Field(..., description="Дата создания")

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    """
    Схема ответа для полной беседы с сообщениями.

    Attributes:
        id: ID беседы
        user_id: ID пользователя
        title: Название беседы
        status: Статус беседы
        total_tokens: Общее количество токенов
        messages_count: Количество сообщений
        messages: Список сообщений
        created_at: Дата создания
        updated_at: Дата обновления
        last_message_at: Дата последнего сообщения
    """

    id: str = Field(..., description="UUID беседы")
    user_id: str = Field(..., description="UUID пользователя")
    title: Optional[str] = Field(None, description="Название беседы")
    status: str = Field(..., description="Статус беседы")
    total_tokens: int = Field(..., description="Общее количество токенов")
    messages_count: int = Field(..., description="Количество сообщений")
    messages: List[MessageResponse] = Field(
        default_factory=list,
        description="Список сообщений",
    )
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")
    last_message_at: Optional[datetime] = Field(
        None,
        description="Дата последнего сообщения",
    )

    class Config:
        from_attributes = True


class ConversationListItemResponse(BaseModel):
    """
    Схема ответа для элемента списка бесед (без сообщений).

    Attributes:
        id: ID беседы
        user_id: ID пользователя
        title: Название беседы
        status: Статус беседы
        total_tokens: Общее количество токенов
        messages_count: Количество сообщений
        last_message_preview: Превью последнего сообщения
        created_at: Дата создания
        updated_at: Дата обновления
        last_message_at: Дата последнего сообщения
    """

    id: str = Field(..., description="UUID беседы")
    user_id: str = Field(..., description="UUID пользователя")
    title: Optional[str] = Field(None, description="Название беседы")
    status: str = Field(..., description="Статус беседы")
    total_tokens: int = Field(..., description="Общее количество токенов")
    messages_count: int = Field(..., description="Количество сообщений")
    last_message_preview: Optional[str] = Field(
        None,
        description="Превью последнего сообщения",
    )
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")
    last_message_at: Optional[datetime] = Field(
        None,
        description="Дата последнего сообщения",
    )

    class Config:
        from_attributes = True


class ConversationSearchResponse(BaseModel):
    """
    Схема ответа для поиска бесед с пагинацией.

    Attributes:
        items: Список бесед
        total: Общее количество бесед
        limit: Лимит результатов
        offset: Смещение
        has_more: Есть ли еще результаты
    """

    items: List[ConversationListItemResponse] = Field(
        default_factory=list,
        description="Список бесед",
    )
    total: int = Field(..., description="Общее количество")
    limit: int = Field(..., description="Лимит результатов")
    offset: int = Field(..., description="Смещение")
    has_more: bool = Field(..., description="Есть ли еще результаты")

    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    """
    Схема ответа для ошибок.

    Attributes:
        detail: Описание ошибки
        error_code: Код ошибки (опционально)
    """

    detail: str = Field(..., description="Описание ошибки")
    error_code: Optional[str] = Field(None, description="Код ошибки")


class TokenUsageResponse(BaseModel):
    """
    Схема ответа для статистики использования токенов.

    Attributes:
        user_id: ID пользователя
        total_tokens: Общее количество токенов
        total_conversations: Количество бесед
    """

    user_id: str = Field(..., description="UUID пользователя")
    total_tokens: int = Field(..., description="Общее количество токенов")
    total_conversations: int = Field(..., description="Количество бесед")
