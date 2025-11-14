"""
Chat Dependencies

Dependency Injection для Chat Module.
"""
from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.infrastructure.database import get_db
from app.modules.chat.infrastructure.services.openai_service import OpenAIService
from app.modules.chat.infrastructure.services.rag_service import RAGServiceImpl
from app.modules.chat.infrastructure.persistence.repositories.conversation_repository_impl import (
    ConversationRepositoryImpl,
)
from app.config import settings


@lru_cache()
def get_openai_service() -> OpenAIService:
    """
    Singleton OpenAI сервиса.

    Использует lru_cache для создания одного экземпляра на весь lifecycle приложения.

    Returns:
        OpenAIService instance
    """
    return OpenAIService(
        api_key=settings.openai_api_key,
        model=settings.openai_llm_model,
        max_tokens=1500,
        temperature=0.7,
    )


def get_rag_service(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> RAGServiceImpl:
    """
    Factory для RAG сервиса.

    Создает новый экземпляр для каждого запроса (т.к. зависит от db session).

    Args:
        db: Database session

    Returns:
        RAGServiceImpl instance
    """
    return RAGServiceImpl(
        session=db,
        openai_api_key=settings.openai_api_key,
    )


def get_conversation_repository(
    db: Annotated[AsyncSession, Depends(get_db)]
) -> ConversationRepositoryImpl:
    """
    Factory для Conversation Repository.

    Args:
        db: Database session

    Returns:
        ConversationRepositoryImpl instance
    """
    return ConversationRepositoryImpl(db)


# Type aliases для удобства
OpenAIServiceDep = Annotated[OpenAIService, Depends(get_openai_service)]
RAGServiceDep = Annotated[RAGServiceImpl, Depends(get_rag_service)]
ConversationRepositoryDep = Annotated[
    ConversationRepositoryImpl,
    Depends(get_conversation_repository),
]
