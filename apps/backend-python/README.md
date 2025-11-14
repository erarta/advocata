# Advocata Backend (Python FastAPI)

**Advocata API** - Backend система для платформы юридических услуг "Uber for lawyers".

## 🎯 Описание

Полнофункциональный backend на Python FastAPI с:
- 🏗️ **DDD Architecture** - Domain-Driven Design
- 🔄 **CQRS Pattern** - Command Query Responsibility Segregation
- 🤖 **RAG AI System** - Чат-бот с GPT-4 и векторным поиском
- 📄 **Document Processing** - Обработка PDF/изображений с OCR
- 🔐 **JWT Authentication** - Безопасная аутентификация
- ⚡ **Async Everything** - Полностью асинхронная архитектура

## 📋 Требования

- **Python**: 3.11+
- **PostgreSQL**: 14+ с расширением `pgvector`
- **Redis**: 7+
- **Poetry**: 1.7+ (или pip)

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# С использованием Poetry (рекомендуется)
poetry install

# Или с pip
pip install -r requirements.txt
```

### 2. Настройка окружения

```bash
# Копировать пример .env
cp .env.example .env

# Отредактировать .env файл
nano .env
```

Обязательные переменные:
```env
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql+asyncpg://user:password@localhost/advocata
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key
OPENAI_API_KEY=sk-your-key
JWT_SECRET_KEY=your-jwt-secret
```

### 3. Инициализация базы данных

```bash
# Создать базу данных
createdb advocata

# Установить расширение pgvector
psql advocata -c "CREATE EXTENSION vector;"

# Применить миграции
alembic upgrade head
```

### 4. Запуск приложения

```bash
# Development сервер
uvicorn app.main:app --reload --port 8000

# Или через Poetry
poetry run uvicorn app.main:app --reload

# Или через Python
python -m app.main
```

API доступно на: http://localhost:8000

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📁 Структура проекта

```
apps/backend-python/
├── app/
│   ├── main.py                    # FastAPI приложение
│   ├── config.py                  # Конфигурация
│   │
│   ├── core/                      # Shared Kernel
│   │   ├── domain/                # DDD базовые классы
│   │   │   ├── entity.py
│   │   │   ├── aggregate_root.py
│   │   │   ├── value_object.py
│   │   │   ├── domain_event.py
│   │   │   └── result.py
│   │   └── infrastructure/        # База данных, кеш
│   │       └── database.py
│   │
│   ├── modules/                   # Bounded Contexts
│   │   ├── identity/              # Аутентификация
│   │   ├── lawyer/                # Юристы
│   │   ├── document/              # Документы
│   │   └── chat/                  # AI чат
│   │
│   └── api/                       # API композиция
│       └── v1/
│
├── tests/                         # Тесты
├── alembic/                       # Миграции БД
├── docs/                          # Документация
├── scripts/                       # Утилиты
│
├── pyproject.toml                 # Poetry конфигурация
├── .env.example                   # Пример переменных
├── Dockerfile                     # Docker образ
└── README.md                      # Этот файл
```

## 🏗️ Архитектура

### Domain-Driven Design Layers:

```
┌─────────────────────────────────┐
│   Presentation Layer (API)      │
│   - FastAPI Routers             │
│   - Pydantic Schemas            │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Application Layer             │
│   - Commands & Queries (CQRS)  │
│   - DTOs                        │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Domain Layer                  │
│   - Entities & Aggregates       │
│   - Value Objects               │
│   - Domain Events               │
│   - Business Logic              │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Infrastructure Layer          │
│   - SQLAlchemy Models           │
│   - Repositories Implementation │
│   - External Services           │
└─────────────────────────────────┘
```

## 🧪 Тестирование

```bash
# Запустить все тесты
pytest

# С coverage
pytest --cov=app --cov-report=html

# Только unit тесты
pytest tests/unit -m unit

# Только integration тесты
pytest tests/integration -m integration

# E2E тесты
pytest tests/e2e -m e2e
```

## 📊 Code Quality

```bash
# Форматирование кода
black app tests

# Линтинг
ruff check app tests

# Type checking
mypy app
```

## 🐳 Docker

```bash
# Собрать образ
docker build -t advocata-backend .

# Запустить контейнер
docker run -p 8000:8000 --env-file .env advocata-backend

# Docker Compose (с PostgreSQL и Redis)
docker-compose up
```

## 📚 Документация

Полная документация доступна в директории `docs/`:

- [Архитектура](docs/architecture.md)
- [API Reference](docs/api/)
- [Identity Module](docs/modules/identity.md)
- [Lawyer Module](docs/modules/lawyer.md)
- [Document Module](docs/modules/document.md)
- [Chat Module](docs/modules/chat.md)
- [Deployment](docs/deployment.md)

### Генерация документации:

```bash
# MkDocs
mkdocs serve

# Документация доступна на http://localhost:8001
```

## 🔧 Разработка

### Создание миграции:

```bash
# Автогенерация миграции
alembic revision --autogenerate -m "Add users table"

# Применить миграции
alembic upgrade head

# Откатить миграцию
alembic downgrade -1
```

### Фоновые задачи (Celery):

```bash
# Запустить Celery worker
celery -A app.celery_app worker --loglevel=info

# Запустить Flower (мониторинг)
celery -A app.celery_app flower --port=5555
```

## 🌐 Переменные окружения

См. `.env.example` для полного списка переменных.

Ключевые настройки:

| Переменная | Описание | По умолчанию |
|-----------|----------|--------------|
| `DATABASE_URL` | PostgreSQL URL | - |
| `REDIS_URL` | Redis URL | `redis://localhost:6379/0` |
| `OPENAI_API_KEY` | OpenAI API ключ | - |
| `SUPABASE_URL` | Supabase проект URL | - |
| `JWT_SECRET_KEY` | JWT секрет | - |
| `ENVIRONMENT` | development/production | `development` |

## 📈 Мониторинг

- **Prometheus метрики**: `/metrics`
- **Health Check**: `/health`
- **OpenAPI схема**: `/api/v1/openapi.json`

## 🤝 Contributing

1. Создайте feature branch (`git checkout -b feature/amazing-feature`)
2. Commit изменения (`git commit -m 'Add amazing feature'`)
3. Push в branch (`git push origin feature/amazing-feature`)
4. Откройте Pull Request

### Code Style:

- Используйте **Black** для форматирования
- Следуйте **PEP 8**
- Пишите **docstrings** (Google style)
- Поддерживайте **type hints**
- Покрытие тестами **80%+**

## 📝 Лицензия

Proprietary - Erarta Team

## 👥 Авторы

- **Erarta Team** - [modera@erarta.ai](mailto:modera@erarta.ai)

## 🔗 Ссылки

- [Полный план миграции](../../MIGRATION_PLAN_PYTHON.md)
- [FastAPI Документация](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [LangChain](https://python.langchain.com/)

---

**Версия:** 0.1.0
**Последнее обновление:** 2025-11-14
