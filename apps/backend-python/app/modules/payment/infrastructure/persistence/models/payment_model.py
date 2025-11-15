"""
Payment ORM Model

SQLAlchemy модель для платежей.
"""
from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    Column,
    String,
    Text,
    Numeric,
    DateTime,
    Enum as SQLEnum,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB

from app.core.infrastructure.database import Base
from app.modules.payment.domain import (
    PaymentStatusEnum,
    PaymentMethodEnum,
    RefundReasonEnum,
)


class PaymentModel(Base):
    """
    ORM модель для платежей.
    """

    __tablename__ = "payments"

    # Primary Key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # User and Relations
    user_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    consultation_id = Column(PG_UUID(as_uuid=True), nullable=True, index=True)
    subscription_id = Column(PG_UUID(as_uuid=True), nullable=True, index=True)

    # Amount
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="RUB")

    # Status and Method
    status = Column(
        SQLEnum(PaymentStatusEnum, name="payment_status_enum"),
        nullable=False,
        default=PaymentStatusEnum.PENDING,
        index=True,
    )
    payment_method = Column(
        SQLEnum(PaymentMethodEnum, name="payment_method_enum"),
        nullable=False,
    )

    # External Payment System
    external_payment_id = Column(String(255), nullable=True, index=True)

    # Failure
    failure_reason = Column(Text, nullable=True)

    # Refund
    refund_amount = Column(Numeric(10, 2), nullable=True)
    refund_reason = Column(
        SQLEnum(RefundReasonEnum, name="refund_reason_enum", create_type=False),
        nullable=True,
    )
    refund_reason_comment = Column(Text, nullable=True)

    # Metadata
    metadata = Column(JSONB, nullable=True, default=dict)

    # Timestamps
    processed_at = Column(DateTime(timezone=True), nullable=True)
    refunded_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # Indexes
    __table_args__ = (
        Index("idx_payments_user_status", "user_id", "status"),
        Index("idx_payments_consultation", "consultation_id"),
        Index("idx_payments_subscription", "subscription_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<PaymentModel("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"amount={self.amount}, "
            f"status={self.status}"
            f")>"
        )
