"""
Repository Interfaces для Payment Domain
"""
from app.modules.payment.domain.repositories.payment_repository import (
    IPaymentRepository,
)
from app.modules.payment.domain.repositories.subscription_repository import (
    ISubscriptionRepository,
)

__all__ = [
    "IPaymentRepository",
    "ISubscriptionRepository",
]
