"""
Auth API Router

FastAPI роутер для аутентификации и управления пользователями.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.infrastructure.database import get_db
from ...application.commands.login_user import LoginUserCommand
from ...application.commands.login_user_handler import LoginUserHandler
from ...application.commands.register_user import RegisterUserCommand
from ...application.commands.register_user_handler import RegisterUserHandler
from ...application.commands.verify_otp import VerifyOTPCommand
from ...application.commands.verify_otp_handler import VerifyOTPHandler
from ...application.dtos.user_dto import UserDTO
from ...infrastructure.persistence.repositories.user_repository_impl import UserRepositoryImpl
from ...infrastructure.services.jwt_service import JWTService
from ...infrastructure.services.otp_service import OTPService
from ...infrastructure.services.password_service import PasswordService
from ..dependencies.auth_deps import get_current_user, get_verified_user
from ..schemas.requests import LoginRequest, RegisterRequest, VerifyOTPRequest
from ..schemas.responses import AuthResponse, ErrorResponse, RegisterResponse, UserResponse


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden"},
        422: {"model": ErrorResponse, "description": "Validation Error"},
    },
)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Регистрация нового пользователя",
    description="""
    Регистрирует нового пользователя в системе.

    **Процесс:**
    1. Создает учетную запись пользователя
    2. Генерирует OTP код (6 цифр)
    3. Отправляет OTP на телефон или email

    **Требования:**
    - Обязательно указать phone ИЛИ email
    - Полное имя (2-100 символов)
    - Пароль (минимум 8 символов)
    - Роль (CLIENT или LAWYER)

    **После регистрации:**
    - Используйте `/verify-otp` для подтверждения
    - OTP действителен 5 минут
    - Максимум 3 попытки ввода OTP
    """,
)
async def register(
    request: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RegisterResponse:
    """
    Регистрация пользователя.

    Args:
        request: Данные для регистрации
        db: Database session

    Returns:
        RegisterResponse с информацией о пользователе

    Raises:
        HTTPException: 400 если пользователь уже существует
    """
    # Создаем зависимости
    user_repository = UserRepositoryImpl(db)
    password_service = PasswordService()
    otp_service = OTPService()

    # Создаем handler
    handler = RegisterUserHandler(
        user_repository=user_repository,
        password_service=password_service,
        otp_service=otp_service,
    )

    # Создаем команду
    command = RegisterUserCommand(
        phone=request.phone,
        email=request.email,
        full_name=request.full_name,
        password=request.password,
        role=request.role,
    )

    # Выполняем регистрацию
    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    user_dto, otp_code = result.value

    return RegisterResponse(
        user=UserResponse(
            id=user_dto.id,
            phone=user_dto.phone,
            email=user_dto.email,
            full_name=user_dto.full_name,
            role=user_dto.role,
            is_active=user_dto.is_active,
            phone_verified=user_dto.phone_verified,
            email_verified=user_dto.email_verified,
            is_verified=user_dto.is_verified,
        ),
        message="User registered successfully. Please verify OTP code sent to your phone/email.",
        otp_code=otp_code,  # В production НЕ возвращать!
    )


@router.post(
    "/verify-otp",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Верификация OTP кода",
    description="""
    Верифицирует OTP код и возвращает JWT токены.

    **Процесс:**
    1. Проверяет OTP код
    2. Отмечает телефон/email как подтвержденный
    3. Генерирует access и refresh токены

    **OTP ограничения:**
    - Действителен 5 минут
    - Максимум 3 попытки
    - После 3 неудачных попыток нужна повторная регистрация

    **Токены:**
    - Access token: 15 минут
    - Refresh token: 7 дней
    """,
)
async def verify_otp(
    request: VerifyOTPRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """
    Верификация OTP.

    Args:
        request: OTP данные
        db: Database session

    Returns:
        AuthResponse с JWT токенами

    Raises:
        HTTPException: 400 если OTP невалидный
    """
    # Создаем зависимости
    user_repository = UserRepositoryImpl(db)
    jwt_service = JWTService()

    # Создаем handler
    handler = VerifyOTPHandler(
        user_repository=user_repository,
        jwt_service=jwt_service,
    )

    # Создаем команду
    command = VerifyOTPCommand(
        phone=request.phone,
        email=request.email,
        otp_code=request.otp_code,
    )

    # Выполняем верификацию
    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error,
        )

    tokens = result.value

    return AuthResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type="bearer",
        expires_in=tokens.expires_in,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Вход в систему",
    description="""
    Аутентифицирует пользователя и возвращает JWT токены.

    **Требования:**
    - Указать phone ИЛИ email
    - Правильный пароль
    - Пользователь должен быть верифицирован (OTP)
    - Пользователь должен быть активным

    **Токены:**
    - Access token: используйте в заголовке `Authorization: Bearer <token>`
    - Refresh token: для обновления access token через `/refresh`
    """,
)
async def login(
    request: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """
    Вход пользователя.

    Args:
        request: Данные для входа
        db: Database session

    Returns:
        AuthResponse с JWT токенами

    Raises:
        HTTPException: 401 если credentials невалидные
    """
    # Создаем зависимости
    user_repository = UserRepositoryImpl(db)
    password_service = PasswordService()
    jwt_service = JWTService()

    # Создаем handler
    handler = LoginUserHandler(
        user_repository=user_repository,
        password_service=password_service,
        jwt_service=jwt_service,
    )

    # Создаем команду
    command = LoginUserCommand(
        phone=request.phone,
        email=request.email,
        password=request.password,
    )

    # Выполняем вход
    result = await handler.handle(command)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.error,
            headers={"WWW-Authenticate": "Bearer"},
        )

    tokens = result.value

    return AuthResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type="bearer",
        expires_in=tokens.expires_in,
    )


@router.post(
    "/refresh",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Обновление access token",
    description="""
    Обновляет access token используя refresh token.

    **Как использовать:**
    1. Когда access token истекает (15 минут)
    2. Отправьте refresh token в теле запроса
    3. Получите новую пару токенов

    **Безопасность:**
    - Refresh token действителен 7 дней
    - После обновления старый refresh token становится невалидным
    """,
)
async def refresh_token(
    refresh_token: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    """
    Обновление токена.

    Args:
        refresh_token: Refresh token
        db: Database session

    Returns:
        AuthResponse с новыми JWT токенами

    Raises:
        HTTPException: 401 если refresh token невалидный
    """
    jwt_service = JWTService()

    # Валидация refresh token
    user_id = jwt_service.verify_refresh_token(refresh_token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Проверяем что пользователь существует и активен
    user_repository = UserRepositoryImpl(db)
    user = await user_repository.find_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    # Генерируем новые токены
    new_access_token = jwt_service.create_access_token(user_id)
    new_refresh_token = jwt_service.create_refresh_token(user_id)

    return AuthResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=jwt_service.access_token_expire_minutes * 60,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Получить текущего пользователя",
    description="""
    Возвращает информацию о текущем аутентифицированном пользователе.

    **Требования:**
    - Валидный access token в заголовке Authorization

    **Заголовок:**
    ```
    Authorization: Bearer <access_token>
    ```
    """,
)
async def get_me(
    user: Annotated[UserDTO, Depends(get_current_user)],
) -> UserResponse:
    """
    Получение текущего пользователя.

    Args:
        user: Текущий пользователь (из dependency)

    Returns:
        UserResponse с информацией о пользователе
    """
    return UserResponse(
        id=user.id,
        phone=user.phone,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        phone_verified=user.phone_verified,
        email_verified=user.email_verified,
        is_verified=user.is_verified,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Выход из системы",
    description="""
    Выход пользователя из системы.

    **Примечание:**
    - В текущей реализации JWT токены stateless
    - Клиент должен удалить токены локально
    - В будущем: blacklist для токенов в Redis

    **Требования:**
    - Валидный access token
    """,
)
async def logout(
    user: Annotated[UserDTO, Depends(get_verified_user)],
) -> None:
    """
    Выход пользователя.

    Args:
        user: Текущий верифицированный пользователь

    Returns:
        None (204 No Content)
    """
    # TODO: Добавить токен в blacklist (Redis)
    # В текущей реализации клиент просто удаляет токены локально
    pass
