"""
User Mapper

Маппер для преобразования между Domain и ORM моделями.
"""

from typing import Optional

from ....domain.entities.user import User
from ....domain.value_objects.email import Email
from ....domain.value_objects.phone import Phone
from ....domain.value_objects.user_role import UserRole
from ..models.user_model import UserModel


class UserMapper:
    """
    Маппер между User domain entity и UserModel ORM.

    Отвечает за преобразование между доменной моделью и моделью персистентности,
    сохраняя чистоту доменного слоя.
    """

    @staticmethod
    def to_domain(model: UserModel) -> User:
        """
        Преобразовать ORM модель в доменную сущность.

        Args:
            model: SQLAlchemy модель

        Returns:
            User domain entity

        Example:
            ```python
            user_model = session.query(UserModel).first()
            user = UserMapper.to_domain(user_model)
            ```
        """
        # Создаем Value Objects
        phone = Phone(model.phone) if model.phone else None
        email = Email(model.email) if model.email else None
        role = UserRole(model.role)

        # Создаем User entity напрямую (не через фабричный метод)
        user = User(
            user_id=model.id,
            phone=phone,
            email=email,
            full_name=model.full_name,
            password_hash=model.password_hash,
            role=role,
            is_active=model.is_active,
            phone_verified=model.phone_verified,
            email_verified=model.email_verified,
            otp_code=model.otp_code,
            otp_expires_at=model.otp_expires_at,
            otp_attempts=model.otp_attempts,
            last_login_at=model.last_login_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

        # Очищаем domain events (они не должны восстанавливаться из БД)
        user.clear_domain_events()

        return user

    @staticmethod
    def to_model(user: User) -> UserModel:
        """
        Преобразовать доменную сущность в ORM модель.

        Args:
            user: User domain entity

        Returns:
            SQLAlchemy модель

        Example:
            ```python
            user = User.create(...)
            user_model = UserMapper.to_model(user.value)
            session.add(user_model)
            ```
        """
        return UserModel(
            id=user.id,
            phone=user.phone.value if user.phone else None,
            email=user.email.value if user.email else None,
            full_name=user.full_name,
            password_hash=user.password_hash,
            role=user.role.value,
            is_active=user.is_active,
            phone_verified=user.phone_verified,
            email_verified=user.email_verified,
            otp_code=user.otp_code,
            otp_expires_at=user.otp_expires_at,
            otp_attempts=user.otp_attempts,
            last_login_at=user.last_login_at,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    @staticmethod
    def update_model_from_entity(model: UserModel, user: User) -> None:
        """
        Обновить существующую ORM модель из доменной сущности.

        Используется для update операций, чтобы сохранить tracked объект.

        Args:
            model: Существующая SQLAlchemy модель
            user: User domain entity

        Example:
            ```python
            user_model = session.query(UserModel).filter_by(id=user.id).first()
            UserMapper.update_model_from_entity(user_model, user)
            session.commit()
            ```
        """
        model.phone = user.phone.value if user.phone else None
        model.email = user.email.value if user.email else None
        model.full_name = user.full_name
        model.password_hash = user.password_hash
        model.role = user.role.value
        model.is_active = user.is_active
        model.phone_verified = user.phone_verified
        model.email_verified = user.email_verified
        model.otp_code = user.otp_code
        model.otp_expires_at = user.otp_expires_at
        model.otp_attempts = user.otp_attempts
        model.last_login_at = user.last_login_at
        model.updated_at = user.updated_at
