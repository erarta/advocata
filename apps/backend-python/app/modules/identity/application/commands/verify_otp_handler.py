"""
Verify OTP Command Handler

Обработчик команды верификации OTP.
"""

import logging

from app.core.domain.result import Result
from ...domain.value_objects.email import Email
from ...domain.value_objects.phone import Phone
from ...domain.repositories.user_repository import IUserRepository
from ..dtos.auth_tokens_dto import AuthTokensDTO
from .verify_otp import VerifyOTPCommand


logger = logging.getLogger(__name__)


class VerifyOTPHandler:
    """
    Обработчик команды VerifyOTPCommand.

    Отвечает за:
    - Поиск пользователя
    - Проверку OTP кода
    - Генерацию JWT токенов
    """

    def __init__(
        self,
        user_repository: IUserRepository,
        jwt_service: "IJWTService",
    ) -> None:
        """
        Инициализация handler.

        Args:
            user_repository: Репозиторий пользователей
            jwt_service: Сервис для генерации JWT
        """
        self.user_repository = user_repository
        self.jwt_service = jwt_service

    async def handle(self, command: VerifyOTPCommand) -> Result[AuthTokensDTO]:
        """
        Обработать команду верификации OTP.

        Args:
            command: Команда верификации

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
                return Result.fail("User not found")

            # 2. Верифицировать OTP
            verify_result = user.verify_otp(command.otp_code)

            if verify_result.is_failure:
                return Result.fail(verify_result.error)

            # 3. Сохранить верифицированного пользователя
            await self.user_repository.save(user)

            # 4. Генерировать JWT токены
            access_token = self.jwt_service.create_access_token(user.id)
            refresh_token = self.jwt_service.create_refresh_token(user.id)

            tokens = AuthTokensDTO(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=self.jwt_service.access_token_expire_minutes * 60,
            )

            logger.info(f"User {user.id} verified successfully")
            return Result.ok(tokens)

        except Exception as e:
            logger.error(f"Error verifying OTP: {str(e)}", exc_info=True)
            return Result.fail(f"Failed to verify OTP: {str(e)}")
