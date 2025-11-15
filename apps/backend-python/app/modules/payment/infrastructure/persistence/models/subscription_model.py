"""
Subscription ORM Model

SQLAlchemy модель для подписок.
"""
from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Column,
    Boolean,
    Integer,
    DateTime,
    Enum as SQLEnum,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.core.infrastructure.database import Base
from app.modules.payment.domain import SubscriptionPlanEnum


class SubscriptionModel(Base):
    """
    ORM модель для подписок.
    """

    __tablename__ = "subscriptions"

    # Primary Key
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)

    # User
    user_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)

    # Plan
    plan = Column(
        SQLEnum(SubscriptionPlanEnum, name="subscription_plan_enum"),
        nullable=False,
        index=True,
    )

    # Status
    is_active = Column(Boolean, nullable=False, default=False)
    auto_renew = Column(Boolean, nullable=False, default=True)

    # Dates
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True, index=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    # Usage
    consultations_used = Column(Integer, nullable=False, default=0)

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
        # Только одна активная подписка на пользователя
        Index(
            "idx_subscriptions_active_user",
            "user_id",
            unique=True,
            postgresql_where=Column("is_active") == True,
        ),
        Index("idx_subscriptions_expiring", "end_date", "is_active", "auto_renew"),
    )

    def __repr__(self) -> str:
        return (
            f"<SubscriptionModel("
            f"id={self.id}, "
            f"user_id={self.user_id}, "
            f"plan={self.plan}, "
            f"is_active={self.is_active}"
            f")>"
        )
