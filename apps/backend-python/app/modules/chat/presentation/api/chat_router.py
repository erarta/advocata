"""
Chat API Router

FastAPI роутер для управления беседами с AI ассистентом.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.modules.identity.presentation.dependencies.auth_deps import get_current_user
from app.modules.identity.application.dtos.user_dto import UserDTO

# Application Layer imports
from app.modules.chat.application.commands.start_conversation_command import (
    StartConversationCommand,
)
from app.modules.chat.application.commands.start_conversation_handler import (
    StartConversationHandler,
)
from app.modules.chat.application.commands.send_message_command import (
    SendMessageCommand,
)
from app.modules.chat.application.commands.send_message_handler import (
    SendMessageHandler,
)
from app.modules.chat.application.queries.get_conversation_by_id_query import (
    GetConversationByIdQuery,
)
from app.modules.chat.application.queries.get_conversation_by_id_handler import (
    GetConversationByIdHandler,
)
from app.modules.chat.application.queries.get_conversations_by_user_query import (
    GetConversationsByUserQuery,
)
from app.modules.chat.application.queries.get_conversations_by_user_handler import (
    GetConversationsByUserHandler,
)

# Infrastructure Layer imports
from app.modules.chat.infrastructure.persistence.repositories.conversation_repository_impl import (
    ConversationRepositoryImpl,
)
from app.modules.chat.infrastructure.services.openai_service import OpenAIService
from app.modules.chat.infrastructure.services.rag_service import RAGServiceImpl

# Presentation Layer imports
from app.modules.chat.presentation.dependencies import (
    OpenAIServiceDep,
    RAGServiceDep,
    ConversationRepositoryDep,
)
from app.modules.chat.presentation.schemas.requests import (
    StartConversationRequest,
    SendMessageRequest,
)
from app.modules.chat.presentation.schemas.responses import (
    ConversationResponse,
    ConversationSearchResponse,
    ConversationListItemResponse,
    MessageResponse,
    ErrorResponse,
    TokenUsageResponse,
)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        404: {"model": ErrorResponse, "description": "Not Found"},
        422: {"model": ErrorResponse, "description": "Validation Error"},
    },
)


# Helper functions для конвертации DTOs в Responses
def _to_message_response(message_dto) -> MessageResponse:
    """Конвертирует MessageDTO в MessageResponse."""
    return MessageResponse(
        id=message_dto.id,
        conversation_id=message_dto.conversation_id,
        role=message_dto.role,
        content=message_dto.content,
        token_count=message_dto.token_count,
        referenced_documents=message_dto.referenced_documents,
        created_at=message_dto.created_at,
    )


def _to_conversation_response(conversation_dto) -> ConversationResponse:
    """Конвертирует ConversationDTO в ConversationResponse."""
    return ConversationResponse(
        id=conversation_dto.id,
        user_id=conversation_dto.user_id,
        title=conversation_dto.title,
        status=conversation_dto.status,
        total_tokens=conversation_dto.total_tokens,
        messages_count=conversation_dto.messages_count,
        messages=[_to_message_response(msg) for msg in conversation_dto.messages],
        created_at=conversation_dto.created_at,
        updated_at=conversation_dto.updated_at,
        last_message_at=conversation_dto.last_message_at,
    )


def _to_conversation_list_item_response(
    conversation_dto,
) -> ConversationListItemResponse:
    """Конвертирует ConversationListItemDTO в ConversationListItemResponse."""
    return ConversationListItemResponse(
        id=conversation_dto.id,
        user_id=conversation_dto.user_id,
        title=conversation_dto.title,
        status=conversation_dto.status,
        total_tokens=conversation_dto.total_tokens,
        messages_count=conversation_dto.messages_count,
        last_message_preview=conversation_dto.last_message_preview,
        created_at=conversation_dto.created_at,
        updated_at=conversation_dto.updated_at,
        last_message_at=conversation_dto.last_message_at,
    )


@router.post(
    "/conversations",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Начать новую беседу",
    description="""
    Начинает новую беседу с AI ассистентом.

    **Процесс:**
    1. Создается новая беседа со статусом ACTIVE
    2. Добавляется первое сообщение от пользователя
    3. Возвращается беседа с initial message

    **Права:** Требуется аутентификация
    """,
)
async def start_conversation(
    request: StartConversationRequest,
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    repository: ConversationRepositoryDep,
) -> ConversationResponse:
    """
    Начать новую беседу.

    Args:
        request: Данные для начала беседы
        current_user: Текущий пользователь
        repository: Conversation repository (injected)

    Returns:
        ConversationResponse

    Raises:
        HTTPException: 400 если ошибка создания
    """
    # Создаем handler
    handler = StartConversationHandler(repository)

    # Создаем команду
    command = StartConversationCommand(
        user_id=current_user.id,
        initial_message_content=request.initial_message,
        title=request.title,
    )

    # Выполняем команду
    result = await handler.handle(command)

    if not result.is_success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    # Конвертируем DTO в Response
    return _to_conversation_response(result.value)


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK,
    summary="Отправить сообщение",
    description="""
    Отправляет сообщение в беседу и получает ответ от AI.

    **Процесс:**
    1. Проверяется доступ пользователя к беседе
    2. Добавляется сообщение пользователя
    3. Поиск релевантных документов (RAG) если use_rag=true
    4. Генерация ответа от GPT-4 с контекстом
    5. Добавляется ответ ассистента
    6. Возвращается обновленная беседа

    **Права:** Требуется аутентификация + владение беседой
    """,
)
async def send_message(
    conversation_id: str,
    request: SendMessageRequest,
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    repository: ConversationRepositoryDep,
    ai_service: OpenAIServiceDep,
    rag_service: RAGServiceDep,
) -> ConversationResponse:
    """
    Отправить сообщение в беседу.

    Args:
        conversation_id: ID беседы
        request: Данные сообщения
        current_user: Текущий пользователь
        repository: Conversation repository (injected)
        ai_service: OpenAI service (injected)
        rag_service: RAG service (injected)

    Returns:
        ConversationResponse

    Raises:
        HTTPException: 400/403/404 при ошибках
    """
    # Создаем handler
    handler = SendMessageHandler(repository, ai_service, rag_service)

    # Создаем команду
    command = SendMessageCommand(
        conversation_id=conversation_id,
        user_id=current_user.id,
        message_content=request.message_content,
        use_rag=request.use_rag,
    )

    # Выполняем команду
    result = await handler.handle(command)

    if not result.is_success:
        # Определяем статус код по ошибке
        if "not found" in result.error.lower():
            status_code = status.HTTP_404_NOT_FOUND
        elif "access denied" in result.error.lower():
            status_code = status.HTTP_403_FORBIDDEN
        else:
            status_code = status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=status_code,
            detail=result.error,
        )

    # Конвертируем DTO в Response
    return _to_conversation_response(result.value)


@router.get(
    "/conversations/{conversation_id}",
    response_model=ConversationResponse,
    status_code=status.HTTP_200_OK,
    summary="Получить беседу",
    description="""
    Получает полную беседу с историей сообщений.

    **Права:** Требуется аутентификация + владение беседой
    """,
)
async def get_conversation(
    conversation_id: str,
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    repository: ConversationRepositoryDep,
    include_messages: bool = Query(True, description="Загружать ли сообщения"),
) -> ConversationResponse:
    """
    Получить беседу по ID.

    Args:
        conversation_id: ID беседы
        current_user: Текущий пользователь
        repository: Conversation repository (injected)
        include_messages: Загружать ли сообщения

    Returns:
        ConversationResponse

    Raises:
        HTTPException: 403/404 при ошибках
    """
    # Создаем handler
    handler = GetConversationByIdHandler(repository)

    # Создаем query
    query = GetConversationByIdQuery(
        conversation_id=conversation_id,
        user_id=current_user.id,
        include_messages=include_messages,
    )

    # Выполняем query
    result = await handler.handle(query)

    if not result.is_success:
        # Определяем статус код по ошибке
        if "not found" in result.error.lower():
            status_code = status.HTTP_404_NOT_FOUND
        elif "access denied" in result.error.lower():
            status_code = status.HTTP_403_FORBIDDEN
        else:
            status_code = status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=status_code,
            detail=result.error,
        )

    # Конвертируем DTO в Response
    return _to_conversation_response(result.value)


@router.get(
    "/conversations",
    response_model=ConversationSearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Получить список бесед",
    description="""
    Получает список бесед пользователя с пагинацией и фильтрацией.

    **Фильтры:**
    - status: active, archived, deleted (опционально)

    **Пагинация:**
    - limit: 1-100 (по умолчанию 50)
    - offset: 0+ (по умолчанию 0)

    **Права:** Требуется аутентификация
    """,
)
async def get_conversations(
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    repository: ConversationRepositoryDep,
    status_filter: str = Query(None, alias="status", description="Фильтр по статусу"),
    limit: int = Query(50, ge=1, le=100, description="Количество результатов"),
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
) -> ConversationSearchResponse:
    """
    Получить список бесед.

    Args:
        current_user: Текущий пользователь
        repository: Conversation repository (injected)
        status_filter: Фильтр по статусу
        limit: Количество результатов
        offset: Смещение

    Returns:
        ConversationSearchResponse

    Raises:
        HTTPException: 400 при ошибках валидации
    """
    # Создаем handler
    handler = GetConversationsByUserHandler(repository)

    # Создаем query
    query = GetConversationsByUserQuery(
        user_id=current_user.id,
        status=status_filter,
        limit=limit,
        offset=offset,
    )

    # Выполняем query
    result = await handler.handle(query)

    if not result.is_success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    # Конвертируем DTO в Response
    search_result_dto = result.value

    return ConversationSearchResponse(
        items=[
            _to_conversation_list_item_response(item)
            for item in search_result_dto.items
        ],
        total=search_result_dto.total,
        limit=search_result_dto.limit,
        offset=search_result_dto.offset,
        has_more=search_result_dto.has_more,
    )


@router.get(
    "/stats/tokens",
    response_model=TokenUsageResponse,
    status_code=status.HTTP_200_OK,
    summary="Получить статистику токенов",
    description="""
    Получает статистику использования токенов пользователем.

    **Права:** Требуется аутентификация
    """,
)
async def get_token_usage(
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    repository: ConversationRepositoryDep,
) -> TokenUsageResponse:
    """
    Получить статистику токенов.

    Args:
        current_user: Текущий пользователь
        repository: Conversation repository (injected)

    Returns:
        TokenUsageResponse
    """
    from uuid import UUID

    # Получаем статистику
    user_id_uuid = UUID(current_user.id)
    total_tokens = await repository.get_total_tokens_by_user(user_id_uuid)
    total_conversations = await repository.count_by_user(user_id_uuid)

    return TokenUsageResponse(
        user_id=current_user.id,
        total_tokens=total_tokens,
        total_conversations=total_conversations,
    )
