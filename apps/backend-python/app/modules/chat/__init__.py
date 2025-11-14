"""
Chat Module

Модуль для AI чата с юридическим ассистентом + RAG система.

Architecture: Domain-Driven Design + CQRS
- Domain Layer: Entities, Value Objects, Domain Services
- Application Layer: Commands, Queries, DTOs, Handlers
- Infrastructure Layer: ORM, Repositories, AI Services (OpenAI + RAG)
- Presentation Layer: REST API + WebSocket

Features:
- AI чат-бот (GPT-4)
- RAG система (pgvector + OpenAI Embeddings)
- Контекстуальные ответы на юридические вопросы
- Real-time чат через WebSocket
- История бесед с пагинацией
- Подсчет токенов
"""

from app.modules.chat.presentation import router, websocket_endpoint

__all__ = [
    "router",
    "websocket_endpoint",
]
