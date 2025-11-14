"""
Request Schemas для Chat API

Pydantic модели для валидации входящих данных.
"""

from typing import Optional

from pydantic import BaseModel, Field


class StartConversationRequest(BaseModel):
    """
    Схема для начала новой беседы.

    Attributes:
        initial_message: Первое сообщение от пользователя
        title: Название беседы (опционально, автогенерируется из сообщения)
    """

    initial_message: str = Field(
        ...,
        min_length=1,
        max_length=32000,
        description="Первое сообщение от пользователя",
        examples=["Помогите разобраться в вопросе по ДТП"],
    )

    title: Optional[str] = Field(
        None,
        max_length=200,
        description="Название беседы (опционально)",
        examples=["Консультация по ДТП"],
    )


class SendMessageRequest(BaseModel):
    """
    Схема для отправки сообщения в беседу.

    Attributes:
        message_content: Текст сообщения
        use_rag: Использовать ли RAG (поиск по документам)
    """

    message_content: str = Field(
        ...,
        min_length=1,
        max_length=32000,
        description="Текст сообщения",
        examples=["Могу ли я получить компенсацию если виновник без ОСАГО?"],
    )

    use_rag: bool = Field(
        True,
        description="Использовать ли RAG (поиск по документам пользователя)",
    )


class GetConversationsRequest(BaseModel):
    """
    Схема для получения списка бесед.

    Attributes:
        status: Фильтр по статусу (опционально)
        limit: Количество результатов (1-100)
        offset: Смещение для пагинации
    """

    status: Optional[str] = Field(
        None,
        description="Фильтр по статусу (active, archived, deleted)",
        examples=["active"],
    )

    limit: int = Field(
        50,
        ge=1,
        le=100,
        description="Количество результатов",
    )

    offset: int = Field(
        0,
        ge=0,
        description="Смещение для пагинации",
    )


class ArchiveConversationRequest(BaseModel):
    """
    Схема для архивирования беседы.

    Note: Может быть пустой, т.к. ID беседы передается в URL.
    """

    pass


class DeleteConversationRequest(BaseModel):
    """
    Схема для удаления беседы.

    Note: Может быть пустой, т.к. ID беседы передается в URL.
    """

    pass
