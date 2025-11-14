"""
Conversation Repository Interface

Интерфейс репозитория для работы с беседами.
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID

from app.modules.chat.domain.entities.conversation import Conversation
from app.modules.chat.domain.value_objects.conversation_status import (
    ConversationStatusEnum,
)


class IConversationRepository(ABC):
    """
    Интерфейс репозитория бесед.

    Определяет контракт для работы с хранилищем бесед.
    Реализация будет в Infrastructure Layer.
    """

    @abstractmethod
    async def save(self, conversation: Conversation) -> Conversation:
        """
        Сохраняет беседу (создание или обновление).

        Args:
            conversation: Беседа для сохранения

        Returns:
            Сохраненная беседа
        """
        pass

    @abstractmethod
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
            Беседа или None, если не найдена
        """
        pass

    @abstractmethod
    async def find_by_user(
        self,
        user_id: UUID,
        status: Optional[ConversationStatusEnum] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[List[Conversation], int]:
        """
        Находит все беседы пользователя с пагинацией.

        Args:
            user_id: ID пользователя
            status: Фильтр по статусу (опционально)
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Кортеж (список бесед, общее количество)
        """
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    async def delete(self, conversation_id: UUID) -> None:
        """
        Физически удаляет беседу из БД.

        Args:
            conversation_id: ID беседы для удаления
        """
        pass

    @abstractmethod
    async def get_total_tokens_by_user(self, user_id: UUID) -> int:
        """
        Подсчитывает общее количество токенов пользователя.

        Args:
            user_id: ID пользователя

        Returns:
            Общее количество токенов
        """
        pass
