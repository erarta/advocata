"""
Конфигурация приложения

Использует Pydantic Settings для загрузки конфигурации из переменных окружения.
"""

from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Настройки приложения.

    Все настройки загружаются из переменных окружения или .env файла.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = Field(default="Advocata API", description="Название приложения")
    app_version: str = Field(default="0.1.0", description="Версия приложения")
    environment: str = Field(default="development", description="Окружение: development/staging/production")
    debug: bool = Field(default=True, description="Режим отладки")
    secret_key: str = Field(..., description="Секретный ключ приложения")

    # API
    api_v1_prefix: str = Field(default="/api/v1", description="Префикс API v1")
    cors_origins: List[str] = Field(
        default=["http://localhost:3000"],
        description="Разрешенные CORS origins"
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Парсинг CORS origins из строки или списка."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # Database
    database_url: str = Field(
        ...,
        description="URL подключения к PostgreSQL (asyncpg)"
    )
    database_pool_size: int = Field(default=20, description="Размер пула подключений")
    database_max_overflow: int = Field(default=0, description="Максимальное переполнение пула")

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", description="URL подключения к Redis")
    redis_password: str | None = Field(default=None, description="Пароль Redis")

    # Supabase
    supabase_url: str = Field(..., description="URL Supabase проекта")
    supabase_key: str = Field(..., description="Anon ключ Supabase")
    supabase_service_role_key: str = Field(..., description="Service role ключ Supabase")

    # OpenAI
    openai_api_key: str = Field(..., description="API ключ OpenAI")
    openai_embedding_model: str = Field(
        default="text-embedding-3-small",
        description="Модель для embeddings"
    )
    openai_llm_model: str = Field(
        default="gpt-4-turbo-preview",
        description="Модель LLM для чата"
    )

    # Celery
    celery_broker_url: str = Field(
        default="redis://localhost:6379/1",
        description="Broker URL для Celery"
    )
    celery_result_backend: str = Field(
        default="redis://localhost:6379/2",
        description="Result backend для Celery"
    )

    # JWT
    jwt_secret_key: str = Field(..., description="Секретный ключ для JWT")
    jwt_algorithm: str = Field(default="HS256", description="Алгоритм JWT")
    jwt_access_token_expire_minutes: int = Field(
        default=30,
        description="Время жизни access токена (минуты)"
    )
    jwt_refresh_token_expire_days: int = Field(
        default=7,
        description="Время жизни refresh токена (дни)"
    )

    # File Upload
    max_upload_size: int = Field(
        default=104857600,  # 100MB
        description="Максимальный размер загружаемого файла (байты)"
    )
    allowed_extensions: List[str] = Field(
        default=["pdf", "png", "jpg", "jpeg", "txt"],
        description="Разрешенные расширения файлов"
    )

    @field_validator("allowed_extensions", mode="before")
    @classmethod
    def parse_allowed_extensions(cls, v: str | List[str]) -> List[str]:
        """Парсинг разрешенных расширений из строки или списка."""
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(",")]
        return v

    # Email (Optional)
    smtp_host: str | None = Field(default=None, description="SMTP хост")
    smtp_port: int = Field(default=587, description="SMTP порт")
    smtp_user: str | None = Field(default=None, description="SMTP пользователь")
    smtp_password: str | None = Field(default=None, description="SMTP пароль")

    # SMS (Optional - Twilio)
    twilio_account_sid: str | None = Field(default=None, description="Twilio Account SID")
    twilio_auth_token: str | None = Field(default=None, description="Twilio Auth Token")
    twilio_phone_number: str | None = Field(default=None, description="Twilio номер телефона")

    # Monitoring
    sentry_dsn: str | None = Field(default=None, description="Sentry DSN для мониторинга ошибок")
    enable_prometheus: bool = Field(default=True, description="Включить Prometheus метрики")

    # Logging
    log_level: str = Field(default="INFO", description="Уровень логирования")
    log_format: str = Field(default="json", description="Формат логов: json или console")

    @property
    def is_production(self) -> bool:
        """Проверка production окружения."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Проверка development окружения."""
        return self.environment == "development"


@lru_cache()
def get_settings() -> Settings:
    """
    Получить настройки приложения (с кешированием).

    Returns:
        Объект настроек
    """
    return Settings()


# Экземпляр настроек для импорта
settings = get_settings()
