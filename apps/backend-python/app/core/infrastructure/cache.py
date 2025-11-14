"""
Redis Cache Infrastructure

Настройка Redis для кеширования и сессий.
"""

from typing import Optional, Any
import json
from datetime import timedelta

from redis import asyncio as aioredis
from redis.asyncio import Redis

from app.config import settings


class RedisClient:
    """
    Асинхронный Redis клиент для кеширования.

    Предоставляет простой интерфейс для работы с Redis кешом.
    """

    def __init__(self) -> None:
        """Инициализация Redis клиента."""
        self._redis: Optional[Redis] = None

    async def connect(self) -> None:
        """Установить подключение к Redis."""
        self._redis = await aioredis.from_url(
            settings.redis_url,
            password=settings.redis_password,
            encoding="utf-8",
            decode_responses=True,
            max_connections=10,
        )

    async def disconnect(self) -> None:
        """Закрыть подключение к Redis."""
        if self._redis:
            await self._redis.close()

    async def get(self, key: str) -> Optional[str]:
        """
        Получить значение по ключу.

        Args:
            key: Ключ кеша

        Returns:
            Значение или None если ключ не найден
        """
        if not self._redis:
            raise RuntimeError("Redis not connected")
        return await self._redis.get(key)

    async def get_json(self, key: str) -> Optional[Any]:
        """
        Получить JSON значение по ключу.

        Args:
            key: Ключ кеша

        Returns:
            Десериализованный объект или None
        """
        value = await self.get(key)
        if value:
            return json.loads(value)
        return None

    async def set(
        self,
        key: str,
        value: str,
        expire: Optional[timedelta] = None,
    ) -> None:
        """
        Установить значение по ключу.

        Args:
            key: Ключ кеша
            value: Значение
            expire: Время жизни (опционально)
        """
        if not self._redis:
            raise RuntimeError("Redis not connected")

        if expire:
            await self._redis.setex(key, expire, value)
        else:
            await self._redis.set(key, value)

    async def set_json(
        self,
        key: str,
        value: Any,
        expire: Optional[timedelta] = None,
    ) -> None:
        """
        Установить JSON значение по ключу.

        Args:
            key: Ключ кеша
            value: Объект для сериализации
            expire: Время жизни (опционально)
        """
        json_value = json.dumps(value)
        await self.set(key, json_value, expire)

    async def delete(self, key: str) -> None:
        """
        Удалить значение по ключу.

        Args:
            key: Ключ кеша
        """
        if not self._redis:
            raise RuntimeError("Redis not connected")
        await self._redis.delete(key)

    async def exists(self, key: str) -> bool:
        """
        Проверить существование ключа.

        Args:
            key: Ключ кеша

        Returns:
            True если ключ существует
        """
        if not self._redis:
            raise RuntimeError("Redis not connected")
        return bool(await self._redis.exists(key))

    async def expire(self, key: str, time: timedelta) -> None:
        """
        Установить время жизни для ключа.

        Args:
            key: Ключ кеша
            time: Время жизни
        """
        if not self._redis:
            raise RuntimeError("Redis not connected")
        await self._redis.expire(key, time)

    async def increment(self, key: str, amount: int = 1) -> int:
        """
        Инкрементировать числовое значение.

        Args:
            key: Ключ кеша
            amount: Величина инкремента

        Returns:
            Новое значение после инкремента
        """
        if not self._redis:
            raise RuntimeError("Redis not connected")
        return await self._redis.incrby(key, amount)

    async def flush_all(self) -> None:
        """
        Очистить весь кеш.

        Warning:
            Используйте осторожно! Удаляет ВСЕ ключи в Redis.
        """
        if not self._redis:
            raise RuntimeError("Redis not connected")
        await self._redis.flushall()


# Глобальный экземпляр Redis клиента
redis_client = RedisClient()


async def get_redis() -> RedisClient:
    """
    Dependency для получения Redis клиента.

    Returns:
        Redis клиент

    Example:
        ```python
        @router.get("/cached")
        async def get_cached_data(redis: RedisClient = Depends(get_redis)):
            data = await redis.get_json("my_key")
            return data
        ```
    """
    return redis_client
