"""Payment Dependencies - DI containers"""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.infrastructure.database import get_db
from app.modules.payment.domain import IPaymentRepository, ISubscriptionRepository
from app.modules.payment.infrastructure import PaymentRepositoryImpl, SubscriptionRepositoryImpl
from app.modules.payment.application import (
    CreateConsultationPaymentHandler, CreateSubscriptionPaymentHandler,
    ProcessPaymentHandler, CompletePaymentHandler, FailPaymentHandler,
    RequestRefundHandler, CompleteRefundHandler,
    CreateSubscriptionHandler, ActivateSubscriptionHandler,
    CancelSubscriptionHandler, RenewSubscriptionHandler, ChangePlanHandler,
    GetPaymentByIdHandler, GetUserPaymentsHandler, GetConsultationPaymentHandler,
    GetSubscriptionByIdHandler, GetActiveSubscriptionHandler, GetUserSubscriptionsHandler,
)

# Repositories
def get_payment_repository(db: Annotated[AsyncSession, Depends(get_db)]) -> IPaymentRepository:
    return PaymentRepositoryImpl(session=db)

def get_subscription_repository(db: Annotated[AsyncSession, Depends(get_db)]) -> ISubscriptionRepository:
    return SubscriptionRepositoryImpl(session=db)

PaymentRepositoryDep = Annotated[IPaymentRepository, Depends(get_payment_repository)]
SubscriptionRepositoryDep = Annotated[ISubscriptionRepository, Depends(get_subscription_repository)]

# Payment Command Handlers
def get_create_consultation_payment_handler(repo: PaymentRepositoryDep): return CreateConsultationPaymentHandler(repo)
def get_create_subscription_payment_handler(repo: PaymentRepositoryDep): return CreateSubscriptionPaymentHandler(repo)
def get_process_payment_handler(repo: PaymentRepositoryDep): return ProcessPaymentHandler(repo)
def get_complete_payment_handler(repo: PaymentRepositoryDep): return CompletePaymentHandler(repo)
def get_fail_payment_handler(repo: PaymentRepositoryDep): return FailPaymentHandler(repo)
def get_request_refund_handler(repo: PaymentRepositoryDep): return RequestRefundHandler(repo)
def get_complete_refund_handler(repo: PaymentRepositoryDep): return CompleteRefundHandler(repo)

CreateConsultationPaymentHandlerDep = Annotated[CreateConsultationPaymentHandler, Depends(get_create_consultation_payment_handler)]
CreateSubscriptionPaymentHandlerDep = Annotated[CreateSubscriptionPaymentHandler, Depends(get_create_subscription_payment_handler)]
ProcessPaymentHandlerDep = Annotated[ProcessPaymentHandler, Depends(get_process_payment_handler)]
CompletePaymentHandlerDep = Annotated[CompletePaymentHandler, Depends(get_complete_payment_handler)]
FailPaymentHandlerDep = Annotated[FailPaymentHandler, Depends(get_fail_payment_handler)]
RequestRefundHandlerDep = Annotated[RequestRefundHandler, Depends(get_request_refund_handler)]
CompleteRefundHandlerDep = Annotated[CompleteRefundHandler, Depends(get_complete_refund_handler)]

# Subscription Command Handlers
def get_create_subscription_handler(repo: SubscriptionRepositoryDep): return CreateSubscriptionHandler(repo)
def get_activate_subscription_handler(repo: SubscriptionRepositoryDep): return ActivateSubscriptionHandler(repo)
def get_cancel_subscription_handler(repo: SubscriptionRepositoryDep): return CancelSubscriptionHandler(repo)
def get_renew_subscription_handler(repo: SubscriptionRepositoryDep): return RenewSubscriptionHandler(repo)
def get_change_plan_handler(repo: SubscriptionRepositoryDep): return ChangePlanHandler(repo)

CreateSubscriptionHandlerDep = Annotated[CreateSubscriptionHandler, Depends(get_create_subscription_handler)]
ActivateSubscriptionHandlerDep = Annotated[ActivateSubscriptionHandler, Depends(get_activate_subscription_handler)]
CancelSubscriptionHandlerDep = Annotated[CancelSubscriptionHandler, Depends(get_cancel_subscription_handler)]
RenewSubscriptionHandlerDep = Annotated[RenewSubscriptionHandler, Depends(get_renew_subscription_handler)]
ChangePlanHandlerDep = Annotated[ChangePlanHandler, Depends(get_change_plan_handler)]

# Payment Query Handlers
def get_payment_by_id_handler(repo: PaymentRepositoryDep): return GetPaymentByIdHandler(repo)
def get_user_payments_handler(repo: PaymentRepositoryDep): return GetUserPaymentsHandler(repo)
def get_consultation_payment_handler(repo: PaymentRepositoryDep): return GetConsultationPaymentHandler(repo)

GetPaymentByIdHandlerDep = Annotated[GetPaymentByIdHandler, Depends(get_payment_by_id_handler)]
GetUserPaymentsHandlerDep = Annotated[GetUserPaymentsHandler, Depends(get_user_payments_handler)]
GetConsultationPaymentHandlerDep = Annotated[GetConsultationPaymentHandler, Depends(get_consultation_payment_handler)]

# Subscription Query Handlers
def get_subscription_by_id_handler(repo: SubscriptionRepositoryDep): return GetSubscriptionByIdHandler(repo)
def get_active_subscription_handler(repo: SubscriptionRepositoryDep): return GetActiveSubscriptionHandler(repo)
def get_user_subscriptions_handler(repo: SubscriptionRepositoryDep): return GetUserSubscriptionsHandler(repo)

GetSubscriptionByIdHandlerDep = Annotated[GetSubscriptionByIdHandler, Depends(get_subscription_by_id_handler)]
GetActiveSubscriptionHandlerDep = Annotated[GetActiveSubscriptionHandler, Depends(get_active_subscription_handler)]
GetUserSubscriptionsHandlerDep = Annotated[GetUserSubscriptionsHandler, Depends(get_user_subscriptions_handler)]
