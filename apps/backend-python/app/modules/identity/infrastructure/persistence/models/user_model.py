"""
User SQLAlchemy Model

ORM модель для таблицы users.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.infrastructure.database import Base


class UserModel(Base):
    """
    SQLAlchemy модель для пользователей.

    Таблица: users
    """

    __tablename__ = "users"

    # Primary Key
    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)

    # Идентификаторы
    phone: Mapped[Optional[str]] = mapped_column(String(20), unique=True, nullable=True, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)

    # Профиль
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, index=True, default="CLIENT")

    # Статусы
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    phone_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # OTP верификация
    otp_code: Mapped[Optional[str]] = mapped_column(String(6), nullable=True)
    otp_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    otp_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Логирование
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Индексы для оптимизации запросов
    __table_args__ = (
        Index("idx_users_role_active", "role", "is_active"),
        Index("idx_users_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        """Строковое представление."""
        identifier = self.phone or self.email or "unknown"
        return f"<UserModel(id={self.id}, identifier={identifier}, role={self.role})>"
