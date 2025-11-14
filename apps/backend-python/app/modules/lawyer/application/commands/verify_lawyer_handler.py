"""
VerifyLawyerHandler

Handler для верификации юриста.
"""

from app.core.domain.result import Result
from ...domain.repositories.lawyer_repository import ILawyerRepository
from ..dtos.lawyer_dto import LawyerDTO
from .verify_lawyer import VerifyLawyerCommand


class VerifyLawyerHandler:
    """
    Handler для команды VerifyLawyerCommand.

    Процесс:
    1. Находит юриста по ID
    2. Вызывает метод verify() на aggregate
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

    async def handle(self, command: VerifyLawyerCommand) -> Result[LawyerDTO]:
        """
        Обрабатывает команду верификации юриста.

        Args:
            command: Команда с данными

        Returns:
            Result с LawyerDTO или ошибкой
        """
        # 1. Находим юриста
        lawyer = await self.lawyer_repository.find_by_id(command.lawyer_id)
        if not lawyer:
            return Result.fail(f"Lawyer not found: {command.lawyer_id}")

        # 2. Верифицируем через domain method
        verify_result = lawyer.verify(
            verified_by_admin_id=command.verified_by_admin_id
        )

        if verify_result.is_failure:
            return Result.fail(verify_result.error)

        # 3. Сохраняем изменения
        await self.lawyer_repository.save(lawyer)

        # 4. Возвращаем DTO
        lawyer_dto = LawyerDTO.from_entity(lawyer)
        return Result.ok(lawyer_dto)
