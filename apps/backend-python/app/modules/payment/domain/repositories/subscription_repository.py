"""
Subscription Repository Interface

Интерфейс репозитория для подписок.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.modules.payment.domain.entities import Subscription
from app.modules.payment.domain.value_objects import SubscriptionPlanEnum


class ISubscriptionRepository(ABC):
    """
    Интерфейс репозитория для Subscription Aggregate.

    Определяет контракт для работы с подписками.
    """

    @abstractmethod
    async def save(self, subscription: Subscription) -> Subscription:
        """
        Сохранить подписку (создание или обновление).

        Args:
            subscription: Подписка для сохранения

        Returns:
            Сохраненная подписка
        """
        pass

    @abstractmethod
    async def find_by_id(self, subscription_id: UUID) -> Optional[Subscription]:
        """
        Найти подписку по ID.

        Args:
            subscription_id: ID подписки

        Returns:
            Subscription или None если не найдена
        """
        pass

    @abstractmethod
    async def find_active_by_user(self, user_id: UUID) -> Optional[Subscription]:
        """
        Найти активную подписку пользователя.

        Пользователь может иметь только одну активную подписку.

        Args:
            user_id: ID пользователя

        Returns:
            Subscription или None если нет активной подписки
        """
        pass

    @abstractmethod
    async def find_by_user(
        self,
        user_id: UUID,
        include_inactive: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[List[Subscription], int]:
        """
        Найти все подписки пользователя.

        Args:
            user_id: ID пользователя
            include_inactive: Включать ли неактивные подписки
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Кортеж (список подписок, общее количество)
        """
        pass

    @abstractmethod
    async def find_expiring_soon(self, days: int = 7) -> List[Subscription]:
        """
        Найти подписки, которые скоро истекут.

        Используется для отправки уведомлений о предстоящем истечении.

        Args:
            days: Количество дней до истечения

        Returns:
            Список подписок, которые истекут в течение указанного срока
        """
        pass

    @abstractmethod
    async def find_expired(self) -> List[Subscription]:
        """
        Найти истекшие подписки (активные, но срок истек).

        Используется для деактивации подписок.

        Returns:
            Список истекших подписок
        """
        pass

    @abstractmethod
    async def find_for_renewal(self) -> List[Subscription]:
        """
        Найти подписки для автоматического продления.

        Находит активные подписки с auto_renew=True, которые скоро истекут.

        Returns:
            Список подписок для продления
        """
        pass

    @abstractmethod
    async def count_by_plan(self, plan: SubscriptionPlanEnum) -> int:
        """
        Подсчитать количество активных подписок по плану.

        Args:
            plan: План подписки

        Returns:
            Количество активных подписок
        """
        pass

    @abstractmethod
    async def delete(self, subscription_id: UUID) -> bool:
        """
        Удалить подписку (физическое удаление).

        Args:
            subscription_id: ID подписки

        Returns:
            True если удалено, False если не найдено
        """
        pass
