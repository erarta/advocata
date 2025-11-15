"""
Payment Repository Interface

Интерфейс репозитория для платежей.
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.modules.payment.domain.entities import Payment
from app.modules.payment.domain.value_objects import PaymentStatusEnum


class IPaymentRepository(ABC):
    """
    Интерфейс репозитория для Payment Aggregate.

    Определяет контракт для работы с платежами.
    """

    @abstractmethod
    async def save(self, payment: Payment) -> Payment:
        """
        Сохранить платеж (создание или обновление).

        Args:
            payment: Платеж для сохранения

        Returns:
            Сохраненный платеж
        """
        pass

    @abstractmethod
    async def find_by_id(self, payment_id: UUID) -> Optional[Payment]:
        """
        Найти платеж по ID.

        Args:
            payment_id: ID платежа

        Returns:
            Payment или None если не найден
        """
        pass

    @abstractmethod
    async def find_by_external_id(
        self, external_payment_id: str
    ) -> Optional[Payment]:
        """
        Найти платеж по внешнему ID (от платежной системы).

        Args:
            external_payment_id: ID в платежной системе

        Returns:
            Payment или None если не найден
        """
        pass

    @abstractmethod
    async def find_by_user(
        self,
        user_id: UUID,
        status: Optional[PaymentStatusEnum] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[List[Payment], int]:
        """
        Найти платежи пользователя с фильтрацией и пагинацией.

        Args:
            user_id: ID пользователя
            status: Фильтр по статусу (опционально)
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Кортеж (список платежей, общее количество)
        """
        pass

    @abstractmethod
    async def find_by_consultation(
        self, consultation_id: UUID
    ) -> Optional[Payment]:
        """
        Найти платеж за консультацию.

        Args:
            consultation_id: ID консультации

        Returns:
            Payment или None если не найден
        """
        pass

    @abstractmethod
    async def find_by_subscription(
        self, subscription_id: UUID
    ) -> List[Payment]:
        """
        Найти все платежи за подписку.

        Args:
            subscription_id: ID подписки

        Returns:
            Список платежей
        """
        pass

    @abstractmethod
    async def count_by_user(
        self,
        user_id: UUID,
        status: Optional[PaymentStatusEnum] = None,
    ) -> int:
        """
        Подсчитать количество платежей пользователя.

        Args:
            user_id: ID пользователя
            status: Фильтр по статусу (опционально)

        Returns:
            Количество платежей
        """
        pass

    @abstractmethod
    async def delete(self, payment_id: UUID) -> bool:
        """
        Удалить платеж (физическое удаление).

        Args:
            payment_id: ID платежа

        Returns:
            True если удалено, False если не найдено
        """
        pass
