"""
RAG Service Interface

Доменный сервис для Retrieval-Augmented Generation.
"""
from abc import ABC, abstractmethod
from typing import List
from uuid import UUID

from app.shared.domain.result import Result


class DocumentChunk:
    """
    Представление чанка документа для RAG.

    Используется для передачи релевантных фрагментов документов
    в AI модель для генерации ответа.
    """

    def __init__(
        self,
        document_id: str,
        content: str,
        similarity_score: float,
        metadata: dict,
    ):
        """
        Создает чанк документа.

        Args:
            document_id: ID документа
            content: Текст фрагмента
            similarity_score: Оценка релевантности (0.0-1.0)
            metadata: Метаданные документа
        """
        self.document_id = document_id
        self.content = content
        self.similarity_score = similarity_score
        self.metadata = metadata

    def __repr__(self) -> str:
        """Представление для отладки"""
        return (
            f"DocumentChunk(document_id={self.document_id}, "
            f"similarity={self.similarity_score:.3f}, "
            f"length={len(self.content)})"
        )


class IRAGService(ABC):
    """
    Интерфейс RAG сервиса.

    Определяет контракт для поиска релевантных документов
    и построения контекста для AI.

    Реализация будет в Infrastructure Layer с использованием
    векторной БД (pgvector или ChromaDB).
    """

    @abstractmethod
    async def search_relevant_documents(
        self,
        user_id: UUID,
        query: str,
        top_k: int = 5,
        min_similarity: float = 0.7,
    ) -> Result[List[DocumentChunk]]:
        """
        Ищет релевантные документы для запроса пользователя.

        Args:
            user_id: ID пользователя (для фильтрации его документов)
            query: Запрос пользователя
            top_k: Количество наиболее релевантных документов
            min_similarity: Минимальный порог сходства (0.0-1.0)

        Returns:
            Result со списком релевантных чанков или ошибкой
        """
        pass

    @abstractmethod
    async def index_document(
        self,
        document_id: str,
        content: str,
        metadata: dict,
    ) -> Result[None]:
        """
        Индексирует документ для поиска.

        Разбивает документ на чанки, создает эмбеддинги
        и сохраняет в векторную БД.

        Args:
            document_id: ID документа
            content: Текст документа
            metadata: Метаданные документа

        Returns:
            Result с успехом или ошибкой
        """
        pass

    @abstractmethod
    async def remove_document(self, document_id: str) -> Result[None]:
        """
        Удаляет документ из индекса.

        Args:
            document_id: ID документа

        Returns:
            Result с успехом или ошибкой
        """
        pass

    @abstractmethod
    async def build_context(
        self,
        query: str,
        chunks: List[DocumentChunk],
        max_tokens: int = 4000,
    ) -> str:
        """
        Строит контекст для AI из релевантных чанков.

        Форматирует найденные документы в промпт для GPT-4.

        Args:
            query: Запрос пользователя
            chunks: Релевантные чанки документов
            max_tokens: Максимальный размер контекста в токенах

        Returns:
            Отформатированный контекст для промпта
        """
        pass
