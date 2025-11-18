"""
Document ORM Model

SQLAlchemy модель для документов.
"""
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

from sqlalchemy import String, Integer, Text, Boolean, DateTime, Numeric, ARRAY
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.infrastructure.database import Base


class DocumentModel(Base):
    """
    ORM модель для таблицы documents.

    Хранит информацию о юридических документах пользователей.
    """

    __tablename__ = "documents"

    # Primary Key
    id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # Ownership
    owner_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)

    # Document Metadata
    document_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # File Metadata
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_extension: Mapped[str] = mapped_column(String(20), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)

    # Status
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="uploaded", index=True
    )

    # Relations
    consultation_id: Mapped[Optional[str]] = mapped_column(
        String(36), nullable=True, index=True
    )

    # Processing
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    processing_error: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Tags (PostgreSQL ARRAY)
    tags: Mapped[List[str]] = mapped_column(
        ARRAY(String(50)), nullable=False, default=list, server_default="{}"
    )

    # Timestamps
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    processed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    # Indexes для оптимизации запросов
    __table_args__ = (
        # Composite indexes
        {
            "comment": "Юридические документы пользователей"
        },
    )

    def __repr__(self) -> str:
        """Строковое представление для отладки"""
        return f"<DocumentModel(id={self.id}, title={self.title}, status={self.status})>"
