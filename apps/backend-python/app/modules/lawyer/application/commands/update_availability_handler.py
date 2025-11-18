"""
UpdateAvailabilityHandler

Handler для обновления доступности юриста.
"""

from app.core.domain.result import Result
from ...domain.repositories.lawyer_repository import ILawyerRepository
from ..dtos.lawyer_dto import LawyerDTO
from .update_availability import UpdateAvailabilityCommand


class UpdateAvailabilityHandler:
    """
    Handler для команды UpdateAvailabilityCommand.

    Процесс:
    1. Находит юриста по ID
    2. Вызывает метод update_availability() на aggregate
    3. Сохраняет изменения
    4. Возвращает обновленный LawyerDTO

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
        self, command: UpdateAvailabilityCommand
    ) -> Result[LawyerDTO]:
        """
        Обрабатывает команду обновления доступности.

        Args:
            command: Команда с данными

        Returns:
            Result с LawyerDTO или ошибкой
        """
        # 1. Находим юриста
        lawyer = await self.lawyer_repository.find_by_id(command.lawyer_id)
        if not lawyer:
            return Result.fail(f"Lawyer not found: {command.lawyer_id}")

        # 2. Обновляем доступность через domain method
        update_result = lawyer.update_availability(command.is_available)

        if update_result.is_failure:
            return Result.fail(update_result.error)

        # 3. Сохраняем изменения
        await self.lawyer_repository.save(lawyer)

        # 4. Возвращаем DTO
        lawyer_dto = LawyerDTO.from_entity(lawyer)
        return Result.ok(lawyer_dto)
