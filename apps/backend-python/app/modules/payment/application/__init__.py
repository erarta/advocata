"""
Payment Application Layer

Application Layer для модуля платежей.
Содержит команды, запросы и DTOs.
"""
# Commands
from app.modules.payment.application.commands import (
    # Payment Commands
    CreateConsultationPaymentCommand,
    CreateConsultationPaymentHandler,
    CreateSubscriptionPaymentCommand,
    CreateSubscriptionPaymentHandler,
    ProcessPaymentCommand,
    ProcessPaymentHandler,
    CompletePaymentCommand,
    CompletePaymentHandler,
    FailPaymentCommand,
    FailPaymentHandler,
    RequestRefundCommand,
    RequestRefundHandler,
    CompleteRefundCommand,
    CompleteRefundHandler,
    # Subscription Commands
    CreateSubscriptionCommand,
    CreateSubscriptionHandler,
    ActivateSubscriptionCommand,
    ActivateSubscriptionHandler,
    CancelSubscriptionCommand,
    CancelSubscriptionHandler,
    RenewSubscriptionCommand,
    RenewSubscriptionHandler,
    ChangePlanCommand,
    ChangePlanHandler,
)

# Queries
from app.modules.payment.application.queries import (
    # Payment Queries
    GetPaymentByIdQuery,
    GetPaymentByIdHandler,
    GetUserPaymentsQuery,
    GetUserPaymentsHandler,
    GetConsultationPaymentQuery,
    GetConsultationPaymentHandler,
    # Subscription Queries
    GetSubscriptionByIdQuery,
    GetSubscriptionByIdHandler,
    GetActiveSubscriptionQuery,
    GetActiveSubscriptionHandler,
    GetUserSubscriptionsQuery,
    GetUserSubscriptionsHandler,
)

# DTOs
from app.modules.payment.application.dtos import (
    # Payment DTOs
    PaymentDTO,
    PaymentListItemDTO,
    PaymentSearchResultDTO,
    CreatePaymentRequestDTO,
    RequestRefundRequestDTO,
    # Subscription DTOs
    SubscriptionDTO,
    SubscriptionPlanInfoDTO,
    CreateSubscriptionRequestDTO,
    ChangePlanRequestDTO,
)

__all__ = [
    # Payment Commands
    "CreateConsultationPaymentCommand",
    "CreateConsultationPaymentHandler",
    "CreateSubscriptionPaymentCommand",
    "CreateSubscriptionPaymentHandler",
    "ProcessPaymentCommand",
    "ProcessPaymentHandler",
    "CompletePaymentCommand",
    "CompletePaymentHandler",
    "FailPaymentCommand",
    "FailPaymentHandler",
    "RequestRefundCommand",
    "RequestRefundHandler",
    "CompleteRefundCommand",
    "CompleteRefundHandler",
    # Subscription Commands
    "CreateSubscriptionCommand",
    "CreateSubscriptionHandler",
    "ActivateSubscriptionCommand",
    "ActivateSubscriptionHandler",
    "CancelSubscriptionCommand",
    "CancelSubscriptionHandler",
    "RenewSubscriptionCommand",
    "RenewSubscriptionHandler",
    "ChangePlanCommand",
    "ChangePlanHandler",
    # Payment Queries
    "GetPaymentByIdQuery",
    "GetPaymentByIdHandler",
    "GetUserPaymentsQuery",
    "GetUserPaymentsHandler",
    "GetConsultationPaymentQuery",
    "GetConsultationPaymentHandler",
    # Subscription Queries
    "GetSubscriptionByIdQuery",
    "GetSubscriptionByIdHandler",
    "GetActiveSubscriptionQuery",
    "GetActiveSubscriptionHandler",
    "GetUserSubscriptionsQuery",
    "GetUserSubscriptionsHandler",
    # Payment DTOs
    "PaymentDTO",
    "PaymentListItemDTO",
    "PaymentSearchResultDTO",
    "CreatePaymentRequestDTO",
    "RequestRefundRequestDTO",
    # Subscription DTOs
    "SubscriptionDTO",
    "SubscriptionPlanInfoDTO",
    "CreateSubscriptionRequestDTO",
    "ChangePlanRequestDTO",
]
