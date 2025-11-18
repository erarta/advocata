"""
Dependencies для Chat Module
"""
from app.modules.chat.presentation.dependencies.chat_deps import (
    get_openai_service,
    get_rag_service,
    get_conversation_repository,
    OpenAIServiceDep,
    RAGServiceDep,
    ConversationRepositoryDep,
)

__all__ = [
    "get_openai_service",
    "get_rag_service",
    "get_conversation_repository",
    "OpenAIServiceDep",
    "RAGServiceDep",
    "ConversationRepositoryDep",
]
