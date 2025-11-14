"""
Alembic Environment Configuration

Настройка Alembic для автоматической генерации миграций из SQLAlchemy моделей.
"""

import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Добавляем корневую директорию проекта в Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Импортируем настройки и базовую модель
from app.config import settings
from app.core.infrastructure.database import Base

# Импортируем все модели для автогенерации миграций
# TODO: Раскомментировать когда модули будут созданы
# from app.modules.identity.infrastructure.persistence.models.user_model import UserModel
# from app.modules.lawyer.infrastructure.persistence.models.lawyer_model import LawyerModel
# from app.modules.document.infrastructure.persistence.models.document_model import DocumentModel
# from app.modules.document.infrastructure.persistence.models.chunk_model import ChunkModel
# from app.modules.chat.infrastructure.persistence.models.conversation_model import ConversationModel
# from app.modules.chat.infrastructure.persistence.models.message_model import MessageModel

# Конфигурация Alembic
config = context.config

# Настройка логирования из alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Метаданные для автогенерации
target_metadata = Base.metadata

# Устанавливаем database URL из настроек приложения
config.set_main_option("sqlalchemy.url", settings.database_url.replace("+asyncpg", ""))


def run_migrations_offline() -> None:
    """
    Запуск миграций в 'offline' режиме.

    Этот режим генерирует SQL команды без подключения к базе данных.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """
    Выполнение миграций с активным подключением.

    Args:
        connection: SQLAlchemy подключение
    """
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Асинхронный запуск миграций.

    Используется для async SQLAlchemy engine.
    """
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.database_url

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """
    Запуск миграций в 'online' режиме.

    Этот режим выполняет миграции с реальным подключением к базе данных.
    """
    asyncio.run(run_async_migrations())


# Определяем режим работы
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
