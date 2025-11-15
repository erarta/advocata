"""
Subscription Entity

Aggregate Root для подписок.
"""
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID, uuid4

from app.core.domain.aggregate_root import AggregateRoot
from app.core.domain.result import Result
from app.modules.payment.domain.value_objects import (
    SubscriptionPlan,
    SubscriptionPlanEnum,
)
from app.modules.payment.domain.events import (
    SubscriptionCreatedEvent,
    SubscriptionActivatedEvent,
    SubscriptionCancelledEvent,
    SubscriptionExpiredEvent,
    SubscriptionRenewedEvent,
)


@dataclass
class Subscription(AggregateRoot):
    """
    Subscription Aggregate Root.

    Представляет подписку пользователя на сервис.

    Attributes:
        _user_id: ID пользователя
        _plan: План подписки
        _is_active: Активна ли подписка
        _start_date: Дата начала подписки
        _end_date: Дата окончания подписки
        _cancelled_at: Дата отмены (если отменена)
        _auto_renew: Автоматическое продление
        _consultations_used: Использовано консультаций в текущем периоде
    """

    _user_id: UUID
    _plan: SubscriptionPlan
    _is_active: bool = False
    _start_date: Optional[datetime] = None
    _end_date: Optional[datetime] = None
    _cancelled_at: Optional[datetime] = None
    _auto_renew: bool = True
    _consultations_used: int = 0

    # Properties
    @property
    def user_id(self) -> UUID:
        return self._user_id

    @property
    def plan(self) -> SubscriptionPlan:
        return self._plan

    @property
    def is_active(self) -> bool:
        return self._is_active

    @property
    def start_date(self) -> Optional[datetime]:
        return self._start_date

    @property
    def end_date(self) -> Optional[datetime]:
        return self._end_date

    @property
    def cancelled_at(self) -> Optional[datetime]:
        return self._cancelled_at

    @property
    def auto_renew(self) -> bool:
        return self._auto_renew

    @property
    def consultations_used(self) -> int:
        return self._consultations_used

    # Factory Methods
    @classmethod
    def create(cls, user_id: UUID, plan: SubscriptionPlan) -> Result["Subscription"]:
        """
        Создать подписку.

        Args:
            user_id: ID пользователя
            plan: План подписки

        Returns:
            Result с Subscription или ошибкой
        """
        subscription = cls(
            _id=uuid4(),
            _user_id=user_id,
            _plan=plan,
            _created_at=datetime.utcnow(),
            _updated_at=datetime.utcnow(),
        )

        subscription.add_domain_event(
            SubscriptionCreatedEvent(
                subscription_id=subscription.id,
                user_id=user_id,
                plan=plan.value,
            )
        )

        return Result.ok(subscription)

    # Business Logic Methods
    def activate(self) -> Result[None]:
        """
        Активировать подписку.

        Устанавливает даты начала и окончания.

        Returns:
            Result с успехом или ошибкой
        """
        if self._is_active:
            return Result.fail("Subscription is already active")

        now = datetime.utcnow()
        self._is_active = True
        self._start_date = now
        self._end_date = now + timedelta(days=30)  # 30 дней
        self._consultations_used = 0
        self._updated_at = now

        self.add_domain_event(
            SubscriptionActivatedEvent(
                subscription_id=self.id,
                user_id=self._user_id,
                plan=self._plan.value,
                start_date=self._start_date,
                end_date=self._end_date,
            )
        )

        return Result.ok()

    def cancel(self) -> Result[None]:
        """
        Отменить подписку.

        Подписка остается активной до конца оплаченного периода.

        Returns:
            Result с успехом или ошибкой
        """
        if not self._is_active:
            return Result.fail("Cannot cancel inactive subscription")

        if self._cancelled_at:
            return Result.fail("Subscription is already cancelled")

        self._cancelled_at = datetime.utcnow()
        self._auto_renew = False
        self._updated_at = datetime.utcnow()

        self.add_domain_event(
            SubscriptionCancelledEvent(
                subscription_id=self.id,
                user_id=self._user_id,
                cancelled_at=self._cancelled_at,
                end_date=self._end_date,
            )
        )

        return Result.ok()

    def expire(self) -> Result[None]:
        """
        Завершить подписку (истек срок).

        Returns:
            Result с успехом или ошибкой
        """
        if not self._is_active:
            return Result.fail("Subscription is already inactive")

        self._is_active = False
        self._updated_at = datetime.utcnow()

        self.add_domain_event(
            SubscriptionExpiredEvent(
                subscription_id=self.id,
                user_id=self._user_id,
                plan=self._plan.value,
                expired_at=self._updated_at,
            )
        )

        return Result.ok()

    def renew(self) -> Result[None]:
        """
        Продлить подписку на следующий период.

        Returns:
            Result с успехом или ошибкой
        """
        if not self._is_active:
            return Result.fail("Cannot renew inactive subscription")

        if not self._auto_renew:
            return Result.fail("Auto-renew is disabled for this subscription")

        # Продлеваем на 30 дней от текущей даты окончания
        old_end_date = self._end_date
        self._end_date = self._end_date + timedelta(days=30)
        self._consultations_used = 0  # Сбрасываем счетчик
        self._updated_at = datetime.utcnow()

        self.add_domain_event(
            SubscriptionRenewedEvent(
                subscription_id=self.id,
                user_id=self._user_id,
                plan=self._plan.value,
                old_end_date=old_end_date,
                new_end_date=self._end_date,
            )
        )

        return Result.ok()

    def change_plan(self, new_plan: SubscriptionPlan) -> Result[None]:
        """
        Изменить план подписки.

        Args:
            new_plan: Новый план

        Returns:
            Result с успехом или ошибкой
        """
        if not self._is_active:
            return Result.fail("Cannot change plan for inactive subscription")

        if self._plan.value == new_plan.value:
            return Result.fail("New plan is the same as current plan")

        self._plan = new_plan
        self._consultations_used = 0  # Сбрасываем счетчик при смене плана
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def use_consultation(self) -> Result[None]:
        """
        Использовать одну консультацию из подписки.

        Returns:
            Result с успехом или ошибкой
        """
        if not self._is_active:
            return Result.fail("Subscription is not active")

        limit = self._plan.get_consultations_limit()

        # -1 означает безлимит
        if limit == -1:
            self._consultations_used += 1
            self._updated_at = datetime.utcnow()
            return Result.ok()

        if self._consultations_used >= limit:
            return Result.fail(
                f"Consultation limit reached ({limit} consultations per month)"
            )

        self._consultations_used += 1
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def can_use_consultation(self) -> bool:
        """
        Проверить, доступна ли консультация по подписке.

        Returns:
            True если доступна
        """
        if not self._is_active:
            return False

        limit = self._plan.get_consultations_limit()

        # -1 означает безлимит
        if limit == -1:
            return True

        return self._consultations_used < limit

    def is_cancelled(self) -> bool:
        """Проверка, отменена ли подписка."""
        return self._cancelled_at is not None

    def is_expired(self) -> bool:
        """Проверка, истекла ли подписка."""
        if not self._end_date:
            return False
        return datetime.utcnow() > self._end_date

    def days_until_expiration(self) -> int:
        """
        Получить количество дней до истечения подписки.

        Returns:
            Количество дней (0 если уже истекла)
        """
        if not self._end_date:
            return 0

        delta = self._end_date - datetime.utcnow()
        days = delta.days

        return max(0, days)
