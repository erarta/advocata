"""
RegisterLawyerHandler

Handler для регистрации нового юриста.
"""

from typing import Tuple

from app.core.domain.result import Result
from ...domain.entities.lawyer import Lawyer
from ...domain.repositories.lawyer_repository import ILawyerRepository
from ...domain.services.lawyer_verification_service import LawyerVerificationService
from ...domain.value_objects.experience import Experience
from ...domain.value_objects.price import Price
from ...domain.value_objects.specialization import Specialization
from ..dtos.lawyer_dto import LawyerDTO
from .register_lawyer import RegisterLawyerCommand


class RegisterLawyerHandler:
    """
    Handler для команды RegisterLawyerCommand.

    Процесс:
    1. Проверяет, что user_id не зарегистрирован как юрист
    2. Валидирует данные через VerificationService
    3. Создает Value Objects (Specialization, Experience, Price)
    4. Создает Lawyer aggregate через factory method
    5. Сохраняет в репозиторий
    6. Возвращает LawyerDTO

    Dependencies:
        lawyer_repository: Репозиторий юристов
    """

    def __init__(self, lawyer_repository: ILawyerRepository) -> None:
        """
        Инициализирует handler.

        Args:
            lawyer_repository: Репозиторий юристов
        """
        self.lawyer_repository = lawyer_repository

    async def handle(
        self, command: RegisterLawyerCommand
    ) -> Result[LawyerDTO]:
        """
        Обрабатывает команду регистрации юриста.

        Args:
            command: Команда с данными

        Returns:
            Result с LawyerDTO или ошибкой
        """
        # 1. Проверяем, что пользователь еще не зарегистрирован как юрист
        existing_lawyer = await self.lawyer_repository.find_by_user_id(command.user_id)
        if existing_lawyer:
            return Result.fail("User is already registered as a lawyer")

        # 2. Валидация через Domain Service
        eligibility_result = LawyerVerificationService.is_eligible_for_verification(
            license_number=command.license_number,
            education=command.education,
            about=command.about,
        )

        if eligibility_result.is_failure:
            # Форматируем ошибки для пользователя
            errors = eligibility_result.error
            error_messages = []
            for field, messages in errors.items():
                error_messages.extend(messages)
            return Result.fail("; ".join(error_messages))

        # 3. Создаем Value Objects
        try:
            # Специализации
            specializations = []
            for spec_str in command.specializations:
                spec = Specialization(spec_str)
                specializations.append(spec)

            # Опыт
            experience = Experience(command.experience_years)

            # Цена
            price = Price(command.price_per_consultation)

        except ValueError as e:
            return Result.fail(str(e))

        # 4. Создаем Lawyer aggregate
        lawyer_result = Lawyer.create(
            user_id=command.user_id,
            specializations=specializations,
            experience=experience,
            price_per_consultation=price,
            license_number=command.license_number,
            education=command.education,
            about=command.about,
            location=command.location,
            languages=command.languages,
        )

        if lawyer_result.is_failure:
            return Result.fail(lawyer_result.error)

        lawyer = lawyer_result.value

        # 5. Сохраняем в репозиторий
        await self.lawyer_repository.save(lawyer)

        # 6. Возвращаем DTO
        lawyer_dto = LawyerDTO.from_entity(lawyer)
        return Result.ok(lawyer_dto)
