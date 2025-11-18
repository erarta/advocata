"""
Consultation Repository Implementation

Реализация репозитория консультаций с использованием SQLAlchemy.
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.consultation.domain import (
    Consultation,
    ConsultationStatusEnum,
    IConsultationRepository,
)
from app.modules.consultation.infrastructure.persistence.models import ConsultationModel
from app.modules.consultation.infrastructure.persistence.mappers import (
    ConsultationMapper,
)


class ConsultationRepositoryImpl(IConsultationRepository):
    """
    Реализация репозитория консультаций.

    Использует SQLAlchemy для работы с PostgreSQL.
    """

    def __init__(self, session: AsyncSession):
        self._session = session
        self._mapper = ConsultationMapper()

    async def save(self, consultation: Consultation) -> Consultation:
        """
        Сохраняет консультацию (создание или обновление).

        Args:
            consultation: Консультация для сохранения

        Returns:
            Сохраненная консультация
        """
        # Проверяем, существует ли консультация в БД
        stmt = select(ConsultationModel).where(ConsultationModel.id == consultation.id)
        result = await self._session.execute(stmt)
        existing_model = result.scalar_one_or_none()

        if existing_model:
            # Обновляем существующую модель
            self._mapper.update_model(consultation, existing_model)
        else:
            # Создаем новую модель
            new_model = self._mapper.to_model(consultation)
            self._session.add(new_model)

        await self._session.flush()

        # Получаем обновленную модель из БД
        stmt = select(ConsultationModel).where(ConsultationModel.id == consultation.id)
        result = await self._session.execute(stmt)
        saved_model = result.scalar_one()

        return self._mapper.to_domain(saved_model)

    async def find_by_id(self, consultation_id: UUID) -> Optional[Consultation]:
        """
        Находит консультацию по ID.

        Args:
            consultation_id: ID консультации

        Returns:
            Consultation или None если не найдена
        """
        stmt = select(ConsultationModel).where(ConsultationModel.id == consultation_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            return None

        return self._mapper.to_domain(model)

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
        # Базовый WHERE
        conditions = [ConsultationModel.client_id == client_id]
        if status:
            conditions.append(ConsultationModel.status == status)

        # Запрос для подсчета
        count_stmt = select(func.count()).where(and_(*conditions))
        count_result = await self._session.execute(count_stmt)
        total = count_result.scalar_one()

        # Запрос для данных
        stmt = (
            select(ConsultationModel)
            .where(and_(*conditions))
            .order_by(ConsultationModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()

        consultations = [self._mapper.to_domain(model) for model in models]

        return consultations, total

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
        # Базовый WHERE
        conditions = [ConsultationModel.lawyer_id == lawyer_id]
        if status:
            conditions.append(ConsultationModel.status == status)

        # Запрос для подсчета
        count_stmt = select(func.count()).where(and_(*conditions))
        count_result = await self._session.execute(count_stmt)
        total = count_result.scalar_one()

        # Запрос для данных
        stmt = (
            select(ConsultationModel)
            .where(and_(*conditions))
            .order_by(ConsultationModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()

        consultations = [self._mapper.to_domain(model) for model in models]

        return consultations, total

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
        stmt = select(ConsultationModel).where(
            and_(
                ConsultationModel.lawyer_id == lawyer_id,
                ConsultationModel.status == ConsultationStatusEnum.ACTIVE,
            )
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            return None

        return self._mapper.to_domain(model)

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
        stmt = (
            select(ConsultationModel)
            .where(
                and_(
                    ConsultationModel.lawyer_id == lawyer_id,
                    ConsultationModel.status == ConsultationStatusEnum.PENDING,
                )
            )
            .order_by(ConsultationModel.created_at.asc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()

        return [self._mapper.to_domain(model) for model in models]

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
        # Консультация конфликтует если:
        # (scheduled_start < end_time) AND (scheduled_start + duration > start_time)
        # Упрощенно: ищем консультации, которые начинаются в диапазоне или пересекаются
        stmt = select(ConsultationModel).where(
            and_(
                ConsultationModel.lawyer_id == lawyer_id,
                ConsultationModel.scheduled_start.isnot(None),
                or_(
                    ConsultationModel.status == ConsultationStatusEnum.PENDING,
                    ConsultationModel.status == ConsultationStatusEnum.CONFIRMED,
                    ConsultationModel.status == ConsultationStatusEnum.ACTIVE,
                ),
                # Проверка пересечения временных интервалов
                ConsultationModel.scheduled_start < end_time,
                # Для полной проверки нужно бы использовать scheduled_start + duration,
                # но SQLAlchemy не поддерживает прямое сложение datetime + interval из колонки
                # Поэтому делаем упрощенную проверку
            )
        )
        result = await self._session.execute(stmt)
        models = result.scalars().all()

        # Дополнительная фильтрация в Python для точной проверки пересечения
        consultations = []
        for model in models:
            domain = self._mapper.to_domain(model)
            if domain.time_slot:
                # Проверяем точное пересечение
                if domain.time_slot.start_time < end_time and domain.time_slot.end_time > start_time:
                    consultations.append(domain)

        return consultations

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
        conditions = [ConsultationModel.lawyer_id == lawyer_id]
        if status:
            conditions.append(ConsultationModel.status == status)

        stmt = select(func.count()).where(and_(*conditions))
        result = await self._session.execute(stmt)
        return result.scalar_one()

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
        conditions = [ConsultationModel.client_id == client_id]
        if status:
            conditions.append(ConsultationModel.status == status)

        stmt = select(func.count()).where(and_(*conditions))
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def delete(self, consultation_id: UUID) -> bool:
        """
        Удаляет консультацию (физическое удаление).

        Args:
            consultation_id: ID консультации

        Returns:
            True если удалено, False если не найдено
        """
        stmt = select(ConsultationModel).where(ConsultationModel.id == consultation_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        if not model:
            return False

        await self._session.delete(model)
        await self._session.flush()

        return True
