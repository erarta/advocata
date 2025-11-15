# Consultation Module 💼

Модуль управления консультациями между клиентами и юристами в платформе Advocata.

## 📋 Обзор

Consultation Module реализует полный цикл управления консультациями:
- Бронирование консультаций (экстренные и запланированные)
- Управление жизненным циклом консультации (подтверждение, начало, завершение)
- Отмена консультаций
- Оценка завершенных консультаций

## 🏗️ Архитектура

Модуль построен на основе **Domain-Driven Design (DDD)** и состоит из 4 слоев:

```
consultation/
├── domain/                  # Бизнес-логика и правила домена
│   ├── entities/           # Агрегаты (Consultation)
│   ├── value_objects/      # Value Objects (Status, Type, TimeSlot, Price)
│   ├── events/             # Domain Events
│   └── repositories/       # Интерфейсы репозиториев
│
├── application/            # Use Cases и DTOs
│   ├── commands/           # Команды (BookConsultation, ConfirmConsultation, etc.)
│   ├── queries/            # Запросы (GetConsultationById, etc.)
│   └── dtos/               # Data Transfer Objects
│
├── infrastructure/         # Реализации и внешние зависимости
│   └── persistence/        # ORM модели, репозитории, mappers
│       ├── models/         # SQLAlchemy модели
│       ├── mappers/        # Entity <-> Model мапперы
│       └── repositories/   # Реализации репозиториев
│
└── presentation/           # API Layer
    ├── api/                # REST API endpoints
    └── dependencies/       # Dependency Injection
```

## 📊 Domain Model

### Consultation Aggregate Root

**Поля:**
- `id`: UUID консультации
- `client_id`: ID клиента
- `lawyer_id`: ID юриста
- `status`: Статус консультации
- `consultation_type`: Тип консультации (emergency/scheduled)
- `description`: Описание проблемы
- `price`: Цена консультации
- `time_slot`: Временной слот (для scheduled)
- `actual_start/actual_end`: Фактическое время проведения
- `rating/review`: Оценка и отзыв клиента
- `cancellation_reason/cancelled_by`: Информация об отмене

### Статусы консультации

```
PENDING → CONFIRMED → ACTIVE → COMPLETED
   ↓          ↓          ↓
CANCELLED  CANCELLED  FAILED
   ↓
EXPIRED
```

- **PENDING**: Ожидает подтверждения юристом
- **CONFIRMED**: Подтверждена юристом
- **ACTIVE**: В процессе проведения
- **COMPLETED**: Завершена успешно
- **CANCELLED**: Отменена клиентом или юристом
- **FAILED**: Завершена с ошибкой
- **EXPIRED**: Истекла (клиент не дождался подтверждения)

### Типы консультаций

- **EMERGENCY**: Экстренная консультация (ответ в течение 30 минут)
- **SCHEDULED**: Запланированная консультация (на конкретное время)

## 🚀 API Endpoints

### Commands (Mutations)

#### 1. Забронировать консультацию
```http
POST /api/v1/consultations
Content-Type: application/json
Authorization: Bearer <client_token>

{
  "lawyer_id": "uuid",
  "consultation_type": "emergency" | "scheduled",
  "description": "Описание проблемы (10-2000 символов)",
  "price_amount": 2500.00,
  "price_currency": "RUB",
  "scheduled_start": "2024-11-20T15:00:00Z",  // для scheduled
  "duration_minutes": 60
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "lawyer_id": "uuid",
  "status": "pending",
  "consultation_type": "scheduled",
  "description": "...",
  "price_amount": 2500.00,
  "price_currency": "RUB",
  "scheduled_start": "2024-11-20T15:00:00Z",
  "duration_minutes": 60,
  "created_at": "2024-11-15T14:00:00Z",
  "updated_at": "2024-11-15T14:00:00Z"
}
```

#### 2. Подтвердить консультацию (юрист)
```http
POST /api/v1/consultations/{consultation_id}/confirm
Authorization: Bearer <lawyer_token>
```

**Response:** `200 OK` (обновленная консультация)

#### 3. Начать консультацию (юрист)
```http
POST /api/v1/consultations/{consultation_id}/start
Authorization: Bearer <lawyer_token>
```

**Response:** `200 OK` (обновленная консультация)

#### 4. Завершить консультацию (юрист)
```http
POST /api/v1/consultations/{consultation_id}/complete
Authorization: Bearer <lawyer_token>
```

**Response:** `200 OK` (обновленная консультация)

#### 5. Отменить консультацию
```http
POST /api/v1/consultations/{consultation_id}/cancel
Content-Type: application/json
Authorization: Bearer <token>

{
  "reason": "Причина отмены (5-500 символов)"
}
```

**Response:** `200 OK` (обновленная консультация)

#### 6. Оценить консультацию (клиент)
```http
POST /api/v1/consultations/{consultation_id}/rate
Content-Type: application/json
Authorization: Bearer <client_token>

{
  "rating": 5,
  "review": "Отличная консультация!"
}
```

**Response:** `200 OK` (обновленная консультация)

### Queries (Reads)

#### 1. Получить консультацию по ID
```http
GET /api/v1/consultations/{consultation_id}
Authorization: Bearer <token>
```

**Response:** `200 OK` (полная информация о консультации)

#### 2. Получить мои консультации (клиент)
```http
GET /api/v1/consultations/client/me?status=completed&limit=50&offset=0
Authorization: Bearer <client_token>
```

**Query Parameters:**
- `status` (optional): Фильтр по статусу
- `limit` (default: 50, max: 100): Количество результатов
- `offset` (default: 0): Смещение для пагинации

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "lawyer_id": "uuid",
      "status": "completed",
      "consultation_type": "emergency",
      "price_amount": 2500.00,
      "price_currency": "RUB",
      "scheduled_start": null,
      "created_at": "2024-11-15T14:00:00Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

#### 3. Получить мои консультации (юрист)
```http
GET /api/v1/consultations/lawyer/me?status=active&limit=50&offset=0
Authorization: Bearer <lawyer_token>
```

**Response:** `200 OK` (аналогично клиентским)

#### 4. Получить pending консультации (юрист)
```http
GET /api/v1/consultations/lawyer/me/pending?limit=10
Authorization: Bearer <lawyer_token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "client_id": "uuid",
    "lawyer_id": "uuid",
    "status": "pending",
    "consultation_type": "emergency",
    "price_amount": 2500.00,
    "price_currency": "RUB",
    "scheduled_start": null,
    "created_at": "2024-11-15T14:00:00Z"
  }
]
```

## 🔐 Бизнес-правила

### 1. Бронирование консультации
- Описание должно быть от 10 до 2000 символов
- Для scheduled консультаций обязательно указать `scheduled_start`
- Юрист не должен иметь конфликтующих консультаций в это время

### 2. Подтверждение консультации
- Только юрист может подтвердить консультацию
- Можно подтвердить только консультацию в статусе PENDING

### 3. Начало консультации
- Только юрист может начать консультацию
- Можно начать только CONFIRMED консультацию
- Юрист может вести только одну ACTIVE консультацию одновременно
- Для scheduled консультаций проверяется время начала

### 4. Завершение консультации
- Только юрист может завершить консультацию
- Можно завершить только ACTIVE консультацию

### 5. Отмена консультации
- Клиент или юрист может отменить консультацию
- Можно отменить только PENDING или CONFIRMED консультацию
- При отмене должна быть указана причина

### 6. Оценка консультации
- Только клиент может оценить консультацию
- Можно оценить только COMPLETED консультацию
- Оценка от 1 до 5 звезд
- Можно оценить только один раз

## 💾 Database Schema

```sql
CREATE TYPE consultation_status_enum AS ENUM (
    'pending', 'confirmed', 'active', 'completed',
    'cancelled', 'failed', 'expired'
);

CREATE TYPE consultation_type_enum AS ENUM ('emergency', 'scheduled');

CREATE TABLE consultations (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL,
    lawyer_id UUID NOT NULL,
    status consultation_status_enum NOT NULL DEFAULT 'pending',
    consultation_type consultation_type_enum NOT NULL,
    description TEXT NOT NULL,
    price_amount NUMERIC(10, 2) NOT NULL,
    price_currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
    scheduled_start TIMESTAMPTZ,
    duration_minutes INTEGER,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(20),
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX ix_consultations_client_status ON consultations (client_id, status);
CREATE INDEX ix_consultations_lawyer_status ON consultations (lawyer_id, status);
CREATE INDEX ix_consultations_lawyer_scheduled ON consultations (lawyer_id, scheduled_start);
CREATE INDEX idx_consultations_lawyer_active ON consultations (lawyer_id, status)
    WHERE status = 'active';
```

## 🧪 Тестирование

### Unit Tests

Тестируем Domain Layer:
```python
from app.modules.consultation.domain import Consultation, ConsultationType, Price

def test_book_emergency_consultation():
    result = Consultation.book(
        client_id=client_id,
        lawyer_id=lawyer_id,
        consultation_type=ConsultationType.emergency(),
        price=Price.create(2500, "RUB").value,
        description="Срочная консультация по ДТП",
    )

    assert result.is_success
    assert result.value.status.value == "pending"
    assert result.value.consultation_type.is_emergency()
```

### Integration Tests

Тестируем API:
```python
async def test_book_consultation(client, auth_headers):
    response = await client.post(
        "/api/v1/consultations",
        json={
            "lawyer_id": str(lawyer_id),
            "consultation_type": "emergency",
            "description": "Срочная консультация",
            "price_amount": 2500.00,
        },
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "pending"
```

## 🔄 Domain Events

При изменении состояния консультации генерируются события:

- `ConsultationBookedEvent` - консультация забронирована
- `ConsultationConfirmedEvent` - консультация подтверждена юристом
- `ConsultationStartedEvent` - консультация начата
- `ConsultationCompletedEvent` - консультация завершена
- `ConsultationCancelledEvent` - консультация отменена

События могут использоваться для:
- Отправки уведомлений
- Обновления статистики юриста
- Обработки платежей
- Логирования

## 📦 Dependencies

- `FastAPI` - Web framework
- `SQLAlchemy 2.0` - ORM
- `Pydantic v2` - Data validation
- `PostgreSQL` - Database
- `Alembic` - Migrations

## 🚀 Deployment

### 1. Применить миграции

```bash
cd apps/backend-python
alembic upgrade head
```

### 2. Запустить сервер

```bash
uvicorn app.main:app --reload
```

### 3. Проверить API

Открыть Swagger UI: http://localhost:8000/docs

## 🔧 Конфигурация

Настройки в `app/config.py`:

```python
# Database
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/advocata"

# API
API_V1_PREFIX = "/api/v1"
```

## 📚 Дополнительные ресурсы

- [DDD с Python](https://www.cosmicpython.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Pydantic v2](https://docs.pydantic.dev/latest/)

## 👥 Контакты

- **Email**: modera@erarta.ai, evgeniy@erarta.ai
- **Repository**: https://github.com/erarta/advocata

---

**Версия**: 1.0
**Дата создания**: 15 ноября 2024
**Статус**: ✅ Implemented
