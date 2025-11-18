"""
ILawyerRepository Interface

Абстрактный интерфейс для работы с хранилищем юристов.
"""

from abc import ABC, abstractmethod
from typing import List, Optional

from ..entities.lawyer import Lawyer
from ..value_objects.specialization import SpecializationType
from ..value_objects.verification_status import VerificationStatusType


class ILawyerRepository(ABC):
    """
    Repository interface для Lawyer aggregate.

    Определяет контракт для работы с хранилищем юристов.
    Реализация находится в Infrastructure Layer.

    Methods:
        save: Сохранить юриста
        find_by_id: Найти по ID
        find_by_user_id: Найти по user_id
        find_by_status: Найти по статусу верификации
        search: Поиск юристов с фильтрами
        exists_by_user_id: Проверить существование по user_id
        delete: Удалить юриста
        get_top_rated: Получить топ юристов по рейтингу
        count_by_status: Подсчитать количество по статусу
    """

    @abstractmethod
    async def save(self, lawyer: Lawyer) -> None:
        """
        Сохраняет юриста (create или update).

        Args:
            lawyer: Lawyer entity для сохранения
        """
        pass

    @abstractmethod
    async def find_by_id(self, lawyer_id: str) -> Optional[Lawyer]:
        """
        Находит юриста по ID.

        Args:
            lawyer_id: ID юриста

        Returns:
            Lawyer entity или None
        """
        pass

    @abstractmethod
    async def find_by_user_id(self, user_id: str) -> Optional[Lawyer]:
        """
        Находит юриста по user_id.

        Args:
            user_id: ID пользователя из Identity Module

        Returns:
            Lawyer entity или None
        """
        pass

    @abstractmethod
    async def find_by_status(
        self,
        status: VerificationStatusType,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Lawyer]:
        """
        Находит юристов по статусу верификации.

        Args:
            status: Статус верификации
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Список Lawyer entities
        """
        pass

    @abstractmethod
    async def search(
        self,
        specializations: Optional[List[SpecializationType]] = None,
        min_rating: Optional[float] = None,
        max_price: Optional[float] = None,
        location: Optional[str] = None,
        is_available: Optional[bool] = None,
        min_experience: Optional[int] = None,
        query: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[List[Lawyer], int]:
        """
        Поиск юристов с фильтрами.

        Args:
            specializations: Фильтр по специализациям
            min_rating: Минимальный рейтинг
            max_price: Максимальная цена
            location: Город/регион
            is_available: Доступность
            min_experience: Минимальный опыт (годы)
            query: Текстовый поиск (по имени, описанию)
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Tuple (список Lawyer entities, общее количество)
        """
        pass

    @abstractmethod
    async def exists_by_user_id(self, user_id: str) -> bool:
        """
        Проверяет существование юриста по user_id.

        Args:
            user_id: ID пользователя

        Returns:
            True если существует, False иначе
        """
        pass

    @abstractmethod
    async def delete(self, lawyer_id: str) -> None:
        """
        Удаляет юриста.

        Args:
            lawyer_id: ID юриста для удаления
        """
        pass

    @abstractmethod
    async def get_top_rated(
        self,
        specialization: Optional[SpecializationType] = None,
        location: Optional[str] = None,
        limit: int = 10,
    ) -> List[Lawyer]:
        """
        Получает топ юристов по рейтингу.

        Args:
            specialization: Фильтр по специализации (опционально)
            location: Фильтр по локации (опционально)
            limit: Количество результатов

        Returns:
            Список Lawyer entities (sorted by rating DESC)
        """
        pass

    @abstractmethod
    async def count_by_status(self, status: VerificationStatusType) -> int:
        """
        Подсчитывает количество юристов по статусу.

        Args:
            status: Статус верификации

        Returns:
            Количество юристов
        """
        pass

    @abstractmethod
    async def get_all_pending(self, limit: int = 100) -> List[Lawyer]:
        """
        Получает всех юристов в статусе PENDING (для админ панели).

        Args:
            limit: Максимальное количество

        Returns:
            Список Lawyer entities
        """
        pass
