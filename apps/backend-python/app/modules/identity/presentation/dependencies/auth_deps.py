"""
Auth Dependencies

Dependency injection для аутентификации в FastAPI.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.infrastructure.database import get_db
from ...application.queries.get_current_user import GetCurrentUserQuery
from ...application.queries.get_current_user_handler import GetCurrentUserHandler
from ...infrastructure.persistence.repositories.user_repository_impl import UserRepositoryImpl
from ...infrastructure.services.jwt_service import JWTService
from ...application.dtos.user_dto import UserDTO


# HTTP Bearer scheme для JWT
security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserDTO:
    """
    Dependency для получения текущего аутентифицированного пользователя.

    Проверяет JWT токен и возвращает UserDTO.

    Args:
        credentials: HTTP Bearer credentials
        db: Database session

    Returns:
        UserDTO текущего пользователя

    Raises:
        HTTPException: 401 если токен невалидный

    Example:
        ```python
        @router.get("/me")
        async def get_me(user: UserDTO = Depends(get_current_user)):
            return user
        ```
    """
    token = credentials.credentials

    # Валидация токена
    jwt_service = JWTService()
    user_id = jwt_service.verify_access_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Получение пользователя
    user_repository = UserRepositoryImpl(db)
    handler = GetCurrentUserHandler(user_repository)
    query = GetCurrentUserQuery(user_id=user_id)

    result = await handler.handle(query)

    if result.is_failure:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.error,
            headers={"WWW-Authenticate": "Bearer"},
        )

    return result.value


async def get_current_active_user(
    user: Annotated[UserDTO, Depends(get_current_user)],
) -> UserDTO:
    """
    Dependency для получения активного пользователя.

    Args:
        user: Текущий пользователь

    Returns:
        UserDTO если пользователь активен

    Raises:
        HTTPException: 403 если пользователь неактивен
    """
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return user


async def get_verified_user(
    user: Annotated[UserDTO, Depends(get_current_active_user)],
) -> UserDTO:
    """
    Dependency для получения верифицированного пользователя.

    Args:
        user: Текущий активный пользователь

    Returns:
        UserDTO если пользователь верифицирован

    Raises:
        HTTPException: 403 если пользователь не верифицирован
    """
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not verified. Please verify your phone or email.",
        )
    return user


async def require_role(required_role: str):
    """
    Dependency factory для проверки роли пользователя.

    Args:
        required_role: Требуемая роль

    Returns:
        Dependency function

    Example:
        ```python
        @router.get("/admin")
        async def admin_only(user: UserDTO = Depends(require_role("ADMIN"))):
            return {"message": "Admin access"}
        ```
    """

    async def role_checker(
        user: Annotated[UserDTO, Depends(get_verified_user)],
    ) -> UserDTO:
        if user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_role} role",
            )
        return user

    return role_checker
