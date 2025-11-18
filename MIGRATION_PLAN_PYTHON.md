# План миграции Backend на Python FastAPI

## 📊 Текущее состояние (NestJS)

### ✅ Реализовано:
1. **Identity Module** - Аутентификация и авторизация
2. **Lawyer Module** - Управление юристами
3. **Document Module** - Управление документами
4. **RAG Query Engine** - AI чат-бот с LLM

### 🗄️ Текущая архитектура:
- TypeScript + NestJS
- Domain-Driven Design (DDD)
- CQRS Pattern
- Clean Architecture (Domain → Application → Infrastructure → Presentation)
- TypeORM + PostgreSQL
- Supabase для хранения файлов
- BullMQ для фоновых задач
- OpenAI для embeddings и LLM

---

## 🎯 Целевая архитектура (Python FastAPI)

### Технологический стек:

#### Core Framework:
- **FastAPI** - современный веб-фреймворк с автоматической OpenAPI документацией
- **Python 3.11+** - последняя стабильная версия
- **Pydantic v2** - валидация данных и настройки
- **asyncio** - асинхронное программирование

#### Database & ORM:
- **SQLAlchemy 2.0** - ORM с async поддержкой
- **Alembic** - миграции базы данных
- **PostgreSQL** - основная БД
- **pgvector** - расширение для векторного поиска

#### Authentication & Security:
- **python-jose** - JWT токены
- **passlib** - хеширование паролей
- **python-multipart** - загрузка файлов

#### Background Tasks:
- **Celery** - распределенная очередь задач
- **Redis** - брокер сообщений и кеш
- **Flower** - мониторинг Celery

#### RAG & AI:
- **LangChain** - фреймворк для RAG
- **OpenAI** - embeddings (text-embedding-3-small) и LLM (GPT-4)
- **Supabase Python SDK** - хранилище файлов
- **PyPDF2** / **pdfplumber** - парсинг PDF
- **pytesseract** - OCR для изображений
- **sentence-transformers** - альтернативные embeddings (опционально)

#### Testing & Quality:
- **pytest** - тестирование
- **pytest-asyncio** - async тесты
- **httpx** - HTTP клиент для тестов
- **black** - форматирование кода
- **ruff** - линтер
- **mypy** - проверка типов

#### Documentation:
- **FastAPI автодокументация** - OpenAPI/Swagger
- **mkdocs** - документация проекта
- **pydantic-docs** - документация схем данных

---

## 📁 Структура проекта

```
apps/backend-python/
├── app/
│   ├── main.py                          # Точка входа FastAPI
│   ├── config.py                        # Конфигурация приложения
│   │
│   ├── core/                            # Ядро приложения (Shared Kernel)
│   │   ├── domain/
│   │   │   ├── __init__.py
│   │   │   ├── entity.py                # Базовый Entity класс
│   │   │   ├── aggregate_root.py        # AggregateRoot класс
│   │   │   ├── value_object.py          # ValueObject класс
│   │   │   ├── domain_event.py          # DomainEvent класс
│   │   │   └── result.py                # Result pattern
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── __init__.py
│   │   │   ├── database.py              # Конфигурация БД
│   │   │   ├── cache.py                 # Redis кеш
│   │   │   ├── event_bus.py             # Event Bus
│   │   │   └── dependencies.py          # Dependency Injection
│   │   │
│   │   └── middleware/
│   │       ├── __init__.py
│   │       ├── error_handler.py         # Обработка ошибок
│   │       ├── logging.py               # Логирование
│   │       └── cors.py                  # CORS настройки
│   │
│   ├── modules/                         # Bounded Contexts
│   │   │
│   │   ├── identity/                    # Identity & Access Context
│   │   │   ├── __init__.py
│   │   │   ├── README.md                # Документация модуля
│   │   │   │
│   │   │   ├── domain/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── entities/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   └── user.py          # User aggregate
│   │   │   │   ├── value_objects/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── email.py
│   │   │   │   │   ├── phone.py
│   │   │   │   │   └── user_role.py
│   │   │   │   ├── events/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── user_registered.py
│   │   │   │   │   └── user_verified.py
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   └── user_repository.py  # Abstract interface
│   │   │   │   └── services/
│   │   │   │       ├── __init__.py
│   │   │   │       └── auth_service.py     # Domain service
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── commands/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── register_user.py
│   │   │   │   │   ├── verify_otp.py
│   │   │   │   │   └── login_user.py
│   │   │   │   ├── queries/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── get_user.py
│   │   │   │   │   └── get_current_user.py
│   │   │   │   └── dtos/
│   │   │   │       ├── __init__.py
│   │   │   │       ├── user_dto.py
│   │   │   │       └── auth_dto.py
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── models/
│   │   │   │   │   │   ├── __init__.py
│   │   │   │   │   │   └── user_model.py    # SQLAlchemy модель
│   │   │   │   │   ├── mappers/
│   │   │   │   │   │   ├── __init__.py
│   │   │   │   │   │   └── user_mapper.py
│   │   │   │   │   └── repositories/
│   │   │   │   │       ├── __init__.py
│   │   │   │   │       └── user_repository_impl.py
│   │   │   │   └── services/
│   │   │   │       ├── __init__.py
│   │   │   │       ├── jwt_service.py
│   │   │   │       ├── otp_service.py
│   │   │   │       └── password_service.py
│   │   │   │
│   │   │   └── presentation/
│   │   │       ├── __init__.py
│   │   │       ├── api/
│   │   │       │   ├── __init__.py
│   │   │       │   └── auth_router.py       # FastAPI router
│   │   │       ├── schemas/
│   │   │       │   ├── __init__.py
│   │   │       │   ├── requests.py          # Pydantic request schemas
│   │   │       │   └── responses.py         # Pydantic response schemas
│   │   │       └── dependencies/
│   │   │           ├── __init__.py
│   │   │           └── auth_deps.py         # Dependency injection
│   │   │
│   │   ├── lawyer/                      # Lawyer Management Context
│   │   │   ├── README.md
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── lawyer.py
│   │   │   │   ├── value_objects/
│   │   │   │   │   ├── specialization.py
│   │   │   │   │   ├── experience.py
│   │   │   │   │   └── verification_status.py
│   │   │   │   ├── events/
│   │   │   │   │   ├── lawyer_registered.py
│   │   │   │   │   └── lawyer_verified.py
│   │   │   │   ├── repositories/
│   │   │   │   │   └── lawyer_repository.py
│   │   │   │   └── services/
│   │   │   │       └── verification_service.py
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── register_lawyer.py
│   │   │   │   │   ├── verify_lawyer.py
│   │   │   │   │   └── update_availability.py
│   │   │   │   ├── queries/
│   │   │   │   │   ├── search_lawyers.py
│   │   │   │   │   ├── get_lawyer.py
│   │   │   │   │   └── get_top_rated.py
│   │   │   │   └── dtos/
│   │   │   │       └── lawyer_dto.py
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── models/
│   │   │   │   │   │   └── lawyer_model.py
│   │   │   │   │   ├── mappers/
│   │   │   │   │   │   └── lawyer_mapper.py
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── lawyer_repository_impl.py
│   │   │   │   └── services/
│   │   │   │       └── geo_service.py
│   │   │   └── presentation/
│   │   │       ├── api/
│   │   │       │   └── lawyer_router.py
│   │   │       └── schemas/
│   │   │           ├── requests.py
│   │   │           └── responses.py
│   │   │
│   │   ├── document/                    # Document Management Context
│   │   │   ├── README.md
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── document.py
│   │   │   │   │   └── document_chunk.py
│   │   │   │   ├── value_objects/
│   │   │   │   │   ├── document_type.py
│   │   │   │   │   ├── document_status.py
│   │   │   │   │   └── document_category.py
│   │   │   │   ├── events/
│   │   │   │   │   ├── document_uploaded.py
│   │   │   │   │   └── document_processed.py
│   │   │   │   ├── repositories/
│   │   │   │   │   └── document_repository.py
│   │   │   │   └── services/
│   │   │   │       ├── storage_service.py     # Abstract interface
│   │   │   │       └── processor_service.py   # Abstract interface
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── upload_document.py
│   │   │   │   │   ├── process_document.py
│   │   │   │   │   └── delete_document.py
│   │   │   │   ├── queries/
│   │   │   │   │   ├── search_documents.py
│   │   │   │   │   ├── get_document.py
│   │   │   │   │   └── search_similar.py
│   │   │   │   └── dtos/
│   │   │   │       └── document_dto.py
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── models/
│   │   │   │   │   │   ├── document_model.py
│   │   │   │   │   │   └── chunk_model.py
│   │   │   │   │   ├── mappers/
│   │   │   │   │   │   ├── document_mapper.py
│   │   │   │   │   │   └── chunk_mapper.py
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── document_repository_impl.py
│   │   │   │   ├── services/
│   │   │   │   │   ├── supabase_storage.py
│   │   │   │   │   └── document_processor.py  # PDF/OCR/Chunking
│   │   │   │   └── tasks/
│   │   │   │       └── process_document_task.py  # Celery task
│   │   │   └── presentation/
│   │   │       ├── api/
│   │   │       │   └── document_router.py
│   │   │       └── schemas/
│   │   │           ├── requests.py
│   │   │           └── responses.py
│   │   │
│   │   └── chat/                        # RAG Chat Context
│   │       ├── README.md
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   ├── conversation.py
│   │       │   │   └── message.py
│   │       │   ├── value_objects/
│   │       │   │   └── message_role.py
│   │       │   ├── repositories/
│   │       │   │   └── conversation_repository.py
│   │       │   └── services/
│   │       │       ├── llm_service.py         # Abstract interface
│   │       │       └── embedding_service.py   # Abstract interface
│   │       ├── application/
│   │       │   ├── commands/
│   │       │   │   └── create_conversation.py
│   │       │   ├── queries/
│   │       │   │   ├── ask_question.py        # RAG query handler
│   │       │   │   └── get_conversation.py
│   │       │   └── dtos/
│   │       │       └── chat_dto.py
│   │       ├── infrastructure/
│   │       │   ├── persistence/
│   │       │   │   ├── models/
│   │       │   │   │   ├── conversation_model.py
│   │       │   │   │   └── message_model.py
│   │       │   │   └── repositories/
│   │       │   │       └── conversation_repository_impl.py
│   │       │   └── services/
│   │       │       ├── openai_llm.py          # OpenAI GPT-4
│   │       │       ├── openai_embeddings.py   # OpenAI embeddings
│   │       │       └── rag_service.py         # LangChain RAG pipeline
│   │       └── presentation/
│   │           ├── api/
│   │           │   └── chat_router.py
│   │           └── schemas/
│   │               ├── requests.py
│   │               └── responses.py
│   │
│   └── api/                             # API композиция
│       ├── __init__.py
│       ├── v1/
│       │   ├── __init__.py
│       │   └── router.py                # Главный роутер API v1
│       └── deps.py                      # Общие dependencies
│
├── tests/                               # Тесты
│   ├── unit/
│   │   ├── identity/
│   │   ├── lawyer/
│   │   ├── document/
│   │   └── chat/
│   ├── integration/
│   │   ├── api/
│   │   └── repositories/
│   ├── e2e/
│   │   └── scenarios/
│   └── conftest.py
│
├── alembic/                             # Миграции БД
│   ├── versions/
│   └── env.py
│
├── docs/                                # Документация
│   ├── index.md
│   ├── architecture.md
│   ├── api/
│   ├── modules/
│   │   ├── identity.md
│   │   ├── lawyer.md
│   │   ├── document.md
│   │   └── chat.md
│   └── deployment.md
│
├── scripts/                             # Утилиты
│   ├── init_db.py
│   ├── seed_data.py
│   └── run_migrations.py
│
├── .env.example                         # Пример переменных окружения
├── .gitignore
├── README.md                            # Главная документация
├── pyproject.toml                       # Poetry конфигурация
├── requirements.txt                     # Зависимости (для Docker)
├── Dockerfile                           # Docker образ
├── docker-compose.yml                   # Локальная разработка
├── alembic.ini                          # Alembic конфигурация
├── pytest.ini                           # Pytest конфигурация
├── ruff.toml                            # Ruff линтер
└── mypy.ini                             # MyPy конфигурация
```

---

## 🚀 План реализации

### Phase 1: Базовая инфраструктура (Week 1)

#### 1.1 Инициализация проекта
- [ ] Создать структуру папок
- [ ] Настроить Poetry / pip-tools
- [ ] Создать pyproject.toml с зависимостями
- [ ] Настроить Docker и docker-compose
- [ ] Настроить .env конфигурацию

#### 1.2 Core Layer (Shared Kernel)
- [ ] Базовые классы DDD (Entity, AggregateRoot, ValueObject)
- [ ] Result pattern для обработки ошибок
- [ ] DomainEvent система
- [ ] EventBus для доменных событий
- [ ] Dependency Injection контейнер

#### 1.3 Database & Infrastructure
- [ ] SQLAlchemy настройка (async engine)
- [ ] Alembic миграции
- [ ] Redis подключение
- [ ] Supabase Python SDK
- [ ] Middleware (CORS, логирование, ошибки)

#### 1.4 FastAPI Setup
- [ ] Main app с роутерами
- [ ] OpenAPI конфигурация
- [ ] Health check endpoint
- [ ] Swagger UI кастомизация

**Документация:**
- [ ] README.md для проекта
- [ ] ARCHITECTURE.md с DDD диаграммами
- [ ] SETUP.md с инструкциями запуска

---

### Phase 2: Identity Module (Week 2)

#### 2.1 Domain Layer
- [ ] User aggregate (entity)
- [ ] Email, Phone, UserRole value objects
- [ ] UserRegisteredEvent, UserVerifiedEvent
- [ ] IUserRepository interface
- [ ] AuthDomainService

#### 2.2 Application Layer
- [ ] RegisterUserCommand + Handler
- [ ] VerifyOTPCommand + Handler
- [ ] LoginUserCommand + Handler
- [ ] GetCurrentUserQuery + Handler
- [ ] UserDTO, AuthDTO

#### 2.3 Infrastructure Layer
- [ ] UserModel (SQLAlchemy)
- [ ] UserMapper (domain ↔ model)
- [ ] UserRepositoryImpl
- [ ] JWTService (создание/валидация токенов)
- [ ] OTPService (генерация/отправка OTP)
- [ ] PasswordService (хеширование)

#### 2.4 Presentation Layer
- [ ] AuthRouter (/api/v1/auth)
  - POST /register
  - POST /verify-otp
  - POST /login
  - GET /me
- [ ] Pydantic schemas (requests/responses)
- [ ] Auth dependencies (get_current_user)

#### 2.5 Tests
- [ ] Unit tests для domain entities
- [ ] Unit tests для command/query handlers
- [ ] Integration tests для repository
- [ ] API tests для всех endpoints

**Документация:**
- [ ] modules/identity/README.md
- [ ] API endpoints описание
- [ ] Sequence diagrams для auth flow

---

### Phase 3: Lawyer Module (Week 3)

#### 3.1 Domain Layer
- [ ] Lawyer aggregate
- [ ] Specialization, Experience, VerificationStatus VO
- [ ] LawyerRegisteredEvent, LawyerVerifiedEvent
- [ ] ILawyerRepository interface
- [ ] VerificationService

#### 3.2 Application Layer
- [ ] RegisterLawyerCommand + Handler
- [ ] VerifyLawyerCommand + Handler
- [ ] UpdateAvailabilityCommand + Handler
- [ ] SearchLawyersQuery + Handler (с фильтрами)
- [ ] GetLawyerQuery + Handler
- [ ] GetTopRatedQuery + Handler
- [ ] LawyerDTO

#### 3.3 Infrastructure Layer
- [ ] LawyerModel (SQLAlchemy)
- [ ] LawyerMapper
- [ ] LawyerRepositoryImpl (с полнотекстовым поиском)
- [ ] GeoService (расчет расстояния)

#### 3.4 Presentation Layer
- [ ] LawyerRouter (/api/v1/lawyers)
  - POST /lawyers (регистрация)
  - GET /lawyers (поиск с фильтрами)
  - GET /lawyers/{id}
  - PUT /lawyers/{id}/availability
  - GET /lawyers/top-rated
- [ ] Pydantic schemas

#### 3.5 Tests
- [ ] Unit + Integration + API tests

**Документация:**
- [ ] modules/lawyer/README.md
- [ ] Search API примеры
- [ ] Verification flow

---

### Phase 4: Document Module (Week 4)

#### 4.1 Domain Layer
- [ ] Document aggregate
- [ ] DocumentChunk entity
- [ ] DocumentType, DocumentStatus, DocumentCategory VO
- [ ] DocumentUploadedEvent, DocumentProcessedEvent
- [ ] IDocumentRepository interface
- [ ] IStorageService interface
- [ ] IProcessorService interface

#### 4.2 Application Layer
- [ ] UploadDocumentCommand + Handler
- [ ] ProcessDocumentCommand + Handler (Celery task)
- [ ] DeleteDocumentCommand + Handler
- [ ] SearchDocumentsQuery + Handler
- [ ] GetDocumentQuery + Handler
- [ ] SearchSimilarQuery + Handler (vector search)
- [ ] DocumentDTO

#### 4.3 Infrastructure Layer
- [ ] DocumentModel, ChunkModel (SQLAlchemy с pgvector)
- [ ] DocumentMapper, ChunkMapper
- [ ] DocumentRepositoryImpl (с векторным поиском)
- [ ] SupabaseStorageService (upload/download/delete)
- [ ] DocumentProcessorService:
  - PDF парсинг (PyPDF2/pdfplumber)
  - OCR для изображений (pytesseract)
  - Text chunking (sentence splitting)
  - OpenAI embeddings generation
- [ ] ProcessDocumentTask (Celery)

#### 4.4 Presentation Layer
- [ ] DocumentRouter (/api/v1/documents)
  - POST /documents/upload (multipart/form-data)
  - GET /documents (search)
  - GET /documents/{id}
  - DELETE /documents/{id}
  - GET /documents/{id}/status
- [ ] Pydantic schemas

#### 4.5 Tests
- [ ] Unit + Integration + API tests
- [ ] Mock OpenAI API для тестов

**Документация:**
- [ ] modules/document/README.md
- [ ] File upload guide
- [ ] Processing pipeline diagram

---

### Phase 5: Chat Module + RAG (Week 5)

#### 5.1 Domain Layer
- [ ] Conversation aggregate
- [ ] Message entity
- [ ] MessageRole VO
- [ ] IConversationRepository
- [ ] ILLMService interface
- [ ] IEmbeddingService interface

#### 5.2 Application Layer
- [ ] CreateConversationCommand + Handler
- [ ] AskQuestionQuery + Handler (RAG pipeline)
- [ ] GetConversationQuery + Handler
- [ ] ChatDTO

#### 5.3 Infrastructure Layer
- [ ] ConversationModel, MessageModel
- [ ] ConversationRepositoryImpl
- [ ] OpenAILLMService (GPT-4 Turbo)
- [ ] OpenAIEmbeddingService (text-embedding-3-small)
- [ ] RAGService (LangChain integration):
  - Question embedding
  - Vector similarity search (top-5 chunks)
  - Context building
  - Prompt engineering (Russian legal context)
  - LLM generation
  - Citation tracking

#### 5.4 Presentation Layer
- [ ] ChatRouter (/api/v1/chat)
  - POST /chat/conversations
  - GET /chat/conversations/{id}
  - POST /chat/ask
  - POST /chat/ask/stream (SSE)
- [ ] Pydantic schemas
- [ ] WebSocket support (опционально)

#### 5.5 Tests
- [ ] Unit + Integration + API tests
- [ ] RAG pipeline integration tests

**Документация:**
- [ ] modules/chat/README.md
- [ ] RAG architecture diagram
- [ ] Prompt engineering guide

---

### Phase 6: Admin Panel Integration (Week 6)

#### 6.1 Admin Endpoints
- [ ] Admin middleware/decorator
- [ ] DocumentRouter admin endpoints:
  - GET /admin/documents (все документы)
  - PUT /admin/documents/{id}/visibility
  - GET /admin/documents/stats
- [ ] LawyerRouter admin endpoints:
  - GET /admin/lawyers/pending
  - POST /admin/lawyers/{id}/verify
  - POST /admin/lawyers/{id}/reject

#### 6.2 Analytics & Monitoring
- [ ] Prometheus metrics endpoint
- [ ] Sentry integration для ошибок
- [ ] Structured logging (JSON)

**Документация:**
- [ ] Admin API reference
- [ ] Monitoring setup guide

---

### Phase 7: Testing & Documentation (Week 7)

#### 7.1 Comprehensive Testing
- [ ] Достичь 80%+ code coverage
- [ ] Performance тесты (load testing)
- [ ] Security тесты (OWASP)
- [ ] E2E тесты для критичных сценариев

#### 7.2 Documentation
- [ ] Полная OpenAPI спецификация
- [ ] MkDocs сайт с документацией
- [ ] Postman коллекция
- [ ] Architecture Decision Records (ADR)

#### 7.3 CI/CD
- [ ] GitHub Actions:
  - Линтеры (ruff, mypy, black)
  - Tests (pytest)
  - Coverage reports
  - Docker build & push
- [ ] Pre-commit hooks

**Документация:**
- [ ] CONTRIBUTING.md
- [ ] CODE_STYLE.md
- [ ] TESTING.md

---

### Phase 8: Deployment (Week 8)

#### 8.1 Docker Optimization
- [ ] Multi-stage Dockerfile
- [ ] Docker Compose для production
- [ ] Nginx reverse proxy конфигурация

#### 8.2 Database
- [ ] Production миграции
- [ ] Backup стратегия
- [ ] Connection pooling

#### 8.3 Infrastructure
- [ ] Kubernetes манифесты (опционально)
- [ ] Environment-specific configs
- [ ] Health checks

**Документация:**
- [ ] DEPLOYMENT.md
- [ ] Infrastructure diagram
- [ ] Troubleshooting guide

---

## 📋 Чеклист зависимостей (pyproject.toml)

```toml
[tool.poetry.dependencies]
python = "^3.11"

# Web Framework
fastapi = "^0.109.0"
uvicorn = {extras = ["standard"], version = "^0.27.0"}
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"

# Database
sqlalchemy = {extras = ["asyncio"], version = "^2.0.25"}
alembic = "^1.13.0"
asyncpg = "^0.29.0"  # PostgreSQL async driver
pgvector = "^0.2.4"  # Vector extension

# Authentication
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
python-multipart = "^0.0.6"

# Background Tasks
celery = {extras = ["redis"], version = "^5.3.4"}
redis = "^5.0.1"}
flower = "^2.0.1"  # Celery monitoring

# AI & RAG
openai = "^1.10.0"
langchain = "^0.1.5"
langchain-openai = "^0.0.5"
supabase = "^2.3.0"

# Document Processing
PyPDF2 = "^3.0.1"
pdfplumber = "^0.10.3"
pytesseract = "^0.3.10"
Pillow = "^10.2.0"

# Utilities
python-dotenv = "^1.0.0"
httpx = "^0.26.0"

[tool.poetry.dev-dependencies]
# Testing
pytest = "^7.4.4"
pytest-asyncio = "^0.23.3"
pytest-cov = "^4.1.0"
httpx = "^0.26.0"

# Code Quality
black = "^23.12.1"
ruff = "^0.1.13"
mypy = "^1.8.0"

# Documentation
mkdocs = "^1.5.3"
mkdocs-material = "^9.5.4"
```

---

## 📊 Метрики успеха

### Code Quality:
- [ ] 80%+ test coverage
- [ ] 0 critical security vulnerabilities
- [ ] < 5% code duplication
- [ ] Все type hints проверены mypy

### Performance:
- [ ] < 100ms response time (95th percentile)
- [ ] > 1000 req/sec throughput
- [ ] < 500MB memory footprint

### Documentation:
- [ ] 100% API endpoints документированы
- [ ] Все модули имеют README.md
- [ ] Architecture diagrams актуальны

---

## 🎯 Текущий статус

### ✅ Завершено (NestJS версия):
- Identity Module
- Lawyer Module
- Document Module
- RAG Chat Module

### 🚧 В работе:
- **Phase 1**: Инициализация Python проекта

### 📅 Следующие шаги:
1. Создать базовую структуру проекта
2. Настроить FastAPI + SQLAlchemy
3. Реализовать Core Layer (DDD базовые классы)
4. Начать с Identity Module

---

## 📚 Ресурсы

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/en/20/)
- [LangChain Python Docs](https://python.langchain.com/)
- [Pydantic V2 Docs](https://docs.pydantic.dev/latest/)
- [DDD in Python](https://github.com/cosmic-python/book)

---

**Последнее обновление:** 2025-11-14
**Версия:** 1.0
**Автор:** Advocata Development Team
