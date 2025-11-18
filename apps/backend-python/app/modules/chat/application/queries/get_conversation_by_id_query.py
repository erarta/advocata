"""
Get Conversation By ID Query

Запрос для получения беседы по ID.
"""
from dataclasses import dataclass


@dataclass
class GetConversationByIdQuery:
    """
    Запрос для получения беседы по ID.

    Args:
        conversation_id: ID беседы
        user_id: ID пользователя (для проверки прав доступа)
        include_messages: Загружать ли сообщения (по умолчанию True)
    """

    conversation_id: str
    user_id: str
    include_messages: bool = True
