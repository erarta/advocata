"""
Consultation Repository Interface

Интерфейс репозитория для консультаций.
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from app.modules.consultation.domain.entities.consultation import Consultation
from app.modules.consultation.domain.value_objects.consultation_status import (
    ConsultationStatusEnum,
)


class IConsultationRepository(ABC):
    """
    Интерфейс репозитория для консультаций.

    Определяет контракт для работы с хранилищем консультаций.
    """

    @abstractmethod
    async def save(self, consultation: Consultation) -> Consultation:
        """
        Сохраняет консультацию (создание или обновление).

        Args:
            consultation: Консультация для сохранения

        Returns:
            Сохраненная консультация
        """
        pass

    @abstractmethod
    async def find_by_id(self, consultation_id: UUID) -> Optional[Consultation]:
        """
        Находит консультацию по ID.

        Args:
            consultation_id: ID консультации

        Returns:
            Consultation или None если не найдена
        """
        pass

    @abstractmethod
    async def find_by_client(
        self,
        client_id: UUID,
        status: Optional[ConsultationStatusEnum] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[List[Consultation], int]:
        """
        Находит все консультации клиента с фильтрацией и пагинацией.

        Args:
            client_id: ID клиента
            status: Фильтр по статусу (опционально)
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Кортеж (список консультаций, общее количество)
        """
        pass

    @abstractmethod
    async def find_by_lawyer(
        self,
        lawyer_id: UUID,
        status: Optional[ConsultationStatusEnum] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[List[Consultation], int]:
        """
        Находит все консультации юриста с фильтрацией и пагинацией.

        Args:
            lawyer_id: ID юриста
            status: Фильтр по статусу (опционально)
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Кортеж (список консультаций, общее количество)
        """
        pass

    @abstractmethod
    async def find_active_by_lawyer(
        self,
        lawyer_id: UUID,
    ) -> Optional[Consultation]:
        """
        Находит активную консультацию юриста (если есть).

        Юрист может вести только одну активную консультацию одновременно.

        Args:
            lawyer_id: ID юриста

        Returns:
            Активная консультация или None
        """
        pass

    @abstractmethod
    async def find_pending_by_lawyer(
        self,
        lawyer_id: UUID,
        limit: int = 10,
    ) -> List[Consultation]:
        """
        Находит pending консультации для юриста (ожидающие подтверждения).

        Args:
            lawyer_id: ID юриста
            limit: Максимальное количество результатов

        Returns:
            Список pending консультаций
        """
        pass

    @abstractmethod
    async def find_scheduled_in_timeframe(
        self,
        lawyer_id: UUID,
        start_time: datetime,
        end_time: datetime,
    ) -> List[Consultation]:
        """
        Находит запланированные консультации юриста в определенном временном диапазоне.

        Используется для проверки конфликтов расписания.

        Args:
            lawyer_id: ID юриста
            start_time: Начало диапазона
            end_time: Конец диапазона

        Returns:
            Список консультаций в указанном диапазоне
        """
        pass

    @abstractmethod
    async def count_by_lawyer(
        self,
        lawyer_id: UUID,
        status: Optional[ConsultationStatusEnum] = None,
    ) -> int:
        """
        Подсчитывает количество консультаций юриста.

        Args:
            lawyer_id: ID юриста
            status: Фильтр по статусу (опционально)

        Returns:
            Количество консультаций
        """
        pass

    @abstractmethod
    async def count_by_client(
        self,
        client_id: UUID,
        status: Optional[ConsultationStatusEnum] = None,
    ) -> int:
        """
        Подсчитывает количество консультаций клиента.

        Args:
            client_id: ID клиента
            status: Фильтр по статусу (опционально)

        Returns:
            Количество консультаций
        """
        pass

    @abstractmethod
    async def delete(self, consultation_id: UUID) -> bool:
        """
        Удаляет консультацию (физическое удаление).

        Args:
            consultation_id: ID консультации

        Returns:
            True если удалено, False если не найдено
        """
        pass
