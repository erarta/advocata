"""
Message Mapper

Mapper для конвертации между Message Entity и MessageModel ORM.
"""
from uuid import UUID
from typing import Optional, List

from app.modules.chat.domain.entities.message import Message
from app.modules.chat.domain.value_objects.message_role import MessageRole
from app.modules.chat.infrastructure.persistence.models.message_model import MessageModel


class MessageMapper:
    """
    Mapper для конвертации Message Entity <-> MessageModel ORM.

    Handles:
    - Конвертация MessageRole в строку и обратно
    - Конвертация UUID в строку и обратно
    - Маппинг полей между Domain и Infrastructure слоями
    """

    @staticmethod
    def to_domain(model: MessageModel) -> Message:
        """
        Конвертирует ORM модель в доменную сущность.

        Args:
            model: ORM модель MessageModel

        Returns:
            Message entity

        Raises:
            ValueError: Если данные в БД невалидны
        """
        # Создаем MessageRole Value Object
        role_result = MessageRole.create(model.role)
        if not role_result.is_success:
            raise ValueError(f"Invalid message role in DB: {model.role}")
        role = role_result.value

        # Создаем доменную сущность через конструктор
        # (не через create, т.к. это восстановление из БД)
        message = Message(
            id=UUID(model.id),
            conversation_id=UUID(model.conversation_id),
            role=role,
            content=model.content,
            token_count=model.token_count,
            referenced_documents=model.referenced_documents if model.referenced_documents else [],
            created_at=model.created_at,
        )

        # Очищаем domain events (они уже обработаны при сохранении)
        message.clear_domain_events()

        return message

    @staticmethod
    def to_model(message: Message) -> MessageModel:
        """
        Конвертирует доменную сущность в ORM модель.

        Args:
            message: Message entity

        Returns:
            MessageModel ORM
        """
        return MessageModel(
            id=str(message.id),
            conversation_id=str(message.conversation_id),
            role=message.role.value.value,
            content=message.content,
            token_count=message.token_count,
            referenced_documents=message.referenced_documents if message.referenced_documents else [],
            created_at=message.created_at,
        )

    @staticmethod
    def update_model(model: MessageModel, message: Message) -> MessageModel:
        """
        Обновляет существующую ORM модель данными из доменной сущности.

        Note: Сообщения обычно immutable, но этот метод оставлен для полноты.

        Args:
            model: Существующая ORM модель
            message: Message entity с новыми данными

        Returns:
            Обновленная MessageModel
        """
        # Обновляем только изменяемые поля (на самом деле сообщения immutable)
        model.content = message.content
        model.token_count = message.token_count
        model.referenced_documents = message.referenced_documents if message.referenced_documents else []

        return model
