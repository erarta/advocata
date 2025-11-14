"""
GetLawyerHandler

Handler для получения юриста по ID.
"""

from app.core.domain.result import Result
from ...domain.repositories.lawyer_repository import ILawyerRepository
from ..dtos.lawyer_dto import LawyerDTO
from .get_lawyer import GetLawyerQuery


class GetLawyerHandler:
    """
    Handler для запроса GetLawyerQuery.

    Процесс:
    1. Находит юриста по ID в репозитории
    2. Возвращает LawyerDTO

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

    async def handle(self, query: GetLawyerQuery) -> Result[LawyerDTO]:
        """
        Обрабатывает запрос получения юриста.

        Args:
            query: Запрос с ID

        Returns:
            Result с LawyerDTO или ошибкой
        """
        # 1. Находим юриста
        lawyer = await self.lawyer_repository.find_by_id(query.lawyer_id)

        if not lawyer:
            return Result.fail(f"Lawyer not found: {query.lawyer_id}")

        # 2. Возвращаем DTO
        lawyer_dto = LawyerDTO.from_entity(lawyer)
        return Result.ok(lawyer_dto)
