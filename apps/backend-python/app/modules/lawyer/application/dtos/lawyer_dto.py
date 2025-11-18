"""
Lawyer DTOs

Data Transfer Objects для юристов.
"""

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import List, Optional


@dataclass
class LawyerDTO:
    """
    DTO для полной информации о юристе.

    Используется для передачи данных юриста между слоями.
    Содержит всю информацию о юристе.

    Attributes:
        id: ID юриста
        user_id: ID пользователя из Identity Module
        specializations: Список специализаций (русские названия)
        experience_years: Опыт работы в годах
        experience_level: Уровень опыта (Начинающий, Опытный и т.д.)
        price_amount: Цена за консультацию (Decimal)
        price_formatted: Отформатированная цена с валютой
        price_category: Категория цены (Бюджетный, Средний и т.д.)
        verification_status: Статус верификации
        verification_status_display: Русское название статуса
        rating: Средний рейтинг (или None)
        rating_level: Уровень качества (Отличный, Хороший и т.д.)
        reviews_count: Количество отзывов
        consultations_count: Количество консультаций
        license_number: Номер лицензии
        education: Образование
        about: Описание
        location: Город/регион
        is_available: Доступен ли для консультаций
        can_accept_consultations: Может ли принимать консультации
        languages: Языки
        verified_at: Дата верификации
        created_at: Дата создания
        updated_at: Дата обновления
    """

    id: str
    user_id: str
    specializations: List[str]
    experience_years: int
    experience_level: str
    price_amount: Decimal
    price_formatted: str
    price_category: str
    verification_status: str
    verification_status_display: str
    rating: Optional[float]
    rating_level: Optional[str]
    reviews_count: int
    consultations_count: int
    license_number: str
    education: str
    about: str
    location: str
    is_available: bool
    can_accept_consultations: bool
    languages: List[str]
    verified_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, lawyer) -> "LawyerDTO":
        """
        Создает DTO из Lawyer entity.

        Args:
            lawyer: Lawyer entity

        Returns:
            LawyerDTO
        """
        return cls(
            id=lawyer.id,
            user_id=lawyer.user_id,
            specializations=[spec.display_name for spec in lawyer.specializations],
            experience_years=lawyer.experience.years,
            experience_level=lawyer.experience.level,
            price_amount=lawyer.price_per_consultation.amount,
            price_formatted=lawyer.price_per_consultation.formatted,
            price_category=lawyer.price_per_consultation.category,
            verification_status=lawyer.verification_status.value.value,
            verification_status_display=lawyer.verification_status.display_name,
            rating=lawyer.rating.value if lawyer.rating else None,
            rating_level=lawyer.rating.quality_level if lawyer.rating else None,
            reviews_count=lawyer.reviews_count,
            consultations_count=lawyer.consultations_count,
            license_number=lawyer.license_number,
            education=lawyer.education,
            about=lawyer.about,
            location=lawyer.location,
            is_available=lawyer.is_available,
            can_accept_consultations=lawyer.can_accept_consultations,
            languages=lawyer.languages,
            verified_at=lawyer.verified_at,
            created_at=lawyer.created_at,
            updated_at=lawyer.updated_at,
        )


@dataclass
class LawyerListItemDTO:
    """
    DTO для элемента списка юристов (сокращенная версия).

    Используется в списках и поиске для оптимизации.
    Содержит только ключевую информацию.

    Attributes:
        id: ID юриста
        specializations: Список специализаций
        experience_years: Опыт работы в годах
        experience_level: Уровень опыта
        price_formatted: Отформатированная цена
        rating: Средний рейтинг
        reviews_count: Количество отзывов
        location: Город/регион
        is_available: Доступен ли
        verification_status: Статус верификации
    """

    id: str
    specializations: List[str]
    experience_years: int
    experience_level: str
    price_formatted: str
    rating: Optional[float]
    reviews_count: int
    location: str
    is_available: bool
    verification_status: str

    @classmethod
    def from_entity(cls, lawyer) -> "LawyerListItemDTO":
        """
        Создает DTO из Lawyer entity.

        Args:
            lawyer: Lawyer entity

        Returns:
            LawyerListItemDTO
        """
        return cls(
            id=lawyer.id,
            specializations=[spec.display_name for spec in lawyer.specializations],
            experience_years=lawyer.experience.years,
            experience_level=lawyer.experience.level,
            price_formatted=lawyer.price_per_consultation.formatted,
            rating=lawyer.rating.value if lawyer.rating else None,
            reviews_count=lawyer.reviews_count,
            location=lawyer.location,
            is_available=lawyer.is_available,
            verification_status=lawyer.verification_status.value.value,
        )


@dataclass
class LawyerSearchResultDTO:
    """
    DTO для результатов поиска юристов.

    Содержит список юристов и метаданные для пагинации.

    Attributes:
        lawyers: Список юристов (сокращенная версия)
        total: Общее количество результатов
        limit: Лимит результатов на странице
        offset: Смещение
        has_more: Есть ли еще результаты
    """

    lawyers: List[LawyerListItemDTO]
    total: int
    limit: int
    offset: int
    has_more: bool

    @classmethod
    def create(
        cls,
        lawyers: List,
        total: int,
        limit: int,
        offset: int,
    ) -> "LawyerSearchResultDTO":
        """
        Создает DTO результатов поиска.

        Args:
            lawyers: Список Lawyer entities
            total: Общее количество
            limit: Лимит
            offset: Смещение

        Returns:
            LawyerSearchResultDTO
        """
        lawyer_dtos = [LawyerListItemDTO.from_entity(lawyer) for lawyer in lawyers]
        has_more = (offset + len(lawyers)) < total

        return cls(
            lawyers=lawyer_dtos,
            total=total,
            limit=limit,
            offset=offset,
            has_more=has_more,
        )
