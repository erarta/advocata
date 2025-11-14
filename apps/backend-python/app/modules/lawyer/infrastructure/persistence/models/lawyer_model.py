"""
LawyerModel

SQLAlchemy ORM модель для юристов.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.core.infrastructure.database import Base


class LawyerModel(Base):
    """
    ORM модель для юристов.

    Таблица: lawyers

    Indexes:
    - idx_lawyers_user_id: быстрый поиск по user_id
    - idx_lawyers_verification_status: фильтр по статусу
    - idx_lawyers_location: поиск по городу
    - idx_lawyers_is_available: фильтр по доступности
    - idx_lawyers_rating: сортировка по рейтингу
    - idx_lawyers_created_at: сортировка по дате
    - idx_lawyers_status_available: composite для поиска
    """

    __tablename__ = "lawyers"

    # Primary Key
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        index=True,
        comment="UUID юриста",
    )

    # Foreign Key to users table
    user_id: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        nullable=False,
        index=True,
        comment="ID пользователя из Identity Module",
    )

    # Specializations (массив строк)
    specializations: Mapped[List[str]] = mapped_column(
        ARRAY(String(100)),
        nullable=False,
        comment="Список специализаций (русские названия)",
    )

    # Experience
    experience_years: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
        comment="Опыт работы в годах",
    )

    # Price
    price_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        index=True,
        comment="Цена за консультацию (рубли)",
    )

    # Verification
    verification_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
        server_default="pending",
        comment="Статус верификации (pending, in_review, verified, rejected, suspended)",
    )

    # Rating
    rating: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(2, 1),
        nullable=True,
        index=True,
        comment="Средний рейтинг (1.0-5.0)",
    )

    reviews_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
        comment="Количество отзывов",
    )

    consultations_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
        comment="Количество проведенных консультаций",
    )

    # Credentials
    license_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Номер лицензии/свидетельства",
    )

    education: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        comment="Образование (ВУЗ, факультет)",
    )

    # Profile
    about: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Описание юриста",
    )

    location: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        comment="Город/регион",
    )

    # Availability
    is_available: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false",
        index=True,
        comment="Доступен ли для консультаций",
    )

    # Languages (массив строк)
    languages: Mapped[List[str]] = mapped_column(
        ARRAY(String(50)),
        nullable=False,
        server_default="{}",
        comment="Языки",
    )

    # Timestamps
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Дата верификации",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="Дата создания",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Дата обновления",
    )

    # Composite Indexes для оптимизации поиска
    __table_args__ = (
        # Поиск доступных верифицированных юристов
        Index(
            "idx_lawyers_status_available",
            "verification_status",
            "is_available",
        ),
        # Поиск по локации и статусу
        Index(
            "idx_lawyers_location_status",
            "location",
            "verification_status",
        ),
        # Сортировка по рейтингу (для топ юристов)
        Index(
            "idx_lawyers_rating_desc",
            rating.desc(),
        ),
        # Поиск по цене
        Index(
            "idx_lawyers_price",
            "price_amount",
        ),
    )

    def __repr__(self) -> str:
        """Строковое представление."""
        return f"<LawyerModel(id={self.id}, user_id={self.user_id}, status={self.verification_status})>"
