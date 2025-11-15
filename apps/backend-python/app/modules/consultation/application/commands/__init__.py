"""
Commands для Consultation Application Layer
"""
from app.modules.consultation.application.commands.book_consultation import (
    BookConsultationCommand,
    BookConsultationHandler,
)
from app.modules.consultation.application.commands.confirm_consultation import (
    ConfirmConsultationCommand,
    ConfirmConsultationHandler,
)
from app.modules.consultation.application.commands.start_consultation import (
    StartConsultationCommand,
    StartConsultationHandler,
)
from app.modules.consultation.application.commands.complete_consultation import (
    CompleteConsultationCommand,
    CompleteConsultationHandler,
)
from app.modules.consultation.application.commands.cancel_consultation import (
    CancelConsultationCommand,
    CancelConsultationHandler,
)
from app.modules.consultation.application.commands.rate_consultation import (
    RateConsultationCommand,
    RateConsultationHandler,
)

__all__ = [
    # Book Consultation
    "BookConsultationCommand",
    "BookConsultationHandler",
    # Confirm Consultation
    "ConfirmConsultationCommand",
    "ConfirmConsultationHandler",
    # Start Consultation
    "StartConsultationCommand",
    "StartConsultationHandler",
    # Complete Consultation
    "CompleteConsultationCommand",
    "CompleteConsultationHandler",
    # Cancel Consultation
    "CancelConsultationCommand",
    "CancelConsultationHandler",
    # Rate Consultation
    "RateConsultationCommand",
    "RateConsultationHandler",
]
