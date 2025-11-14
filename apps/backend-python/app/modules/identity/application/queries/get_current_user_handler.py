"""
Get Current User Query Handler

Обработчик запроса получения текущего пользователя.
"""

import logging

from app.core.domain.result import Result
from ...domain.repositories.user_repository import IUserRepository
from ..dtos.user_dto import UserDTO
from .get_current_user import GetCurrentUserQuery


logger = logging.getLogger(__name__)


class GetCurrentUserHandler:
    """
    Обработчик запроса GetCurrentUserQuery.

    Отвечает за получение данных текущего аутентифицированного пользователя.
    """

    def __init__(self, user_repository: IUserRepository) -> None:
        """
        Инициализация handler.

        Args:
            user_repository: Репозиторий пользователей
        """
        self.user_repository = user_repository

    async def handle(self, query: GetCurrentUserQuery) -> Result[UserDTO]:
        """
        Обработать запрос получения текущего пользователя.

        Args:
            query: Запрос с user_id

        Returns:
            Result с UserDTO или ошибкой
        """
        try:
            user = await self.user_repository.find_by_id(query.user_id)

            if not user:
                return Result.fail("User not found")

            if not user.is_active:
                return Result.fail("User account is inactive")

            user_dto = UserDTO.from_entity(user)
            return Result.ok(user_dto)

        except Exception as e:
            logger.error(f"Error getting current user: {str(e)}", exc_info=True)
            return Result.fail(f"Failed to get user: {str(e)}")
