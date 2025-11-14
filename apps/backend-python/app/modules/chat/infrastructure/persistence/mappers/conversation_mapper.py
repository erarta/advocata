"""
Conversation Mapper

Mapper для конвертации между Conversation Entity и ConversationModel ORM.
"""
from uuid import UUID
from typing import List

from app.modules.chat.domain.entities.conversation import Conversation
from app.modules.chat.domain.entities.message import Message
from app.modules.chat.domain.value_objects.conversation_status import ConversationStatus
from app.modules.chat.infrastructure.persistence.models.conversation_model import (
    ConversationModel,
)
from app.modules.chat.infrastructure.persistence.mappers.message_mapper import (
    MessageMapper,
)


class ConversationMapper:
    """
    Mapper для конвертации Conversation Entity <-> ConversationModel ORM.

    Handles:
    - Конвертация ConversationStatus в строку и обратно
    - Конвертация вложенных Messages
    - Маппинг полей между Domain и Infrastructure слоями
    - Управление relationships (conversation.messages)
    """

    @staticmethod
    def to_domain(model: ConversationModel, include_messages: bool = True) -> Conversation:
        """
        Конвертирует ORM модель в доменную сущность.

        Args:
            model: ORM модель ConversationModel
            include_messages: Загружать ли сообщения

        Returns:
            Conversation entity

        Raises:
            ValueError: Если данные в БД невалидны
        """
        # Создаем ConversationStatus Value Object
        status_result = ConversationStatus.create(model.status)
        if not status_result.is_success:
            raise ValueError(f"Invalid conversation status in DB: {model.status}")
        status = status_result.value

        # Конвертируем сообщения если нужно
        messages: List[Message] = []
        if include_messages and model.messages:
            messages = [
                MessageMapper.to_domain(message_model)
                for message_model in model.messages
            ]

        # Создаем доменную сущность через конструктор
        # (не через start, т.к. это восстановление из БД)
        conversation = Conversation(
            id=UUID(model.id),
            user_id=UUID(model.user_id),
            title=model.title,
            status=status,
            messages=messages,
            total_tokens=model.total_tokens,
            created_at=model.created_at,
            updated_at=model.updated_at,
            last_message_at=model.last_message_at,
        )

        # Очищаем domain events (они уже обработаны при сохранении)
        conversation.clear_domain_events()

        return conversation

    @staticmethod
    def to_model(conversation: Conversation, include_messages: bool = True) -> ConversationModel:
        """
        Конвертирует доменную сущность в ORM модель.

        Args:
            conversation: Conversation entity
            include_messages: Сохранять ли сообщения

        Returns:
            ConversationModel ORM
        """
        # Создаем базовую модель беседы
        model = ConversationModel(
            id=str(conversation.id),
            user_id=str(conversation.user_id),
            title=conversation.title,
            status=conversation.status.value.value,
            total_tokens=conversation.total_tokens,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            last_message_at=conversation.last_message_at,
        )

        # Конвертируем сообщения если нужно
        if include_messages and conversation.messages:
            model.messages = [
                MessageMapper.to_model(message)
                for message in conversation.messages
            ]

        return model

    @staticmethod
    def update_model(
        model: ConversationModel,
        conversation: Conversation,
        include_messages: bool = True,
    ) -> ConversationModel:
        """
        Обновляет существующую ORM модель данными из доменной сущности.

        Args:
            model: Существующая ORM модель
            conversation: Conversation entity с новыми данными
            include_messages: Обновлять ли сообщения

        Returns:
            Обновленная ConversationModel
        """
        # Обновляем изменяемые поля
        model.title = conversation.title
        model.status = conversation.status.value.value
        model.total_tokens = conversation.total_tokens
        model.updated_at = conversation.updated_at
        model.last_message_at = conversation.last_message_at

        # Обновляем сообщения если нужно
        if include_messages:
            # Очищаем старые сообщения (cascade delete)
            model.messages.clear()

            # Добавляем новые сообщения
            if conversation.messages:
                model.messages = [
                    MessageMapper.to_model(message)
                    for message in conversation.messages
                ]

        return model
