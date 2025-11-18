"""
Send Message Command

Команда для отправки сообщения в беседу и получения ответа от AI.
"""
from dataclasses import dataclass


@dataclass
class SendMessageCommand:
    """
    Команда отправки сообщения.

    Args:
        conversation_id: ID беседы
        user_id: ID пользователя (для проверки прав)
        message_content: Текст сообщения от пользователя
        use_rag: Использовать ли RAG для контекста (по умолчанию True)
    """

    conversation_id: str
    user_id: str
    message_content: str
    use_rag: bool = True
