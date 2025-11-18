"""
Consultation Presentation Layer

Presentation Layer для модуля консультаций.
Содержит REST API endpoints и WebSocket handlers.
"""
from app.modules.consultation.presentation.api import router

__all__ = ["router"]
