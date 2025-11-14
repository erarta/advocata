"""
Document Repository Interface

Интерфейс репозитория для работы с документами.
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID

from app.modules.document.domain.entities.document import Document
from app.modules.document.domain.value_objects.document_type import DocumentTypeEnum
from app.modules.document.domain.value_objects.document_status import DocumentStatusEnum
from app.modules.document.domain.value_objects.document_category import DocumentCategoryEnum


class IDocumentRepository(ABC):
    """
    Интерфейс репозитория документов.

    Определяет контракт для работы с хранилищем документов.
    Реализация будет в Infrastructure Layer.
    """

    @abstractmethod
    async def save(self, document: Document) -> Document:
        """
        Сохраняет документ (создание или обновление).

        Args:
            document: Документ для сохранения

        Returns:
            Сохраненный документ
        """
        pass

    @abstractmethod
    async def find_by_id(self, document_id: UUID) -> Optional[Document]:
        """
        Находит документ по ID.

        Args:
            document_id: ID документа

        Returns:
            Документ или None, если не найден
        """
        pass

    @abstractmethod
    async def find_by_owner(
        self,
        owner_id: UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[List[Document], int]:
        """
        Находит все документы владельца с пагинацией.

        Args:
            owner_id: ID владельца
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Кортеж (список документов, общее количество)
        """
        pass

    @abstractmethod
    async def find_by_consultation(
        self,
        consultation_id: UUID,
    ) -> List[Document]:
        """
        Находит все документы связанные с консультацией.

        Args:
            consultation_id: ID консультации

        Returns:
            Список документов
        """
        pass

    @abstractmethod
    async def search(
        self,
        owner_id: UUID,
        document_types: Optional[List[DocumentTypeEnum]] = None,
        categories: Optional[List[DocumentCategoryEnum]] = None,
        statuses: Optional[List[DocumentStatusEnum]] = None,
        query: Optional[str] = None,
        tags: Optional[List[str]] = None,
        consultation_id: Optional[UUID] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[List[Document], int]:
        """
        Поиск документов с фильтрами.

        Args:
            owner_id: ID владельца
            document_types: Фильтр по типам документов
            categories: Фильтр по категориям
            statuses: Фильтр по статусам
            query: Текстовый поиск по названию/описанию/тексту
            tags: Фильтр по тегам
            consultation_id: Фильтр по консультации
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Кортеж (список документов, общее количество)
        """
        pass

    @abstractmethod
    async def find_pending_processing(
        self,
        limit: int = 10,
    ) -> List[Document]:
        """
        Находит документы ожидающие обработки.

        Args:
            limit: Максимальное количество результатов

        Returns:
            Список документов в статусе UPLOADED
        """
        pass

    @abstractmethod
    async def delete(self, document_id: UUID) -> None:
        """
        Физически удаляет документ из БД.

        Args:
            document_id: ID документа для удаления
        """
        pass

    @abstractmethod
    async def count_by_owner(self, owner_id: UUID) -> int:
        """
        Подсчитывает количество документов владельца.

        Args:
            owner_id: ID владельца

        Returns:
            Количество документов
        """
        pass

    @abstractmethod
    async def count_by_status(
        self,
        owner_id: UUID,
        status: DocumentStatusEnum,
    ) -> int:
        """
        Подсчитывает документы владельца по статусу.

        Args:
            owner_id: ID владельца
            status: Статус документа

        Returns:
            Количество документов
        """
        pass
