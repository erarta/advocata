"""
User Entity - Aggregate Root

Главная сущность пользователя в системе.
"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID, uuid4

from app.core.domain.aggregate_root import AggregateRoot
from app.core.domain.result import Result
from ..value_objects.email import Email
from ..value_objects.phone import Phone
from ..value_objects.user_role import UserRole
from ..events.user_registered import UserRegisteredEvent
from ..events.user_verified import UserVerifiedEvent
from ..events.user_logged_in import UserLoggedInEvent


class User(AggregateRoot):
    """
    User Aggregate Root.

    Управляет идентификацией, аутентификацией и профилем пользователя.

    Invariants:
    - Phone или Email должны быть указаны
    - Верифицированный пользователь имеет phone_verified=True или email_verified=True
    - OTP код действителен только 5 минут
    - Максимум 3 попытки ввода OTP

    Attributes:
        phone: Номер телефона (опционально)
        email: Email адрес (опционально)
        full_name: Полное имя пользователя
        password_hash: Хеш пароля
        role: Роль пользователя
        is_active: Активен ли пользователь
        phone_verified: Подтвержден ли телефон
        email_verified: Подтвержден ли email
        otp_code: Текущий OTP код
        otp_expires_at: Время истечения OTP
        otp_attempts: Количество попыток ввода OTP
        last_login_at: Время последнего входа
    """

    MAX_OTP_ATTEMPTS = 3
    OTP_EXPIRATION_MINUTES = 5

    def __init__(
        self,
        user_id: str | UUID,
        phone: Optional[Phone],
        email: Optional[Email],
        full_name: str,
        password_hash: str,
        role: UserRole = UserRole.CLIENT,
        is_active: bool = True,
        phone_verified: bool = False,
        email_verified: bool = False,
        otp_code: Optional[str] = None,
        otp_expires_at: Optional[datetime] = None,
        otp_attempts: int = 0,
        last_login_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ) -> None:
        """
        Инициализация User aggregate.

        Args:
            user_id: Уникальный идентификатор
            phone: Номер телефона
            email: Email адрес
            full_name: Полное имя
            password_hash: Хеш пароля
            role: Роль пользователя
            is_active: Активен ли пользователь
            phone_verified: Подтвержден ли телефон
            email_verified: Подтвержден ли email
            otp_code: OTP код
            otp_expires_at: Время истечения OTP
            otp_attempts: Количество попыток OTP
            last_login_at: Последний вход
            created_at: Дата создания
            updated_at: Дата обновления
        """
        super().__init__(user_id)
        self._phone = phone
        self._email = email
        self._full_name = full_name
        self._password_hash = password_hash
        self._role = role
        self._is_active = is_active
        self._phone_verified = phone_verified
        self._email_verified = email_verified
        self._otp_code = otp_code
        self._otp_expires_at = otp_expires_at
        self._otp_attempts = otp_attempts
        self._last_login_at = last_login_at
        self._created_at = created_at or datetime.utcnow()
        self._updated_at = updated_at or datetime.utcnow()

    # Properties
    @property
    def phone(self) -> Optional[Phone]:
        return self._phone

    @property
    def email(self) -> Optional[Email]:
        return self._email

    @property
    def full_name(self) -> str:
        return self._full_name

    @property
    def password_hash(self) -> str:
        return self._password_hash

    @property
    def role(self) -> UserRole:
        return self._role

    @property
    def is_active(self) -> bool:
        return self._is_active

    @property
    def phone_verified(self) -> bool:
        return self._phone_verified

    @property
    def email_verified(self) -> bool:
        return self._email_verified

    @property
    def is_verified(self) -> bool:
        """Проверка общей верификации (phone или email)."""
        return self._phone_verified or self._email_verified

    @property
    def otp_code(self) -> Optional[str]:
        return self._otp_code

    @property
    def otp_expires_at(self) -> Optional[datetime]:
        return self._otp_expires_at

    @property
    def otp_attempts(self) -> int:
        return self._otp_attempts

    @property
    def last_login_at(self) -> Optional[datetime]:
        return self._last_login_at

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        return self._updated_at

    # Factory Methods
    @classmethod
    def create(
        cls,
        phone: Optional[Phone],
        email: Optional[Email],
        full_name: str,
        password_hash: str,
        role: UserRole = UserRole.CLIENT,
    ) -> Result["User"]:
        """
        Создать нового пользователя.

        Args:
            phone: Номер телефона
            email: Email адрес
            full_name: Полное имя
            password_hash: Хеш пароля
            role: Роль

        Returns:
            Result с User или ошибкой
        """
        # Валидация: phone или email должны быть указаны
        if not phone and not email:
            return Result.fail("Either phone or email must be provided")

        if not full_name or not full_name.strip():
            return Result.fail("Full name is required")

        if len(full_name) > 100:
            return Result.fail("Full name is too long (max 100 characters)")

        if not password_hash:
            return Result.fail("Password hash is required")

        user = cls(
            user_id=str(uuid4()),
            phone=phone,
            email=email,
            full_name=full_name.strip(),
            password_hash=password_hash,
            role=role,
        )

        # Генерируем доменное событие
        user.add_domain_event(
            UserRegisteredEvent(
                user_id=user.id,
                phone=phone.value if phone else None,
                email=email.value if email else None,
                role=role.value,
            )
        )

        return Result.ok(user)

    # Business Logic Methods
    def set_otp(self, otp_code: str) -> Result[None]:
        """
        Установить OTP код для верификации.

        Args:
            otp_code: 6-значный OTP код

        Returns:
            Result успеха или ошибки
        """
        if not otp_code or len(otp_code) != 6 or not otp_code.isdigit():
            return Result.fail("Invalid OTP code format (must be 6 digits)")

        self._otp_code = otp_code
        self._otp_expires_at = datetime.utcnow() + timedelta(minutes=self.OTP_EXPIRATION_MINUTES)
        self._otp_attempts = 0
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def verify_otp(self, otp_code: str) -> Result[None]:
        """
        Верифицировать OTP код.

        Args:
            otp_code: OTP код для проверки

        Returns:
            Result успеха или ошибки
        """
        # Проверка наличия OTP
        if not self._otp_code:
            return Result.fail("No OTP code set for this user")

        # Проверка истечения срока
        if self._otp_expires_at and datetime.utcnow() > self._otp_expires_at:
            return Result.fail("OTP code has expired")

        # Проверка максимального количества попыток
        if self._otp_attempts >= self.MAX_OTP_ATTEMPTS:
            return Result.fail("Maximum OTP attempts exceeded")

        # Инкремент попыток
        self._otp_attempts += 1

        # Проверка кода
        if self._otp_code != otp_code:
            return Result.fail(
                f"Invalid OTP code ({self.MAX_OTP_ATTEMPTS - self._otp_attempts} attempts left)"
            )

        # Успешная верификация
        if self._phone:
            self._phone_verified = True
        if self._email:
            self._email_verified = True

        # Очищаем OTP данные
        self._otp_code = None
        self._otp_expires_at = None
        self._otp_attempts = 0
        self._updated_at = datetime.utcnow()

        # Генерируем событие
        self.add_domain_event(UserVerifiedEvent(user_id=self.id))

        return Result.ok()

    def record_login(self) -> Result[None]:
        """
        Записать факт входа пользователя.

        Returns:
            Result успеха или ошибки
        """
        if not self._is_active:
            return Result.fail("User account is inactive")

        if not self.is_verified:
            return Result.fail("User account is not verified")

        self._last_login_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

        # Генерируем событие
        self.add_domain_event(UserLoggedInEvent(user_id=self.id))

        return Result.ok()

    def deactivate(self) -> Result[None]:
        """
        Деактивировать пользователя.

        Returns:
            Result успеха
        """
        self._is_active = False
        self._updated_at = datetime.utcnow()
        return Result.ok()

    def activate(self) -> Result[None]:
        """
        Активировать пользователя.

        Returns:
            Result успеха
        """
        self._is_active = True
        self._updated_at = datetime.utcnow()
        return Result.ok()

    def update_profile(self, full_name: Optional[str] = None) -> Result[None]:
        """
        Обновить профиль пользователя.

        Args:
            full_name: Новое полное имя

        Returns:
            Result успеха или ошибки
        """
        if full_name:
            if not full_name.strip():
                return Result.fail("Full name cannot be empty")
            if len(full_name) > 100:
                return Result.fail("Full name is too long (max 100 characters)")
            self._full_name = full_name.strip()

        self._updated_at = datetime.utcnow()
        return Result.ok()

    def change_password(self, new_password_hash: str) -> Result[None]:
        """
        Изменить пароль пользователя.

        Args:
            new_password_hash: Новый хеш пароля

        Returns:
            Result успеха или ошибки
        """
        if not new_password_hash:
            return Result.fail("Password hash is required")

        self._password_hash = new_password_hash
        self._updated_at = datetime.utcnow()
        return Result.ok()

    def __repr__(self) -> str:
        """Строковое представление."""
        identifier = self._phone.value if self._phone else self._email.value if self._email else "unknown"
        return f"User(id={self.id}, identifier={identifier}, role={self._role.value})"
