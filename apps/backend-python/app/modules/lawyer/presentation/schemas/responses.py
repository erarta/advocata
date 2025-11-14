"""
Response Schemas для Lawyer API

Pydantic модели для исходящих данных.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field


class LawyerResponse(BaseModel):
    """
    Полная информация о юристе.

    Используется для:
    - GET /lawyers/{id}
    - POST /lawyers (после регистрации)
    - Профиль юриста
    """

    id: str = Field(..., description="ID юриста")
    user_id: str = Field(..., description="ID пользователя")

    # Specializations & Experience
    specializations: List[str] = Field(..., description="Список специализаций")
    experience_years: int = Field(..., description="Опыт работы в годах")
    experience_level: str = Field(..., description="Уровень опыта")

    # Price
    price_amount: Decimal = Field(..., description="Цена (Decimal)")
    price_formatted: str = Field(..., description="Форматированная цена")
    price_category: str = Field(..., description="Категория цены")

    # Verification
    verification_status: str = Field(..., description="Статус верификации")
    verification_status_display: str = Field(..., description="Статус (русский)")

    # Rating
    rating: Optional[float] = Field(None, description="Средний рейтинг")
    rating_level: Optional[str] = Field(None, description="Уровень качества")
    reviews_count: int = Field(..., description="Количество отзывов")
    consultations_count: int = Field(..., description="Количество консультаций")

    # Credentials
    license_number: str = Field(..., description="Номер лицензии")
    education: str = Field(..., description="Образование")

    # Profile
    about: str = Field(..., description="Описание")
    location: str = Field(..., description="Город/регион")
    languages: List[str] = Field(..., description="Языки")

    # Status
    is_available: bool = Field(..., description="Доступен ли")
    can_accept_consultations: bool = Field(..., description="Может принимать заказы")

    # Timestamps
    verified_at: Optional[datetime] = Field(None, description="Дата верификации")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")

    class Config:
        """Pydantic config."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "660e8400-e29b-41d4-a716-446655440000",
                "specializations": ["ДТП", "Страховые споры"],
                "experience_years": 5,
                "experience_level": "Опытный",
                "price_amount": "2500.00",
                "price_formatted": "2 500 ₽",
                "price_category": "Средний",
                "verification_status": "verified",
                "verification_status_display": "Верифицирован",
                "rating": 4.7,
                "rating_level": "Отличный",
                "reviews_count": 45,
                "consultations_count": 120,
                "license_number": "АБ1234567",
                "education": "МГУ, Юридический факультет, 2015",
                "about": "Специализируюсь на автомобильных спорах...",
                "location": "Санкт-Петербург",
                "languages": ["Русский", "Английский"],
                "is_available": True,
                "can_accept_consultations": True,
                "verified_at": "2024-01-15T10:30:00Z",
                "created_at": "2024-01-10T09:00:00Z",
                "updated_at": "2024-11-14T15:00:00Z",
            }
        }


class LawyerListResponse(BaseModel):
    """
    Сокращенная информация о юристе для списков.

    Используется для:
    - GET /lawyers (поиск)
    - GET /lawyers/top-rated
    - Списки юристов
    """

    id: str = Field(..., description="ID юриста")
    specializations: List[str] = Field(..., description="Специализации")
    experience_years: int = Field(..., description="Опыт (годы)")
    experience_level: str = Field(..., description="Уровень")
    price_formatted: str = Field(..., description="Цена")
    rating: Optional[float] = Field(None, description="Рейтинг")
    reviews_count: int = Field(..., description="Отзывы")
    location: str = Field(..., description="Локация")
    is_available: bool = Field(..., description="Доступен")
    verification_status: str = Field(..., description="Статус")

    class Config:
        """Pydantic config."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "specializations": ["ДТП", "Страховые споры"],
                "experience_years": 5,
                "experience_level": "Опытный",
                "price_formatted": "2 500 ₽",
                "rating": 4.7,
                "reviews_count": 45,
                "location": "Санкт-Петербург",
                "is_available": True,
                "verification_status": "verified",
            }
        }


class LawyerSearchResponse(BaseModel):
    """
    Результаты поиска юристов с пагинацией.

    Используется для:
    - GET /lawyers (поиск с фильтрами)
    """

    lawyers: List[LawyerListResponse] = Field(..., description="Список юристов")
    total: int = Field(..., description="Общее количество")
    limit: int = Field(..., description="Лимит")
    offset: int = Field(..., description="Смещение")
    has_more: bool = Field(..., description="Есть ли еще результаты")

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {
                "lawyers": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "specializations": ["ДТП"],
                        "experience_years": 5,
                        "experience_level": "Опытный",
                        "price_formatted": "2 500 ₽",
                        "rating": 4.7,
                        "reviews_count": 45,
                        "location": "Санкт-Петербург",
                        "is_available": True,
                        "verification_status": "verified",
                    }
                ],
                "total": 156,
                "limit": 20,
                "offset": 0,
                "has_more": True,
            }
        }


class ErrorResponse(BaseModel):
    """
    Схема для ошибок API.

    Используется для всех HTTP ошибок.
    """

    detail: str = Field(..., description="Описание ошибки")

    class Config:
        """Pydantic config."""

        json_schema_extra = {
            "example": {"detail": "Lawyer not found"}
        }
