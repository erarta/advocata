"""
Schemas для Chat Presentation Layer
"""
from app.modules.chat.presentation.schemas.requests import (
    StartConversationRequest,
    SendMessageRequest,
    GetConversationsRequest,
    ArchiveConversationRequest,
    DeleteConversationRequest,
)
from app.modules.chat.presentation.schemas.responses import (
    MessageResponse,
    ConversationResponse,
    ConversationListItemResponse,
    ConversationSearchResponse,
    ErrorResponse,
    TokenUsageResponse,
)

__all__ = [
    # Requests
    "StartConversationRequest",
    "SendMessageRequest",
    "GetConversationsRequest",
    "ArchiveConversationRequest",
    "DeleteConversationRequest",
    # Responses
    "MessageResponse",
    "ConversationResponse",
    "ConversationListItemResponse",
    "ConversationSearchResponse",
    "ErrorResponse",
    "TokenUsageResponse",
]
