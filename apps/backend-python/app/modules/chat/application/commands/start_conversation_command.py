"""
Start Conversation Command

Команда для начала новой беседы с AI.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class StartConversationCommand:
    """
    Команда начала новой беседы.

    Args:
        user_id: ID пользователя
        initial_message: Первое сообщение от пользователя
        title: Название беседы (опционально)
    """

    user_id: str
    initial_message: str
    title: Optional[str] = None
