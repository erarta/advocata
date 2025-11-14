"""
Presentation Layer для Chat Module
"""
from app.modules.chat.presentation.api import router
from app.modules.chat.presentation.websocket import (
    websocket_endpoint,
    manager,
)
from app.modules.chat.presentation.schemas import (
    StartConversationRequest,
    SendMessageRequest,
    ConversationResponse,
    ConversationSearchResponse,
    ErrorResponse,
)

__all__ = [
    # API
    "router",
    # WebSocket
    "websocket_endpoint",
    "manager",
    # Schemas
    "StartConversationRequest",
    "SendMessageRequest",
    "ConversationResponse",
    "ConversationSearchResponse",
    "ErrorResponse",
]
