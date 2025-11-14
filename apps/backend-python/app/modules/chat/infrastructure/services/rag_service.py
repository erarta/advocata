"""
RAG Service Implementation

Сервис для Retrieval-Augmented Generation с использованием pgvector.
"""
from typing import List, Optional
from uuid import UUID
import os

from openai import AsyncOpenAI
from sqlalchemy import select, text, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.domain.result import Result
from app.modules.chat.domain.services.rag_service import IRAGService, DocumentChunk
from app.modules.document.infrastructure.persistence.models.document_model import (
    DocumentModel,
)


class RAGServiceImpl(IRAGService):
    """
    Реализация RAG сервиса с использованием pgvector и OpenAI Embeddings.

    Features:
    - Векторный поиск по документам (semantic search)
    - Создание embeddings через OpenAI
    - Построение контекста для AI
    - Чанкирование документов (разбиение на части)
    """

    # OpenAI Embeddings модель
    EMBEDDING_MODEL = "text-embedding-3-small"  # 1536 dimensions
    EMBEDDING_DIMENSIONS = 1536

    # Чанкирование
    CHUNK_SIZE = 1000  # Символов в одном чанке
    CHUNK_OVERLAP = 200  # Перекрытие между чанками

    def __init__(
        self,
        session: AsyncSession,
        openai_api_key: Optional[str] = None,
    ):
        """
        Инициализирует RAG сервис.

        Args:
            session: Async SQLAlchemy сессия
            openai_api_key: OpenAI API ключ (если None, берется из env)
        """
        self.session = session
        self.api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required for RAG")

        self.client = AsyncOpenAI(api_key=self.api_key)

    async def search_relevant_documents(
        self,
        user_id: UUID,
        query: str,
        top_k: int = 5,
        min_similarity: float = 0.7,
    ) -> Result[List[DocumentChunk]]:
        """
        Ищет релевантные документы пользователя на основе запроса.

        Args:
            user_id: ID пользователя
            query: Поисковый запрос
            top_k: Количество результатов
            min_similarity: Минимальное сходство (0.0-1.0)

        Returns:
            Result со списком DocumentChunk или ошибкой
        """
        try:
            # 1. Создаем embedding для запроса
            query_embedding_result = await self._create_embedding(query)
            if not query_embedding_result.is_success:
                return Result.fail(query_embedding_result.error)

            query_embedding = query_embedding_result.value

            # 2. Выполняем векторный поиск
            # Note: Требуется таблица document_embeddings с колонкой embedding типа vector
            # Для MVP используем простой text search по extracted_text
            # TODO: Заменить на полноценный vector search когда будет миграция
            chunks = await self._simple_text_search(
                user_id=user_id,
                query=query,
                top_k=top_k,
            )

            return Result.ok(chunks)

        except Exception as e:
            return Result.fail(f"RAG search error: {str(e)}")

    async def index_document(
        self,
        document_id: str,
        content: str,
        metadata: dict,
    ) -> Result[None]:
        """
        Индексирует документ (создает embeddings).

        Args:
            document_id: ID документа
            content: Текст документа
            metadata: Метаданные документа

        Returns:
            Result с None или ошибкой
        """
        try:
            # 1. Разбиваем документ на чанки
            chunks = self._chunk_text(content)

            # 2. Создаем embeddings для каждого чанка
            for i, chunk_text in enumerate(chunks):
                embedding_result = await self._create_embedding(chunk_text)
                if not embedding_result.is_success:
                    return Result.fail(
                        f"Failed to create embedding for chunk {i}: {embedding_result.error}"
                    )

                embedding = embedding_result.value

                # 3. Сохраняем в БД (document_embeddings table)
                # TODO: Реализовать сохранение когда будет миграция
                # await self._save_embedding(document_id, i, chunk_text, embedding, metadata)

            return Result.ok(None)

        except Exception as e:
            return Result.fail(f"Document indexing error: {str(e)}")

    async def build_context(
        self,
        query: str,
        chunks: List[DocumentChunk],
        max_tokens: int = 4000,
    ) -> str:
        """
        Строит контекст для AI из найденных чанков.

        Args:
            query: Поисковый запрос
            chunks: Список найденных чанков
            max_tokens: Максимальное количество токенов

        Returns:
            Контекст в текстовом формате
        """
        if not chunks:
            return ""

        # Оцениваем количество символов (~4 символа = 1 токен)
        max_chars = max_tokens * 4

        context_parts = []
        current_length = 0

        for chunk in chunks:
            # Форматируем чанк
            chunk_text = f"[Документ: {chunk.document_title}]\n{chunk.content}\n"
            chunk_length = len(chunk_text)

            # Проверяем лимит
            if current_length + chunk_length > max_chars:
                break

            context_parts.append(chunk_text)
            current_length += chunk_length

        # Собираем контекст
        context = "\n---\n".join(context_parts)

        return context

    async def _create_embedding(self, text: str) -> Result[List[float]]:
        """
        Создает embedding для текста через OpenAI.

        Args:
            text: Текст для embedding

        Returns:
            Result со списком float (вектор) или ошибкой
        """
        try:
            # Вызываем OpenAI Embeddings API
            response = await self.client.embeddings.create(
                model=self.EMBEDDING_MODEL,
                input=text,
            )

            if not response.data or len(response.data) == 0:
                return Result.fail("No embedding returned from OpenAI")

            embedding = response.data[0].embedding
            return Result.ok(embedding)

        except Exception as e:
            return Result.fail(f"Embedding creation error: {str(e)}")

    def _chunk_text(self, text: str) -> List[str]:
        """
        Разбивает текст на чанки с перекрытием.

        Args:
            text: Исходный текст

        Returns:
            Список чанков
        """
        chunks = []
        start = 0

        while start < len(text):
            # Извлекаем чанк
            end = start + self.CHUNK_SIZE
            chunk = text[start:end]

            # Пытаемся разбить по предложению (точка + пробел)
            if end < len(text):
                last_period = chunk.rfind(". ")
                if last_period > self.CHUNK_SIZE // 2:
                    end = start + last_period + 1
                    chunk = text[start:end]

            chunks.append(chunk.strip())

            # Следующий чанк с перекрытием
            start = end - self.CHUNK_OVERLAP

        return chunks

    async def _simple_text_search(
        self,
        user_id: UUID,
        query: str,
        top_k: int,
    ) -> List[DocumentChunk]:
        """
        Простой текстовый поиск (временная реализация для MVP).

        Note: Это не настоящий semantic search, а простой ILIKE поиск.
        Заменить на vector search когда будет миграция с document_embeddings.

        Args:
            user_id: ID пользователя
            query: Поисковый запрос
            top_k: Количество результатов

        Returns:
            Список DocumentChunk
        """
        # Поиск документов с текстом похожим на запрос
        search_pattern = f"%{query}%"

        stmt = (
            select(DocumentModel)
            .where(DocumentModel.owner_id == str(user_id))
            .where(DocumentModel.extracted_text.ilike(search_pattern))
            .where(DocumentModel.extracted_text.isnot(None))
            .limit(top_k)
        )

        result = await self.session.execute(stmt)
        documents = result.scalars().all()

        # Конвертируем в DocumentChunk
        chunks = []
        for doc in documents:
            if doc.extracted_text:
                # Берем первые N символов как чанк
                chunk_content = doc.extracted_text[:1000]

                chunk = DocumentChunk(
                    document_id=doc.id,
                    document_title=doc.title,
                    content=chunk_content,
                    similarity_score=0.8,  # Dummy score для MVP
                    metadata={
                        "document_type": doc.document_type,
                        "category": doc.category,
                    },
                )
                chunks.append(chunk)

        return chunks
