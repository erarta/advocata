"""
LawyerRepositoryImpl

Реализация ILawyerRepository с использованием SQLAlchemy.
"""

from typing import List, Optional

from sqlalchemy import and_, delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ....domain.entities.lawyer import Lawyer
from ....domain.repositories.lawyer_repository import ILawyerRepository
from ....domain.value_objects.specialization import SpecializationType
from ....domain.value_objects.verification_status import VerificationStatusType
from ..mappers.lawyer_mapper import LawyerMapper
from ..models.lawyer_model import LawyerModel


class LawyerRepositoryImpl(ILawyerRepository):
    """
    SQLAlchemy реализация репозитория юристов.

    Использует LawyerMapper для конвертации между domain и ORM.
    Поддерживает сложные запросы с фильтрами и full-text search.

    Args:
        session: SQLAlchemy async session
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Инициализирует репозиторий.

        Args:
            session: Async database session
        """
        self._session = session

    async def save(self, lawyer: Lawyer) -> None:
        """
        Сохраняет юриста (create или update).

        Args:
            lawyer: Lawyer entity
        """
        # Проверяем, существует ли юрист
        result = await self._session.execute(
            select(LawyerModel).where(LawyerModel.id == lawyer.id)
        )
        existing_model = result.scalar_one_or_none()

        if existing_model:
            # Update существующего
            LawyerMapper.update_model_from_entity(existing_model, lawyer)
        else:
            # Create нового
            lawyer_model = LawyerMapper.to_model(lawyer)
            self._session.add(lawyer_model)

        # Flush для получения ID (если нужно)
        await self._session.flush()

    async def find_by_id(self, lawyer_id: str) -> Optional[Lawyer]:
        """
        Находит юриста по ID.

        Args:
            lawyer_id: ID юриста

        Returns:
            Lawyer entity или None
        """
        result = await self._session.execute(
            select(LawyerModel).where(LawyerModel.id == lawyer_id)
        )
        lawyer_model = result.scalar_one_or_none()

        if not lawyer_model:
            return None

        return LawyerMapper.to_domain(lawyer_model)

    async def find_by_user_id(self, user_id: str) -> Optional[Lawyer]:
        """
        Находит юриста по user_id.

        Args:
            user_id: ID пользователя

        Returns:
            Lawyer entity или None
        """
        result = await self._session.execute(
            select(LawyerModel).where(LawyerModel.user_id == user_id)
        )
        lawyer_model = result.scalar_one_or_none()

        if not lawyer_model:
            return None

        return LawyerMapper.to_domain(lawyer_model)

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
            limit: Максимальное количество
            offset: Смещение

        Returns:
            Список Lawyer entities
        """
        result = await self._session.execute(
            select(LawyerModel)
            .where(LawyerModel.verification_status == status.value)
            .order_by(LawyerModel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        lawyer_models = result.scalars().all()

        return [LawyerMapper.to_domain(model) for model in lawyer_models]

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
        Поиск юристов с множественными фильтрами.

        Args:
            specializations: Фильтр по специализациям
            min_rating: Минимальный рейтинг
            max_price: Максимальная цена
            location: Город/регион
            is_available: Доступность
            min_experience: Минимальный опыт
            query: Текстовый поиск
            limit: Лимит
            offset: Смещение

        Returns:
            Tuple (список Lawyer entities, общее количество)
        """
        # Базовый запрос - только верифицированные юристы
        conditions = [LawyerModel.verification_status == "verified"]

        # Фильтр по специализациям (OR)
        if specializations:
            spec_names = [spec.value for spec in specializations]
            # Проверяем, что хотя бы одна специализация совпадает
            spec_conditions = []
            for spec_name in spec_names:
                spec_conditions.append(
                    LawyerModel.specializations.any(spec_name)
                )
            if spec_conditions:
                conditions.append(or_(*spec_conditions))

        # Фильтр по рейтингу
        if min_rating is not None:
            conditions.append(LawyerModel.rating >= min_rating)

        # Фильтр по цене
        if max_price is not None:
            conditions.append(LawyerModel.price_amount <= max_price)

        # Фильтр по локации (частичное совпадение, case-insensitive)
        if location:
            conditions.append(LawyerModel.location.ilike(f"%{location}%"))

        # Фильтр по доступности
        if is_available is not None:
            conditions.append(LawyerModel.is_available == is_available)

        # Фильтр по опыту
        if min_experience is not None:
            conditions.append(LawyerModel.experience_years >= min_experience)

        # Текстовый поиск (по about, education)
        if query:
            search_pattern = f"%{query}%"
            conditions.append(
                or_(
                    LawyerModel.about.ilike(search_pattern),
                    LawyerModel.education.ilike(search_pattern),
                )
            )

        # Применяем все условия
        where_clause = and_(*conditions)

        # Запрос для подсчета общего количества
        count_query = select(func.count()).select_from(LawyerModel).where(where_clause)
        count_result = await self._session.execute(count_query)
        total = count_result.scalar_one()

        # Запрос для получения данных с сортировкой
        # Сортировка: сначала по рейтингу (DESC), потом по дате (DESC)
        data_query = (
            select(LawyerModel)
            .where(where_clause)
            .order_by(
                LawyerModel.rating.desc().nulls_last(),
                LawyerModel.created_at.desc(),
            )
            .limit(limit)
            .offset(offset)
        )

        data_result = await self._session.execute(data_query)
        lawyer_models = data_result.scalars().all()

        lawyers = [LawyerMapper.to_domain(model) for model in lawyer_models]

        return lawyers, total

    async def exists_by_user_id(self, user_id: str) -> bool:
        """
        Проверяет существование юриста по user_id.

        Args:
            user_id: ID пользователя

        Returns:
            True если существует
        """
        result = await self._session.execute(
            select(func.count())
            .select_from(LawyerModel)
            .where(LawyerModel.user_id == user_id)
        )
        count = result.scalar_one()
        return count > 0

    async def delete(self, lawyer_id: str) -> None:
        """
        Удаляет юриста.

        Args:
            lawyer_id: ID юриста
        """
        await self._session.execute(
            delete(LawyerModel).where(LawyerModel.id == lawyer_id)
        )
        await self._session.flush()

    async def get_top_rated(
        self,
        specialization: Optional[SpecializationType] = None,
        location: Optional[str] = None,
        limit: int = 10,
    ) -> List[Lawyer]:
        """
        Получает топ юристов по рейтингу.

        Args:
            specialization: Фильтр по специализации
            location: Фильтр по локации
            limit: Количество

        Returns:
            Список Lawyer entities (sorted by rating DESC)
        """
        conditions = [
            LawyerModel.verification_status == "verified",
            LawyerModel.rating.isnot(None),
            LawyerModel.is_available == True,
        ]

        # Фильтр по специализации
        if specialization:
            conditions.append(
                LawyerModel.specializations.any(specialization.value)
            )

        # Фильтр по локации
        if location:
            conditions.append(LawyerModel.location.ilike(f"%{location}%"))

        where_clause = and_(*conditions)

        # Запрос с сортировкой по рейтингу
        query = (
            select(LawyerModel)
            .where(where_clause)
            .order_by(
                LawyerModel.rating.desc(),
                LawyerModel.reviews_count.desc(),
            )
            .limit(limit)
        )

        result = await self._session.execute(query)
        lawyer_models = result.scalars().all()

        return [LawyerMapper.to_domain(model) for model in lawyer_models]

    async def count_by_status(self, status: VerificationStatusType) -> int:
        """
        Подсчитывает количество юристов по статусу.

        Args:
            status: Статус верификации

        Returns:
            Количество юристов
        """
        result = await self._session.execute(
            select(func.count())
            .select_from(LawyerModel)
            .where(LawyerModel.verification_status == status.value)
        )
        count = result.scalar_one()
        return count

    async def get_all_pending(self, limit: int = 100) -> List[Lawyer]:
        """
        Получает всех юристов в статусе PENDING.

        Args:
            limit: Максимальное количество

        Returns:
            Список Lawyer entities
        """
        result = await self._session.execute(
            select(LawyerModel)
            .where(LawyerModel.verification_status == "pending")
            .order_by(LawyerModel.created_at.asc())
            .limit(limit)
        )
        lawyer_models = result.scalars().all()

        return [LawyerMapper.to_domain(model) for model in lawyer_models]
