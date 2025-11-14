"""
Request Schemas для Lawyer API

Pydantic модели для валидации входящих данных.
"""

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class RegisterLawyerRequest(BaseModel):
    """
    Схема для регистрации нового юриста.

    Attributes:
        specializations: Список специализаций (мин 1, макс 5)
        experience_years: Опыт работы в годах (0-70)
        price_per_consultation: Цена за консультацию в рублях (500-100,000)
        license_number: Номер лицензии (мин 5 символов)
        education: Образование (мин 10 символов)
        about: Описание юриста (50-2000 символов)
        location: Город/регион (мин 2 символа)
        languages: Языки (опционально)
    """

    specializations: List[str] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Список специализаций (русские названия или enum names)",
        examples=[["ДТП", "Страховые споры"]],
    )

    experience_years: int = Field(
        ...,
        ge=0,
        le=70,
        description="Опыт работы в годах",
        examples=[5],
    )

    price_per_consultation: float = Field(
        ...,
        ge=500.0,
        le=100000.0,
        description="Цена за консультацию (рубли)",
        examples=[2500.0],
    )

    license_number: str = Field(
        ...,
        min_length=5,
        max_length=50,
        description="Номер лицензии/свидетельства",
        examples=["АБ1234567"],
    )

    education: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="Образование (ВУЗ, факультет)",
        examples=["МГУ, Юридический факультет, 2015"],
    )

    about: str = Field(
        ...,
        min_length=50,
        max_length=2000,
        description="Описание юриста",
        examples=[
            "Специализируюсь на автомобильных спорах более 5 лет. "
            "Успешно выиграл более 100 дел по страховым выплатам. "
            "Помогу получить максимальную компенсацию от страховой компании."
        ],
    )

    location: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Город/регион",
        examples=["Санкт-Петербург"],
    )

    languages: Optional[List[str]] = Field(
        default=None,
        description="Языки",
        examples=[["Русский", "Английский"]],
    )

    @field_validator("specializations")
    @classmethod
    def validate_specializations_not_empty(cls, v: List[str]) -> List[str]:
        """Проверка что список не пустой и без дубликатов."""
        if not v:
            raise ValueError("At least one specialization is required")
        if len(v) != len(set(v)):
            raise ValueError("Specializations must be unique")
        return v

    @field_validator("about")
    @classmethod
    def validate_about_has_sentences(cls, v: str) -> str:
        """Проверка что описание содержит минимум 3 предложения."""
        sentences = [s.strip() for s in v.split(".") if s.strip()]
        if len(sentences) < 3:
            raise ValueError("About section must contain at least 3 sentences")
        return v


class UpdateAvailabilityRequest(BaseModel):
    """
    Схема для обновления доступности юриста.

    Attributes:
        is_available: Доступен ли для консультаций
    """

    is_available: bool = Field(
        ...,
        description="Доступен ли для консультаций",
        examples=[True],
    )


class SearchLawyersRequest(BaseModel):
    """
    Схема для поиска юристов с фильтрами.

    Все поля опциональны для гибкого поиска.

    Attributes:
        specializations: Фильтр по специализациям
        min_rating: Минимальный рейтинг (1.0-5.0)
        max_price: Максимальная цена
        location: Город/регион (частичное совпадение)
        is_available: Только доступные юристы
        min_experience: Минимальный опыт (годы)
        query: Текстовый поиск
        limit: Количество результатов (1-100)
        offset: Смещение для пагинации
    """

    specializations: Optional[List[str]] = Field(
        default=None,
        description="Фильтр по специализациям",
        examples=[["ДТП", "Страховые споры"]],
    )

    min_rating: Optional[float] = Field(
        default=None,
        ge=1.0,
        le=5.0,
        description="Минимальный рейтинг",
        examples=[4.0],
    )

    max_price: Optional[float] = Field(
        default=None,
        ge=500.0,
        le=100000.0,
        description="Максимальная цена",
        examples=[5000.0],
    )

    location: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="Город/регион (частичное совпадение)",
        examples=["Санкт-Петербург"],
    )

    is_available: Optional[bool] = Field(
        default=None,
        description="Только доступные юристы",
        examples=[True],
    )

    min_experience: Optional[int] = Field(
        default=None,
        ge=0,
        le=70,
        description="Минимальный опыт (годы)",
        examples=[3],
    )

    query: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=200,
        description="Текстовый поиск (по описанию, образованию)",
        examples=["МГУ"],
    )

    limit: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Количество результатов",
        examples=[20],
    )

    offset: int = Field(
        default=0,
        ge=0,
        description="Смещение для пагинации",
        examples=[0],
    )
