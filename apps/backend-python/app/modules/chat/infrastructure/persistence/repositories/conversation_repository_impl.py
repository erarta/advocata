"""
Conversation Repository Implementation

Реализация репозитория бесед с использованием SQLAlchemy.
"""
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func, delete as sql_delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.chat.domain.entities.conversation import Conversation
from app.modules.chat.domain.repositories.conversation_repository import (
    IConversationRepository,
)
from app.modules.chat.domain.value_objects.conversation_status import (
    ConversationStatusEnum,
)
from app.modules.chat.infrastructure.persistence.models.conversation_model import (
    ConversationModel,
)
from app.modules.chat.infrastructure.persistence.models.message_model import (
    MessageModel,
)
from app.modules.chat.infrastructure.persistence.mappers.conversation_mapper import (
    ConversationMapper,
)


class ConversationRepositoryImpl(IConversationRepository):
    """
    Реализация репозитория бесед с использованием SQLAlchemy.

    Implements:
    - Сохранение и обновление бесед с сообщениями
    - Поиск по различным критериям
    - Пагинация результатов
    - Подсчет статистики (токены, количество бесед)
    """

    def __init__(self, session: AsyncSession):
        """
        Инициализирует репозиторий.

        Args:
            session: Async SQLAlchemy сессия
        """
        self.session = session

    async def save(self, conversation: Conversation) -> Conversation:
        """
        Сохраняет беседу (создание или обновление).

        Args:
            conversation: Беседа для сохранения

        Returns:
            Сохраненная беседа
        """
        # Проверяем, существует ли беседа
        existing = await self.session.get(
            ConversationModel,
            str(conversation.id),
            options=[selectinload(ConversationModel.messages)],
        )

        if existing:
            # Обновляем существующую беседу
            updated_model = ConversationMapper.update_model(
                existing, conversation, include_messages=True
            )
            self.session.add(updated_model)
        else:
            # Создаем новую беседу
            model = ConversationMapper.to_model(conversation, include_messages=True)
            self.session.add(model)

        await self.session.flush()
        await self.session.refresh(existing if existing else model)

        # Возвращаем обновленную доменную сущность
        saved_model = existing if existing else model
        return ConversationMapper.to_domain(saved_model, include_messages=True)

    async def find_by_id(
        self,
        conversation_id: UUID,
        include_messages: bool = True,
    ) -> Optional[Conversation]:
        """
        Находит беседу по ID.

        Args:
            conversation_id: ID беседы
            include_messages: Загружать ли сообщения

        Returns:
            Беседа или None
        """
        if include_messages:
            # Eager loading сообщений
            stmt = (
                select(ConversationModel)
                .where(ConversationModel.id == str(conversation_id))
                .options(selectinload(ConversationModel.messages))
            )
            result = await self.session.execute(stmt)
            model = result.scalar_one_or_none()
        else:
            # Без сообщений
            model = await self.session.get(ConversationModel, str(conversation_id))

        if model is None:
            return None

        return ConversationMapper.to_domain(model, include_messages=include_messages)

    async def find_by_user(
        self,
        user_id: UUID,
        status: Optional[ConversationStatusEnum] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[List[Conversation], int]:
        """
        Находит все беседы пользователя с фильтрацией и пагинацией.

        Args:
            user_id: ID пользователя
            status: Фильтр по статусу (опционально)
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Кортеж (список бесед, общее количество)
        """
        # Базовое условие
        where_clause = ConversationModel.user_id == str(user_id)

        # Добавляем фильтр по статусу если указан
        if status:
            where_clause = where_clause & (ConversationModel.status == status.value)

        # Запрос для подсчета
        count_stmt = (
            select(func.count())
            .select_from(ConversationModel)
            .where(where_clause)
        )
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        # Запрос для данных (без сообщений для списка)
        stmt = (
            select(ConversationModel)
            .where(where_clause)
            .order_by(ConversationModel.last_message_at.desc().nulls_last())
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(stmt)
        models = result.scalars().all()

        # Конвертируем в domain без сообщений (для списка не нужны)
        conversations = [
            ConversationMapper.to_domain(model, include_messages=False)
            for model in models
        ]

        return conversations, total

    async def count_by_user(
        self,
        user_id: UUID,
        status: Optional[ConversationStatusEnum] = None,
    ) -> int:
        """
        Подсчитывает количество бесед пользователя.

        Args:
            user_id: ID пользователя
            status: Фильтр по статусу (опционально)

        Returns:
            Количество бесед
        """
        # Базовое условие
        where_clause = ConversationModel.user_id == str(user_id)

        # Добавляем фильтр по статусу если указан
        if status:
            where_clause = where_clause & (ConversationModel.status == status.value)

        # Запрос для подсчета
        stmt = (
            select(func.count())
            .select_from(ConversationModel)
            .where(where_clause)
        )

        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def delete(self, conversation_id: UUID) -> bool:
        """
        Удаляет беседу (физическое удаление из БД).

        Args:
            conversation_id: ID беседы

        Returns:
            True если удалено, False если не найдено
        """
        # Проверяем существование
        model = await self.session.get(ConversationModel, str(conversation_id))

        if model is None:
            return False

        # Удаляем (cascade удалит все сообщения)
        await self.session.delete(model)
        await self.session.flush()

        return True

    async def get_total_tokens_by_user(self, user_id: UUID) -> int:
        """
        Подсчитывает общее количество токенов использованных пользователем.

        Args:
            user_id: ID пользователя

        Returns:
            Общее количество токенов
        """
        stmt = (
            select(func.sum(ConversationModel.total_tokens))
            .where(ConversationModel.user_id == str(user_id))
        )

        result = await self.session.execute(stmt)
        total = result.scalar_one_or_none()

        return total if total is not None else 0
