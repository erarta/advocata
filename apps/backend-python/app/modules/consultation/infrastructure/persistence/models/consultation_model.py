"""
Consultation ORM Model

SQLAlchemy модель для консультаций.
"""
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Numeric,
    DateTime,
    Enum as SQLEnum,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.core.infrastructure.database import Base
from app.modules.consultation.domain import (
    ConsultationStatusEnum,
    ConsultationTypeEnum,
)


class ConsultationModel(Base):
    """
    ORM модель для консультаций.

    Хранит информацию о консультациях между клиентами и юристами.
    """

    __tablename__ = "consultations"

    # Primary Key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Participants
    client_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    lawyer_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)

    # Status and Type
    status = Column(
        SQLEnum(ConsultationStatusEnum, name="consultation_status_enum"),
        nullable=False,
        default=ConsultationStatusEnum.PENDING,
        index=True,
    )
    consultation_type = Column(
        SQLEnum(ConsultationTypeEnum, name="consultation_type_enum"),
        nullable=False,
        index=True,
    )

    # Content
    description = Column(Text, nullable=False)

    # Price
    price_amount = Column(Numeric(10, 2), nullable=False)
    price_currency = Column(String(3), nullable=False, default="RUB")

    # Scheduled Time (for scheduled consultations)
    scheduled_start = Column(DateTime(timezone=True), nullable=True, index=True)
    duration_minutes = Column(Integer, nullable=True)

    # Actual Time (for tracking)
    actual_start = Column(DateTime(timezone=True), nullable=True)
    actual_end = Column(DateTime(timezone=True), nullable=True)

    # Rating (after completion)
    rating = Column(Integer, nullable=True)
    review = Column(Text, nullable=True)

    # Cancellation
    cancellation_reason = Column(Text, nullable=True)
    cancelled_by = Column(String(20), nullable=True)  # "client" or "lawyer"
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Indexes
    __table_args__ = (
        Index("ix_consultations_client_status", "client_id", "status"),
        Index("ix_consultations_lawyer_status", "lawyer_id", "status"),
        Index(
            "ix_consultations_lawyer_scheduled",
            "lawyer_id",
            "scheduled_start",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<ConsultationModel("
            f"id={self.id}, "
            f"client_id={self.client_id}, "
            f"lawyer_id={self.lawyer_id}, "
            f"status={self.status}, "
            f"type={self.consultation_type}"
            f")>"
        )
