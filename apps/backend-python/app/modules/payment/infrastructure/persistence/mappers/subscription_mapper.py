"""
Subscription Mapper

Mapper для конвертации между Subscription Entity и SubscriptionModel.
"""
from app.modules.payment.domain import Subscription, SubscriptionPlan
from app.modules.payment.infrastructure.persistence.models import SubscriptionModel


class SubscriptionMapper:
    """
    Mapper для конвертации Subscription Entity <-> SubscriptionModel.
    """

    @staticmethod
    def to_domain(model: SubscriptionModel) -> Subscription:
        """
        Конвертирует ORM модель в Domain Entity.
        """
        # Создаем Value Objects
        plan = SubscriptionPlan(value=model.plan)

        # Создаем Entity через __new__ (восстановление из БД)
        subscription = Subscription.__new__(Subscription)
        subscription._id = model.id
        subscription._user_id = model.user_id
        subscription._plan = plan
        subscription._is_active = model.is_active
        subscription._auto_renew = model.auto_renew
        subscription._start_date = model.start_date
        subscription._end_date = model.end_date
        subscription._cancelled_at = model.cancelled_at
        subscription._consultations_used = model.consultations_used
        subscription._created_at = model.created_at
        subscription._updated_at = model.updated_at
        subscription._domain_events = []

        return subscription

    @staticmethod
    def to_model(entity: Subscription) -> SubscriptionModel:
        """
        Конвертирует Domain Entity в ORM модель.
        """
        return SubscriptionModel(
            id=entity.id,
            user_id=entity.user_id,
            plan=entity.plan.value,
            is_active=entity.is_active,
            auto_renew=entity.auto_renew,
            start_date=entity.start_date,
            end_date=entity.end_date,
            cancelled_at=entity.cancelled_at,
            consultations_used=entity.consultations_used,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    @staticmethod
    def update_model(entity: Subscription, model: SubscriptionModel) -> None:
        """
        Обновляет существующую ORM модель данными из Entity.
        """
        model.plan = entity.plan.value
        model.is_active = entity.is_active
        model.auto_renew = entity.auto_renew
        model.start_date = entity.start_date
        model.end_date = entity.end_date
        model.cancelled_at = entity.cancelled_at
        model.consultations_used = entity.consultations_used
        model.updated_at = entity.updated_at
