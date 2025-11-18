"""
Конфигурация базы данных

Настройка SQLAlchemy 2.0 с async поддержкой для PostgreSQL.
"""

from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import settings


# Создание async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_pre_ping=True,  # Проверка соединения перед использованием
    # Для тестов используем NullPool
    poolclass=NullPool if settings.environment == "test" else None,
)

# Создание фабрики сессий
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """
    Базовый класс для всех SQLAlchemy моделей.

    Используется для создания декларативных моделей с типизацией.
    """

    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency для получения сессии базы данных.

    Используется в FastAPI для inject сессии в endpoints.

    Yields:
        AsyncSession: Сессия базы данных

    Example:
        ```python
        @router.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            return result.scalars().all()
        ```
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Инициализация базы данных.

    Создает все таблицы определенные в моделях.

    Note:
        В production используйте Alembic миграции вместо этого метода.
    """
    async with engine.begin() as conn:
        # Создаем расширение pgvector если его нет
        await conn.execute(
            text("CREATE EXTENSION IF NOT EXISTS vector")
        )

        # Создаем все таблицы
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """
    Закрытие подключения к базе данных.

    Вызывается при остановке приложения.
    """
    await engine.dispose()
