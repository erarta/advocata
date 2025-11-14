"""
Request Schemas

Pydantic схемы для валидации входящих запросов API.
"""
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class UploadDocumentRequest(BaseModel):
    """
    Схема запроса для загрузки документа.

    Note: Файл передается отдельно через multipart/form-data.
    Остальные поля - это metadata.
    """

    document_type: str = Field(
        ...,
        description="Тип документа (contract, court_decision, claim, etc.)",
        examples=["contract"],
    )
    category: str = Field(
        ...,
        description="Категория документа (auto_accidents, criminal, civil, etc.)",
        examples=["auto_accidents"],
    )
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Название документа",
        examples=["Договор купли-продажи автомобиля"],
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Описание документа",
        examples=["Договор о покупке автомобиля Honda Civic 2020 года"],
    )
    consultation_id: Optional[str] = Field(
        None,
        description="ID консультации (если документ относится к консультации)",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )
    tags: Optional[List[str]] = Field(
        None,
        max_length=20,
        description="Теги для поиска",
        examples=[["ДТП", "договор", "автомобиль"]],
    )

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: str) -> str:
        """Валидация названия"""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip()

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Валидация тегов"""
        if v is None:
            return v

        if len(v) > 20:
            raise ValueError("Maximum 20 tags allowed")

        # Проверяем каждый тег
        for tag in v:
            if not tag or not tag.strip():
                raise ValueError("Tag cannot be empty")
            if len(tag) > 50:
                raise ValueError(f"Tag too long: '{tag}'. Maximum 50 characters")

        # Проверяем на дубликаты
        if len(v) != len(set(v)):
            raise ValueError("Tags must be unique")

        return v


class UpdateDocumentMetadataRequest(BaseModel):
    """
    Схема запроса для обновления метаданных документа.
    """

    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Новое название документа",
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Новое описание документа",
    )
    tags: Optional[List[str]] = Field(
        None,
        max_length=20,
        description="Новые теги",
    )

    @field_validator("title")
    @classmethod
    def validate_title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        """Валидация названия"""
        if v is not None and (not v or not v.strip()):
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip() if v else v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Валидация тегов"""
        if v is None:
            return v

        if len(v) > 20:
            raise ValueError("Maximum 20 tags allowed")

        for tag in v:
            if not tag or not tag.strip():
                raise ValueError("Tag cannot be empty")
            if len(tag) > 50:
                raise ValueError(f"Tag too long: '{tag}'. Maximum 50 characters")

        if len(v) != len(set(v)):
            raise ValueError("Tags must be unique")

        return v
