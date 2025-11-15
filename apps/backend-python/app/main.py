"""
Advocata Backend API - Main Application

Точка входа FastAPI приложения.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, WebSocket, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.infrastructure.database import init_db, close_db

# Настройка логирования
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Управление жизненным циклом приложения.

    Выполняется при запуске и остановке приложения.
    """
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")

    if settings.debug:
        logger.warning("Debug mode is enabled")

    # Инициализация базы данных (только для dev)
    if settings.is_development:
        logger.info("Initializing database...")
        await init_db()

    logger.info("Application started successfully")

    yield

    # Shutdown
    logger.info("Shutting down application...")
    await close_db()
    logger.info("Application shut down successfully")


# Создание FastAPI приложения
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    **Advocata API** - Backend для платформы юридических услуг.

    ## Основные функции:

    * 🔐 **Аутентификация** - JWT токены, OTP верификация
    * 👨‍⚖️ **Управление юристами** - Регистрация, поиск, верификация
    * 📄 **Документы** - Загрузка и обработка юридических документов
    * 💼 **Консультации** - Бронирование, управление и оценка консультаций
    * 🤖 **AI Чат-бот** - RAG система для ответов на вопросы

    ## Архитектура:

    * **DDD** (Domain-Driven Design)
    * **Clean Architecture**
    * **CQRS** Pattern
    * **Event-Driven**

    ## Технологии:

    * FastAPI + Python 3.11
    * PostgreSQL + pgvector
    * Redis + Celery
    * OpenAI (GPT-4 + Embeddings)
    * LangChain для RAG
    """,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """
    Проверка состояния API.

    Returns:
        Статус сервиса и версия
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root() -> dict:
    """
    Корневой endpoint.

    Returns:
        Информация об API
    """
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs" if settings.debug else "Documentation is disabled in production",
    }


# Подключение роутеров модулей
from app.modules.identity.presentation.api.auth_router import router as auth_router
from app.modules.lawyer.presentation.api.lawyer_router import router as lawyer_router
from app.modules.document.presentation.api.document_router import router as document_router
from app.modules.chat.presentation import router as chat_router
from app.modules.chat.presentation import websocket_endpoint
from app.modules.consultation.presentation import router as consultation_router

# Регистрация роутеров
app.include_router(auth_router, prefix=f"{settings.api_v1_prefix}")
app.include_router(lawyer_router, prefix=f"{settings.api_v1_prefix}")
app.include_router(document_router, prefix=f"{settings.api_v1_prefix}")
app.include_router(chat_router, prefix=f"{settings.api_v1_prefix}")
app.include_router(consultation_router, prefix=f"{settings.api_v1_prefix}")


# WebSocket endpoint для real-time чата
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.infrastructure.database import get_db


@app.websocket("/ws/chat/{conversation_id}")
async def chat_websocket(
    websocket: WebSocket,
    conversation_id: str,
    user_id: str = Query(..., description="ID пользователя"),
    db: AsyncSession = Depends(get_db),
):
    """
    WebSocket endpoint для real-time чата с AI ассистентом.

    Args:
        websocket: WebSocket соединение
        conversation_id: UUID беседы
        user_id: UUID пользователя (для авторизации)
        db: Database session

    Example:
        ws://localhost:8000/ws/chat/550e8400-e29b-41d4-a716-446655440000?user_id=123e4567-e89b-12d3-a456-426614174000
    """
    await websocket_endpoint(websocket, conversation_id, user_id, db)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
