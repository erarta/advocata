"""
Document Repository Implementation

Реализация репозитория документов с использованием SQLAlchemy.
"""
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select, func, or_, and_, delete as sql_delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.document.domain.entities.document import Document
from app.modules.document.domain.repositories.document_repository import (
    IDocumentRepository,
)
from app.modules.document.domain.value_objects.document_type import DocumentTypeEnum
from app.modules.document.domain.value_objects.document_status import DocumentStatusEnum
from app.modules.document.domain.value_objects.document_category import DocumentCategoryEnum
from app.modules.document.infrastructure.persistence.models.document_model import (
    DocumentModel,
)
from app.modules.document.infrastructure.persistence.mappers.document_mapper import (
    DocumentMapper,
)


class DocumentRepositoryImpl(IDocumentRepository):
    """
    Реализация репозитория документов с использованием SQLAlchemy.

    Implements:
    - Сохранение и обновление документов
    - Поиск по различным критериям
    - Пагинация результатов
    - Подсчет статистики
    """

    def __init__(self, session: AsyncSession):
        """
        Инициализирует репозиторий.

        Args:
            session: Async SQLAlchemy сессия
        """
        self.session = session

    async def save(self, document: Document) -> Document:
        """
        Сохраняет документ (создание или обновление).

        Args:
            document: Документ для сохранения

        Returns:
            Сохраненный документ
        """
        # Проверяем, существует ли документ
        existing = await self.session.get(DocumentModel, str(document.id))

        if existing:
            # Обновляем существующий
            updated_model = DocumentMapper.update_model(existing, document)
            self.session.add(updated_model)
        else:
            # Создаем новый
            model = DocumentMapper.to_model(document)
            self.session.add(model)

        await self.session.flush()
        await self.session.refresh(existing if existing else model)

        # Возвращаем обновленную доменную сущность
        saved_model = existing if existing else model
        return DocumentMapper.to_domain(saved_model)

    async def find_by_id(self, document_id: UUID) -> Optional[Document]:
        """
        Находит документ по ID.

        Args:
            document_id: ID документа

        Returns:
            Документ или None
        """
        model = await self.session.get(DocumentModel, str(document_id))

        if model is None:
            return None

        return DocumentMapper.to_domain(model)

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
        # Запрос для подсчета
        count_stmt = select(func.count()).select_from(DocumentModel).where(
            DocumentModel.owner_id == str(owner_id)
        )
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        # Запрос для данных
        stmt = (
            select(DocumentModel)
            .where(DocumentModel.owner_id == str(owner_id))
            .order_by(DocumentModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(stmt)
        models = result.scalars().all()

        documents = [DocumentMapper.to_domain(model) for model in models]

        return documents, total

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
        stmt = (
            select(DocumentModel)
            .where(DocumentModel.consultation_id == str(consultation_id))
            .order_by(DocumentModel.created_at.desc())
        )

        result = await self.session.execute(stmt)
        models = result.scalars().all()

        return [DocumentMapper.to_domain(model) for model in models]

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
            query: Текстовый поиск
            tags: Фильтр по тегам
            consultation_id: Фильтр по консультации
            limit: Максимальное количество результатов
            offset: Смещение для пагинации

        Returns:
            Кортеж (список документов, общее количество)
        """
        # Базовые условия
        conditions = [DocumentModel.owner_id == str(owner_id)]

        # Фильтр по типам документов (OR)
        if document_types:
            type_conditions = [
                DocumentModel.document_type == dt.value for dt in document_types
            ]
            conditions.append(or_(*type_conditions))

        # Фильтр по категориям (OR)
        if categories:
            category_conditions = [
                DocumentModel.category == cat.value for cat in categories
            ]
            conditions.append(or_(*category_conditions))

        # Фильтр по статусам (OR)
        if statuses:
            status_conditions = [
                DocumentModel.status == status.value for status in statuses
            ]
            conditions.append(or_(*status_conditions))

        # Фильтр по консультации
        if consultation_id:
            conditions.append(DocumentModel.consultation_id == str(consultation_id))

        # Текстовый поиск по title, description, extracted_text
        if query:
            search_pattern = f"%{query}%"
            search_conditions = [
                DocumentModel.title.ilike(search_pattern),
                DocumentModel.description.ilike(search_pattern),
                DocumentModel.extracted_text.ilike(search_pattern),
            ]
            conditions.append(or_(*search_conditions))

        # Фильтр по тегам (документ должен содержать хотя бы один из тегов)
        if tags:
            tag_conditions = [DocumentModel.tags.any(tag) for tag in tags]
            conditions.append(or_(*tag_conditions))

        # Запрос для подсчета
        count_stmt = select(func.count()).select_from(DocumentModel).where(
            and_(*conditions)
        )
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        # Запрос для данных
        stmt = (
            select(DocumentModel)
            .where(and_(*conditions))
            .order_by(DocumentModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(stmt)
        models = result.scalars().all()

        documents = [DocumentMapper.to_domain(model) for model in models]

        return documents, total

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
        stmt = (
            select(DocumentModel)
            .where(DocumentModel.status == DocumentStatusEnum.UPLOADED.value)
            .order_by(DocumentModel.created_at.asc())
            .limit(limit)
        )

        result = await self.session.execute(stmt)
        models = result.scalars().all()

        return [DocumentMapper.to_domain(model) for model in models]

    async def delete(self, document_id: UUID) -> None:
        """
        Физически удаляет документ из БД.

        Args:
            document_id: ID документа для удаления
        """
        stmt = sql_delete(DocumentModel).where(DocumentModel.id == str(document_id))
        await self.session.execute(stmt)
        await self.session.flush()

    async def count_by_owner(self, owner_id: UUID) -> int:
        """
        Подсчитывает количество документов владельца.

        Args:
            owner_id: ID владельца

        Returns:
            Количество документов
        """
        stmt = select(func.count()).select_from(DocumentModel).where(
            DocumentModel.owner_id == str(owner_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one()

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
        stmt = (
            select(func.count())
            .select_from(DocumentModel)
            .where(
                and_(
                    DocumentModel.owner_id == str(owner_id),
                    DocumentModel.status == status.value,
                )
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one()
