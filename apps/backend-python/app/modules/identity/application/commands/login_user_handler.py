"""
Login User Command Handler

Обработчик команды входа пользователя.
"""

import logging

from app.core.domain.result import Result
from ...domain.value_objects.email import Email
from ...domain.value_objects.phone import Phone
from ...domain.repositories.user_repository import IUserRepository
from ..dtos.auth_tokens_dto import AuthTokensDTO
from .login_user import LoginUserCommand


logger = logging.getLogger(__name__)


class LoginUserHandler:
    """
    Обработчик команды LoginUserCommand.

    Отвечает за:
    - Поиск пользователя
    - Проверку пароля
    - Запись факта входа
    - Генерацию JWT токенов
    """

    def __init__(
        self,
        user_repository: IUserRepository,
        password_service: "IPasswordService",
        jwt_service: "IJWTService",
    ) -> None:
        """
        Инициализация handler.

        Args:
            user_repository: Репозиторий пользователей
            password_service: Сервис для проверки паролей
            jwt_service: Сервис для генерации JWT
        """
        self.user_repository = user_repository
        self.password_service = password_service
        self.jwt_service = jwt_service

    async def handle(self, command: LoginUserCommand) -> Result[AuthTokensDTO]:
        """
        Обработать команду входа.

        Args:
            command: Команда входа

        Returns:
            Result с AuthTokensDTO или ошибкой
        """
        try:
            # 1. Найти пользователя
            user = None

            if command.phone:
                try:
                    phone = Phone(command.phone)
                    user = await self.user_repository.find_by_phone(phone)
                except ValueError as e:
                    return Result.fail(str(e))

            elif command.email:
                try:
                    email = Email(command.email)
                    user = await self.user_repository.find_by_email(email)
                except ValueError as e:
                    return Result.fail(str(e))

            if not user:
                return Result.fail("Invalid credentials")

            # 2. Проверить пароль
            if not self.password_service.verify_password(command.password, user.password_hash):
                logger.warning(f"Failed login attempt for user {user.id}")
                return Result.fail("Invalid credentials")

            # 3. Записать факт входа
            login_result = user.record_login()

            if login_result.is_failure:
                return Result.fail(login_result.error)

            # 4. Сохранить пользователя
            await self.user_repository.save(user)

            # 5. Генерировать JWT токены
            access_token = self.jwt_service.create_access_token(user.id)
            refresh_token = self.jwt_service.create_refresh_token(user.id)

            tokens = AuthTokensDTO(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=self.jwt_service.access_token_expire_minutes * 60,
            )

            logger.info(f"User {user.id} logged in successfully")
            return Result.ok(tokens)

        except Exception as e:
            logger.error(f"Error during login: {str(e)}", exc_info=True)
            return Result.fail(f"Login failed: {str(e)}")
