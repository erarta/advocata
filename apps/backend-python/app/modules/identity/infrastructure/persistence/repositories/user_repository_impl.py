"""
User Repository Implementation

Реализация репозитория пользователей с SQLAlchemy.
"""

import logging
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ....domain.entities.user import User
from ....domain.value_objects.email import Email
from ....domain.value_objects.phone import Phone
from ....domain.repositories.user_repository import IUserRepository
from ..models.user_model import UserModel
from ..mappers.user_mapper import UserMapper


logger = logging.getLogger(__name__)


class UserRepositoryImpl(IUserRepository):
    """
    Реализация IUserRepository с использованием SQLAlchemy.

    Использует async SQLAlchemy session для всех операций с БД.
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Инициализация репозитория.

        Args:
            session: Async SQLAlchemy session
        """
        self._session = session

    async def save(self, user: User) -> None:
        """
        Сохранить пользователя (создать или обновить).

        Args:
            user: User для сохранения

        Raises:
            Exception: При ошибке сохранения
        """
        try:
            # Проверяем существует ли пользователь
            result = await self._session.execute(
                select(UserModel).where(UserModel.id == user.id)
            )
            existing_model = result.scalar_one_or_none()

            if existing_model:
                # Update существующей модели
                UserMapper.update_model_from_entity(existing_model, user)
                logger.debug(f"Updating user {user.id}")
            else:
                # Создание новой модели
                user_model = UserMapper.to_model(user)
                self._session.add(user_model)
                logger.debug(f"Creating new user {user.id}")

            # TODO: Публикация доменных событий
            # События нужно публиковать после успешного commit
            # for event in user.domain_events:
            #     await event_bus.publish(event)
            # user.clear_domain_events()

        except Exception as e:
            logger.error(f"Error saving user {user.id}: {str(e)}")
            raise

    async def find_by_id(self, user_id: str) -> Optional[User]:
        """
        Найти пользователя по ID.

        Args:
            user_id: ID пользователя

        Returns:
            User или None если не найден
        """
        try:
            result = await self._session.execute(
                select(UserModel).where(UserModel.id == user_id)
            )
            user_model = result.scalar_one_or_none()

            if not user_model:
                return None

            return UserMapper.to_domain(user_model)

        except Exception as e:
            logger.error(f"Error finding user by id {user_id}: {str(e)}")
            raise

    async def find_by_phone(self, phone: Phone) -> Optional[User]:
        """
        Найти пользователя по телефону.

        Args:
            phone: Номер телефона

        Returns:
            User или None если не найден
        """
        try:
            result = await self._session.execute(
                select(UserModel).where(UserModel.phone == phone.value)
            )
            user_model = result.scalar_one_or_none()

            if not user_model:
                return None

            return UserMapper.to_domain(user_model)

        except Exception as e:
            logger.error(f"Error finding user by phone {phone.value}: {str(e)}")
            raise

    async def find_by_email(self, email: Email) -> Optional[User]:
        """
        Найти пользователя по email.

        Args:
            email: Email адрес

        Returns:
            User или None если не найден
        """
        try:
            result = await self._session.execute(
                select(UserModel).where(UserModel.email == email.value)
            )
            user_model = result.scalar_one_or_none()

            if not user_model:
                return None

            return UserMapper.to_domain(user_model)

        except Exception as e:
            logger.error(f"Error finding user by email {email.value}: {str(e)}")
            raise

    async def exists_by_phone(self, phone: Phone) -> bool:
        """
        Проверить существование пользователя по телефону.

        Args:
            phone: Номер телефона

        Returns:
            True если пользователь существует
        """
        try:
            result = await self._session.execute(
                select(UserModel.id).where(UserModel.phone == phone.value)
            )
            return result.scalar_one_or_none() is not None

        except Exception as e:
            logger.error(f"Error checking phone existence {phone.value}: {str(e)}")
            raise

    async def exists_by_email(self, email: Email) -> bool:
        """
        Проверить существование пользователя по email.

        Args:
            email: Email адрес

        Returns:
            True если пользователь существует
        """
        try:
            result = await self._session.execute(
                select(UserModel.id).where(UserModel.email == email.value)
            )
            return result.scalar_one_or_none() is not None

        except Exception as e:
            logger.error(f"Error checking email existence {email.value}: {str(e)}")
            raise

    async def delete(self, user_id: str) -> None:
        """
        Удалить пользователя.

        Args:
            user_id: ID пользователя

        Raises:
            Exception: При ошибке удаления
        """
        try:
            result = await self._session.execute(
                select(UserModel).where(UserModel.id == user_id)
            )
            user_model = result.scalar_one_or_none()

            if user_model:
                await self._session.delete(user_model)
                logger.info(f"Deleted user {user_id}")

        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {str(e)}")
            raise
