"""
Register User Command Handler

Обработчик команды регистрации пользователя.
"""

import logging
from typing import Tuple

from app.core.domain.result import Result
from ...domain.entities.user import User
from ...domain.value_objects.email import Email
from ...domain.value_objects.phone import Phone
from ...domain.value_objects.user_role import UserRole
from ...domain.repositories.user_repository import IUserRepository
from ..dtos.user_dto import UserDTO
from .register_user import RegisterUserCommand


logger = logging.getLogger(__name__)


class RegisterUserHandler:
    """
    Обработчик команды RegisterUserCommand.

    Отвечает за:
    - Проверку уникальности phone/email
    - Хеширование пароля
    - Создание пользователя
    - Генерацию OTP кода
    - Сохранение в репозиторий
    """

    def __init__(
        self,
        user_repository: IUserRepository,
        password_service: "IPasswordService",
        otp_service: "IOTPService",
    ) -> None:
        """
        Инициализация handler.

        Args:
            user_repository: Репозиторий пользователей
            password_service: Сервис для хеширования паролей
            otp_service: Сервис для генерации OTP
        """
        self.user_repository = user_repository
        self.password_service = password_service
        self.otp_service = otp_service

    async def handle(self, command: RegisterUserCommand) -> Result[Tuple[UserDTO, str]]:
        """
        Обработать команду регистрации.

        Args:
            command: Команда регистрации

        Returns:
            Result с (UserDTO, OTP код) или ошибкой
        """
        try:
            # 1. Валидация и создание Value Objects
            phone = None
            email = None

            if command.phone:
                try:
                    phone = Phone(command.phone)
                except ValueError as e:
                    return Result.fail(str(e))

                # Проверка уникальности телефона
                if await self.user_repository.exists_by_phone(phone):
                    return Result.fail("User with this phone number already exists")

            if command.email:
                try:
                    email = Email(command.email)
                except ValueError as e:
                    return Result.fail(str(e))

                # Проверка уникальности email
                if await self.user_repository.exists_by_email(email):
                    return Result.fail("User with this email already exists")

            # 2. Хеширование пароля
            password_hash = self.password_service.hash_password(command.password)

            # 3. Создание роли
            try:
                role = UserRole(command.role)
            except ValueError:
                return Result.fail(f"Invalid role: {command.role}")

            # 4. Создание пользователя
            user_result = User.create(
                phone=phone,
                email=email,
                full_name=command.full_name,
                password_hash=password_hash,
                role=role,
            )

            if user_result.is_failure:
                return Result.fail(user_result.error)

            user = user_result.value

            # 5. Генерация и установка OTP
            otp_code = self.otp_service.generate_otp()
            otp_result = user.set_otp(otp_code)

            if otp_result.is_failure:
                return Result.fail(otp_result.error)

            # 6. Сохранение пользователя
            await self.user_repository.save(user)

            # 7. Отправка OTP
            if phone:
                await self.otp_service.send_otp_sms(phone.value, otp_code)
                logger.info(f"OTP sent to phone {phone.value} for user {user.id}")
            elif email:
                await self.otp_service.send_otp_email(email.value, otp_code)
                logger.info(f"OTP sent to email {email.value} for user {user.id}")

            # 8. Создание DTO
            user_dto = UserDTO.from_entity(user)

            logger.info(f"User registered successfully: {user.id}")
            return Result.ok((user_dto, otp_code))

        except Exception as e:
            logger.error(f"Error registering user: {str(e)}", exc_info=True)
            return Result.fail(f"Failed to register user: {str(e)}")
