"""
OpenAI Service Implementation

Сервис для взаимодействия с OpenAI API (GPT-4).
"""
from typing import Optional
import os

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletion

from app.shared.domain.result import Result


class OpenAIService:
    """
    Сервис для генерации ответов с использованием OpenAI GPT-4.

    Implements IAIService protocol из Application Layer.

    Features:
    - Async API вызовы к OpenAI
    - Автоматический подсчет токенов
    - Обработка ошибок
    - Поддержка контекста из RAG
    """

    DEFAULT_MODEL = "gpt-4-turbo-preview"
    DEFAULT_MAX_TOKENS = 1500
    DEFAULT_TEMPERATURE = 0.7

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ):
        """
        Инициализирует OpenAI сервис.

        Args:
            api_key: OpenAI API ключ (если None, берется из env OPENAI_API_KEY)
            model: Модель для использования (default: gpt-4-turbo-preview)
            max_tokens: Максимальное количество токенов в ответе
            temperature: Temperature для генерации (0.0-2.0)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")

        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = model or self.DEFAULT_MODEL
        self.max_tokens = max_tokens or self.DEFAULT_MAX_TOKENS
        self.temperature = temperature or self.DEFAULT_TEMPERATURE

    async def generate_response(
        self,
        conversation_history: list[dict],
        context: Optional[str] = None,
    ) -> Result[tuple[str, int]]:
        """
        Генерирует ответ от AI на основе истории беседы.

        Args:
            conversation_history: История сообщений в формате OpenAI
                [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
            context: Дополнительный контекст из документов (RAG)

        Returns:
            Result с кортежем (текст_ответа, количество_токенов) или ошибкой
        """
        try:
            # Подготавливаем messages для OpenAI
            messages = self._prepare_messages(conversation_history, context)

            # Вызываем OpenAI API
            response: ChatCompletion = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )

            # Извлекаем ответ
            if not response.choices or len(response.choices) == 0:
                return Result.fail("No response from OpenAI")

            message_content = response.choices[0].message.content
            if not message_content:
                return Result.fail("Empty response from OpenAI")

            # Подсчитываем токены
            token_count = response.usage.total_tokens if response.usage else 0

            return Result.ok((message_content, token_count))

        except Exception as e:
            return Result.fail(f"OpenAI API error: {str(e)}")

    def _prepare_messages(
        self,
        conversation_history: list[dict],
        context: Optional[str] = None,
    ) -> list[dict]:
        """
        Подготавливает сообщения для OpenAI API.

        Args:
            conversation_history: История беседы
            context: Контекст из документов

        Returns:
            Список сообщений для OpenAI
        """
        messages = []

        # Добавляем system prompt
        system_prompt = self._build_system_prompt(context)
        messages.append({"role": "system", "content": system_prompt})

        # Добавляем историю беседы
        messages.extend(conversation_history)

        return messages

    def _build_system_prompt(self, context: Optional[str] = None) -> str:
        """
        Строит system prompt для AI ассистента.

        Args:
            context: Контекст из документов (RAG)

        Returns:
            System prompt
        """
        base_prompt = """Вы — профессиональный юридический AI-ассистент платформы Advocata.

Ваша задача:
- Предоставлять точные юридические консультации на основе российского законодательства
- Отвечать понятным языком, адаптированным для обычных граждан
- Ссылаться на конкретные статьи законов при необходимости
- Если информации недостаточно, задавать уточняющие вопросы
- При сложных вопросах рекомендовать обращение к юристу

Важно:
- Не давайте советов, которые могут навредить пользователю
- Объясняйте юридические термины простым языком
- Будьте вежливы и профессиональны
"""

        # Добавляем контекст из документов если есть
        if context:
            base_prompt += f"\n\nКонтекст из документов пользователя:\n{context}\n\n"
            base_prompt += "Используйте этот контекст для более точных и персонализированных ответов."

        return base_prompt

    async def count_tokens(self, text: str) -> int:
        """
        Подсчитывает количество токенов в тексте.

        Note: Это упрощенная оценка. Для точного подсчета используйте tiktoken.

        Args:
            text: Текст для подсчета

        Returns:
            Приблизительное количество токенов
        """
        # Упрощенная оценка: ~4 символа = 1 токен для русского языка
        return len(text) // 4
