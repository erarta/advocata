"""
Lawyer Aggregate Root

Основная сущность юриста в системе.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from app.core.domain.aggregate_root import AggregateRoot
from app.core.domain.result import Result
from ..events.lawyer_registered import LawyerRegisteredEvent
from ..events.lawyer_verified import LawyerVerifiedEvent
from ..events.lawyer_availability_updated import LawyerAvailabilityUpdatedEvent
from ..value_objects.experience import Experience
from ..value_objects.price import Price
from ..value_objects.rating import Rating
from ..value_objects.specialization import Specialization
from ..value_objects.verification_status import VerificationStatus


class Lawyer(AggregateRoot):
    """
    Lawyer Aggregate Root.

    Представляет юриста на платформе Advocata.
    Содержит полную бизнес-логику для управления юристом.

    Business Rules:
    1. Юрист должен иметь хотя бы одну специализацию
    2. Только верифицированные юристы могут принимать консультации
    3. Цена должна быть в допустимых пределах (500-100,000 руб)
    4. Юрист должен быть привязан к User из Identity Module
    5. Рейтинг обновляется после каждой консультации
    6. Юрист может быть временно приостановлен администратором

    Attributes:
        user_id: ID пользователя из Identity Module
        specializations: Список специализаций
        experience: Опыт работы
        price_per_consultation: Цена за консультацию
        verification_status: Статус верификации
        rating: Рейтинг юриста
        reviews_count: Количество отзывов
        consultations_count: Количество проведенных консультаций
        license_number: Номер лицензии/свидетельства
        education: Образование (ВУЗ, факультет)
        about: Описание юриста
        is_available: Доступен ли для консультаций
        languages: Языки (русский, английский и т.д.)
        location: Город/регион
    """

    MAX_SPECIALIZATIONS = 5
    MIN_SPECIALIZATIONS = 1
    MAX_ABOUT_LENGTH = 2000

    def __init__(
        self,
        lawyer_id: str | UUID,
        user_id: str | UUID,
        specializations: List[Specialization],
        experience: Experience,
        price_per_consultation: Price,
        verification_status: VerificationStatus,
        license_number: str,
        education: str,
        about: str,
        location: str,
        rating: Optional[Rating] = None,
        reviews_count: int = 0,
        consultations_count: int = 0,
        is_available: bool = True,
        languages: Optional[List[str]] = None,
        verified_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ) -> None:
        """
        Создает юриста.

        Args:
            lawyer_id: ID юриста
            user_id: ID пользователя из Identity Module
            specializations: Список специализаций
            experience: Опыт работы
            price_per_consultation: Цена за консультацию
            verification_status: Статус верификации
            license_number: Номер лицензии
            education: Образование
            about: Описание
            location: Город/регион
            rating: Рейтинг (опционально)
            reviews_count: Количество отзывов
            consultations_count: Количество консультаций
            is_available: Доступность
            languages: Языки
            verified_at: Дата верификации
            created_at: Дата создания
            updated_at: Дата обновления
        """
        super().__init__(lawyer_id)

        self._user_id = str(user_id)
        self._specializations = specializations
        self._experience = experience
        self._price_per_consultation = price_per_consultation
        self._verification_status = verification_status
        self._license_number = license_number
        self._education = education
        self._about = about
        self._location = location
        self._rating = rating
        self._reviews_count = reviews_count
        self._consultations_count = consultations_count
        self._is_available = is_available
        self._languages = languages or ["Русский"]
        self._verified_at = verified_at
        self._created_at = created_at or datetime.utcnow()
        self._updated_at = updated_at or datetime.utcnow()

    @classmethod
    def create(
        cls,
        user_id: str | UUID,
        specializations: List[Specialization],
        experience: Experience,
        price_per_consultation: Price,
        license_number: str,
        education: str,
        about: str,
        location: str,
        languages: Optional[List[str]] = None,
    ) -> Result["Lawyer"]:
        """
        Фабричный метод для создания нового юриста.

        Args:
            user_id: ID пользователя
            specializations: Список специализаций
            experience: Опыт работы
            price_per_consultation: Цена
            license_number: Номер лицензии
            education: Образование
            about: Описание
            location: Город/регион
            languages: Языки

        Returns:
            Result с новым юристом или ошибкой
        """
        # Валидация специализаций
        if not specializations:
            return Result.fail("Lawyer must have at least one specialization")

        if len(specializations) > cls.MAX_SPECIALIZATIONS:
            return Result.fail(
                f"Lawyer cannot have more than {cls.MAX_SPECIALIZATIONS} specializations"
            )

        # Валидация описания
        if not about or len(about.strip()) < 50:
            return Result.fail("About section must be at least 50 characters")

        if len(about) > cls.MAX_ABOUT_LENGTH:
            return Result.fail(
                f"About section cannot exceed {cls.MAX_ABOUT_LENGTH} characters"
            )

        # Валидация лицензии
        if not license_number or len(license_number.strip()) < 5:
            return Result.fail("License number must be at least 5 characters")

        # Валидация образования
        if not education or len(education.strip()) < 10:
            return Result.fail("Education must be at least 10 characters")

        # Валидация локации
        if not location or len(location.strip()) < 2:
            return Result.fail("Location must be specified")

        # Создаем юриста со статусом PENDING
        lawyer = cls(
            lawyer_id=uuid4(),
            user_id=user_id,
            specializations=specializations,
            experience=experience,
            price_per_consultation=price_per_consultation,
            verification_status=VerificationStatus.pending(),
            license_number=license_number.strip(),
            education=education.strip(),
            about=about.strip(),
            location=location.strip(),
            rating=None,  # Новый юрист без рейтинга
            reviews_count=0,
            consultations_count=0,
            is_available=False,  # Недоступен до верификации
            languages=languages or ["Русский"],
        )

        # Добавляем domain event
        lawyer.add_domain_event(
            LawyerRegisteredEvent(
                lawyer_id=lawyer.id,
                user_id=str(user_id),
                specializations=[spec.display_name for spec in specializations],
                location=location.strip(),
            )
        )

        return Result.ok(lawyer)

    def verify(self, verified_by_admin_id: str) -> Result[None]:
        """
        Верифицирует юриста (подтверждает документы).

        Args:
            verified_by_admin_id: ID администратора, проводящего верификацию

        Returns:
            Result с успехом или ошибкой
        """
        if self._verification_status.is_verified:
            return Result.fail("Lawyer is already verified")

        if self._verification_status.is_rejected:
            return Result.fail(
                "Cannot verify rejected lawyer. Must re-submit documents first"
            )

        if self._verification_status.is_suspended:
            return Result.fail("Cannot verify suspended lawyer")

        # Меняем статус на VERIFIED
        self._verification_status = VerificationStatus.verified()
        self._is_available = True
        self._verified_at = datetime.utcnow()
        self._updated_at = datetime.utcnow()

        # Инициализируем рейтинг
        if self._rating is None:
            self._rating = Rating.create_default()

        # Добавляем domain event
        self.add_domain_event(
            LawyerVerifiedEvent(
                lawyer_id=self.id,
                verified_by=verified_by_admin_id,
                verified_at=self._verified_at,
            )
        )

        return Result.ok()

    def reject(self, reason: str, rejected_by_admin_id: str) -> Result[None]:
        """
        Отклоняет заявку юриста.

        Args:
            reason: Причина отклонения
            rejected_by_admin_id: ID администратора

        Returns:
            Result с успехом или ошибкой
        """
        if self._verification_status.is_verified:
            return Result.fail("Cannot reject verified lawyer. Use suspend instead")

        if not reason or len(reason.strip()) < 10:
            return Result.fail("Rejection reason must be at least 10 characters")

        self._verification_status = VerificationStatus.rejected()
        self._is_available = False
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def suspend(self, reason: str, suspended_by_admin_id: str) -> Result[None]:
        """
        Приостанавливает аккаунт юриста.

        Args:
            reason: Причина приостановки
            suspended_by_admin_id: ID администратора

        Returns:
            Result с успехом или ошибкой
        """
        if self._verification_status.is_suspended:
            return Result.fail("Lawyer is already suspended")

        if not reason or len(reason.strip()) < 10:
            return Result.fail("Suspension reason must be at least 10 characters")

        self._verification_status = VerificationStatus.suspended()
        self._is_available = False
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def update_availability(self, is_available: bool) -> Result[None]:
        """
        Обновляет доступность юриста.

        Args:
            is_available: Доступен ли для консультаций

        Returns:
            Result с успехом или ошибкой
        """
        if not self._verification_status.is_verified:
            return Result.fail("Only verified lawyers can update availability")

        if self._is_available == is_available:
            return Result.ok()  # Нет изменений

        self._is_available = is_available
        self._updated_at = datetime.utcnow()

        # Добавляем domain event
        self.add_domain_event(
            LawyerAvailabilityUpdatedEvent(
                lawyer_id=self.id,
                is_available=is_available,
            )
        )

        return Result.ok()

    def update_rating(self, new_rating: float) -> Result[None]:
        """
        Обновляет рейтинг юриста после новой консультации.

        Args:
            new_rating: Новый рейтинг от клиента (1.0-5.0)

        Returns:
            Result с успехом или ошибкой
        """
        try:
            review_rating = Rating(new_rating)
        except ValueError as e:
            return Result.fail(str(e))

        # Пересчитываем средний рейтинг
        if self._rating is None:
            self._rating = review_rating
        else:
            total_rating = (
                self._rating.value * self._reviews_count + review_rating.value
            )
            new_average = total_rating / (self._reviews_count + 1)
            self._rating = Rating(new_average)

        self._reviews_count += 1
        self._updated_at = datetime.utcnow()

        return Result.ok()

    def complete_consultation(self) -> None:
        """Увеличивает счетчик проведенных консультаций."""
        self._consultations_count += 1
        self._updated_at = datetime.utcnow()

    def update_profile(
        self,
        about: Optional[str] = None,
        price_per_consultation: Optional[Price] = None,
        languages: Optional[List[str]] = None,
    ) -> Result[None]:
        """
        Обновляет профиль юриста.

        Args:
            about: Новое описание
            price_per_consultation: Новая цена
            languages: Новые языки

        Returns:
            Result с успехом или ошибкой
        """
        if about is not None:
            if len(about) < 50:
                return Result.fail("About section must be at least 50 characters")
            if len(about) > self.MAX_ABOUT_LENGTH:
                return Result.fail(
                    f"About section cannot exceed {self.MAX_ABOUT_LENGTH} characters"
                )
            self._about = about.strip()

        if price_per_consultation is not None:
            self._price_per_consultation = price_per_consultation

        if languages is not None and languages:
            self._languages = languages

        self._updated_at = datetime.utcnow()
        return Result.ok()

    # Properties (read-only access)

    @property
    def user_id(self) -> str:
        return self._user_id

    @property
    def specializations(self) -> List[Specialization]:
        return self._specializations.copy()

    @property
    def experience(self) -> Experience:
        return self._experience

    @property
    def price_per_consultation(self) -> Price:
        return self._price_per_consultation

    @property
    def verification_status(self) -> VerificationStatus:
        return self._verification_status

    @property
    def rating(self) -> Optional[Rating]:
        return self._rating

    @property
    def reviews_count(self) -> int:
        return self._reviews_count

    @property
    def consultations_count(self) -> int:
        return self._consultations_count

    @property
    def license_number(self) -> str:
        return self._license_number

    @property
    def education(self) -> str:
        return self._education

    @property
    def about(self) -> str:
        return self._about

    @property
    def location(self) -> str:
        return self._location

    @property
    def is_available(self) -> bool:
        return self._is_available

    @property
    def languages(self) -> List[str]:
        return self._languages.copy()

    @property
    def verified_at(self) -> Optional[datetime]:
        return self._verified_at

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        return self._updated_at

    @property
    def can_accept_consultations(self) -> bool:
        """Может ли юрист принимать консультации."""
        return (
            self._verification_status.is_verified
            and self._is_available
        )

    @property
    def is_new(self) -> bool:
        """Является ли юрист новым (менее 10 консультаций)."""
        return self._consultations_count < 10

    @property
    def is_experienced(self) -> bool:
        """Является ли юрист опытным (100+ консультаций)."""
        return self._consultations_count >= 100

    def __str__(self) -> str:
        """Строковое представление."""
        specs = ", ".join(spec.display_name for spec in self._specializations)
        rating_str = str(self._rating) if self._rating else "Нет рейтинга"
        return f"Lawyer({self.id}, {specs}, {rating_str})"
