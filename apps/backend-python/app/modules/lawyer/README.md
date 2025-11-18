# Lawyer Module

## 📋 Описание

**Lawyer Module** — модуль управления юристами в платформе Advocata. Обеспечивает полный жизненный цикл юриста: от регистрации и верификации до поиска и управления профилем.

### Основной функционал:

- 👨‍⚖️ **Регистрация юристов** с указанием специализаций, опыта и квалификации
- ✅ **Верификация** юристов администраторами (проверка лицензии, образования)
- 🔍 **Поиск юристов** с множественными фильтрами (специализация, рейтинг, цена, локация)
- ⭐ **Рейтинговая система** с отзывами и оценками
- 📊 **Управление профилем** юриста (доступность, цены, описание)
- 🏆 **Топ юристов** по рейтингу и специализациям

---

## 🏗️ Архитектура

Модуль построен на **Domain-Driven Design (DDD)** с четким разделением на 4 слоя:

```
app/modules/lawyer/
├── domain/                     # Доменный слой (бизнес-логика)
│   ├── entities/
│   │   └── lawyer.py          # Lawyer Aggregate Root
│   ├── value_objects/
│   │   ├── specialization.py  # 30+ юридических специализаций
│   │   ├── experience.py      # Опыт работы с уровнями
│   │   ├── verification_status.py  # Статус верификации
│   │   ├── rating.py          # Рейтинговая система
│   │   └── price.py           # Цена за консультацию
│   ├── events/
│   │   ├── lawyer_registered.py    # События домена
│   │   ├── lawyer_verified.py
│   │   └── lawyer_availability_changed.py
│   ├── repositories/
│   │   └── lawyer_repository.py    # Интерфейс репозитория
│   └── services/
│       └── lawyer_verification_service.py  # Доменный сервис
│
├── application/                # Слой приложения (use cases)
│   ├── dtos/
│   │   └── lawyer_dto.py      # Data Transfer Objects
│   ├── commands/
│   │   ├── register_lawyer_handler.py
│   │   ├── verify_lawyer_handler.py
│   │   └── update_lawyer_availability_handler.py
│   └── queries/
│       ├── search_lawyers_handler.py
│       ├── get_lawyer_detail_handler.py
│       └── get_top_rated_lawyers_handler.py
│
├── infrastructure/             # Инфраструктурный слой
│   └── persistence/
│       ├── models/
│       │   └── lawyer_model.py     # SQLAlchemy ORM модель
│       ├── mappers/
│       │   └── lawyer_mapper.py    # Domain ↔ ORM маппинг
│       └── repositories/
│           └── lawyer_repository_impl.py  # Реализация репозитория
│
└── presentation/               # Слой представления (API)
    ├── schemas/
    │   ├── requests.py        # Pydantic request schemas
    │   └── responses.py       # Pydantic response schemas
    └── api/
        └── lawyer_router.py   # FastAPI роутер
```

---

## 🚀 API Endpoints

### Public Endpoints (без аутентификации)

#### 1. Поиск юристов

```http
GET /api/v1/lawyers
```

**Query Parameters:**
- `specializations` (array): Фильтр по специализациям (например: `["ДТП", "Уголовное право"]`)
- `min_rating` (float, 1.0-5.0): Минимальный рейтинг
- `max_price` (float): Максимальная цена за консультацию
- `location` (string): Город/регион (частичное совпадение)
- `is_available` (boolean): Доступность для консультаций
- `min_experience` (int): Минимальный опыт в годах
- `query` (string): Текстовый поиск по описанию и образованию
- `limit` (int, default: 20): Количество результатов
- `offset` (int, default: 0): Смещение для пагинации

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/lawyers?specializations=ДТП&min_rating=4.0&location=Санкт-Петербург&limit=10"
```

**Response 200:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "full_name": "Иванов Иван Иванович",
      "specializations": ["ДТП", "Страховые споры"],
      "experience_years": 10,
      "experience_level": "senior",
      "price_per_consultation": 5000.00,
      "price_category": "Средний",
      "rating": 4.8,
      "reviews_count": 142,
      "consultations_count": 356,
      "location": "Санкт-Петербург",
      "is_available": true,
      "verification_status": "verified"
    }
  ],
  "total": 48,
  "limit": 10,
  "offset": 0
}
```

#### 2. Получить детали юриста

```http
GET /api/v1/lawyers/{lawyer_id}
```

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/lawyers/550e8400-e29b-41d4-a716-446655440000"
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "full_name": "Иванов Иван Иванович",
  "specializations": ["ДТП", "Страховые споры", "Защита прав потребителей"],
  "experience_years": 10,
  "experience_level": "senior",
  "price_per_consultation": 5000.00,
  "price_category": "Средний",
  "rating": 4.8,
  "rating_quality": "Отлично",
  "reviews_count": 142,
  "consultations_count": 356,
  "license_number": "77/12345",
  "education": "МГУ им. М.В. Ломоносова, Юридический факультет, 2010",
  "about": "Специализируюсь на делах о ДТП и страховых спорах. Более 10 лет практики...",
  "location": "Санкт-Петербург",
  "is_available": true,
  "languages": ["Русский", "Английский"],
  "verification_status": "verified",
  "verified_at": "2024-11-10T14:30:00Z",
  "created_at": "2024-11-01T10:00:00Z",
  "updated_at": "2024-11-14T16:00:00Z"
}
```

**Response 404:**
```json
{
  "detail": "Lawyer not found"
}
```

#### 3. Получить топ юристов

```http
GET /api/v1/lawyers/top-rated
```

**Query Parameters:**
- `specialization` (string, optional): Фильтр по одной специализации
- `location` (string, optional): Город/регион
- `limit` (int, default: 10): Количество результатов

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/lawyers/top-rated?specialization=ДТП&limit=5"
```

**Response 200:**
```json
{
  "items": [
    {
      "id": "...",
      "full_name": "Петров Петр Петрович",
      "specializations": ["ДТП", "Уголовное право"],
      "rating": 5.0,
      "reviews_count": 287,
      "experience_years": 15,
      "location": "Москва"
    }
  ],
  "total": 5
}
```

---

### Authenticated Endpoints (требуется JWT токен)

**Authentication Header:**
```
Authorization: Bearer <jwt_token>
```

#### 4. Регистрация юриста

```http
POST /api/v1/lawyers
```

**Request Body:**
```json
{
  "specializations": ["ДТП", "Страховые споры"],
  "experience_years": 10,
  "price_per_consultation": 5000.00,
  "license_number": "77/12345",
  "education": "МГУ им. М.В. Ломоносова, Юридический факультет, 2010",
  "about": "Специализируюсь на делах о ДТП и страховых спорах...",
  "location": "Санкт-Петербург",
  "languages": ["Русский", "Английский"]
}
```

**Validation Rules:**
- `specializations`: 1-5 специализаций из списка (обязательно)
- `experience_years`: 0-70 лет (обязательно)
- `price_per_consultation`: 500.00-100000.00 RUB (обязательно)
- `license_number`: 1-50 символов (обязательно)
- `education`: 10-500 символов (обязательно)
- `about`: 50-2000 символов (обязательно)
- `location`: 2-100 символов (обязательно)
- `languages`: минимум 1 язык (необязательно, по умолчанию ["Русский"])

**Response 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "verification_status": "pending",
  "created_at": "2024-11-14T16:00:00Z",
  ...
}
```

**Response 400:**
```json
{
  "detail": "Lawyer profile already exists for this user"
}
```

**Response 422:**
```json
{
  "detail": [
    {
      "loc": ["body", "about"],
      "msg": "String should have at least 50 characters",
      "type": "string_too_short"
    }
  ]
}
```

#### 5. Обновить доступность юриста

```http
PATCH /api/v1/lawyers/{lawyer_id}/availability
```

**Permissions:** Только владелец профиля

**Request Body:**
```json
{
  "is_available": false
}
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "is_available": false,
  ...
}
```

**Response 403:**
```json
{
  "detail": "You can only update your own lawyer profile"
}
```

---

### Admin Endpoints (требуется роль ADMIN)

#### 6. Верифицировать юриста

```http
POST /api/v1/lawyers/{lawyer_id}/verify
```

**Permissions:** Только администраторы

**Request Body:**
```json
{
  "notes": "Проверены все документы. Лицензия действительна."
}
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "verification_status": "verified",
  "verified_at": "2024-11-14T16:30:00Z",
  ...
}
```

**Response 400:**
```json
{
  "detail": "Lawyer is already verified"
}
```

#### 7. Отклонить заявку юриста

```http
POST /api/v1/lawyers/{lawyer_id}/reject
```

**Permissions:** Только администраторы

**Request Body:**
```json
{
  "reason": "Недействительный номер лицензии. Требуется повторная подача документов."
}
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "verification_status": "rejected",
  ...
}
```

---

## 📊 Доменная модель

### Lawyer Aggregate Root

**Value Objects:**

1. **Specialization** — Специализация юриста
   - 30+ русских специализаций (ДТП, Уголовное право, Семейное право, и т.д.)
   - Валидация на соответствие enum

2. **Experience** — Опыт работы
   - Диапазон: 0-70 лет
   - Автоматический расчет уровня:
     - `junior` (Начинающий): 0-2 года
     - `middle` (Средний): 3-6 лет
     - `senior` (Опытный): 7-14 лет
     - `expert` (Эксперт): 15+ лет

3. **VerificationStatus** — Статус верификации
   - `pending` — На рассмотрении
   - `in_review` — На проверке
   - `verified` — Верифицирован
   - `rejected` — Отклонен
   - `suspended` — Приостановлен

4. **Rating** — Рейтинг
   - Диапазон: 1.0-5.0
   - Качественные уровни:
     - `excellent` (Отлично): 4.5+
     - `good` (Хорошо): 3.5-4.4
     - `average` (Средне): 2.5-3.4
     - `poor` (Плохо): <2.5

5. **Price** — Цена
   - Диапазон: 500-100,000 RUB
   - Категории:
     - `budget` (Бюджетный): <2000
     - `medium` (Средний): 2000-5000
     - `premium` (Премиум): >5000

### Business Rules

1. **Регистрация:**
   - Один пользователь может иметь только один профиль юриста
   - Минимум 1 специализация, максимум 5
   - Описание профиля не менее 50 символов
   - Проверка на запрещенные слова в описании

2. **Верификация:**
   - Только администраторы могут верифицировать/отклонять
   - Верифицировать можно только юристов в статусе `pending` или `in_review`
   - При верификации устанавливается `verified_at`
   - Публикуется событие `LawyerVerifiedEvent`

3. **Доступность:**
   - Только владелец профиля может изменять доступность
   - Публикуется событие `LawyerAvailabilityChangedEvent`

4. **Рейтинг:**
   - Начальное значение: `null` (нет отзывов)
   - Обновляется после каждого нового отзыва
   - Учитывается количество отзывов для расчета среднего

5. **Поиск:**
   - Показываются только верифицированные юристы (`verified`)
   - Сортировка по рейтингу (DESC), затем по дате создания (DESC)
   - Поддержка множественных фильтров (AND логика)
   - Специализации объединяются через OR (хотя бы одна совпадает)

---

## 🗄️ База данных

### Таблица `lawyers`

```sql
CREATE TABLE lawyers (
    -- Идентификаторы
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,  -- FK to users

    -- Специализации и опыт
    specializations VARCHAR(100)[] NOT NULL,  -- ARRAY
    experience_years INTEGER NOT NULL,

    -- Цена и рейтинг
    price_amount NUMERIC(10, 2) NOT NULL,
    rating NUMERIC(2, 1),                    -- 1.0-5.0
    reviews_count INTEGER NOT NULL DEFAULT 0,
    consultations_count INTEGER NOT NULL DEFAULT 0,

    -- Credentials
    license_number VARCHAR(50) NOT NULL,
    education VARCHAR(500) NOT NULL,

    -- Профиль
    about TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT false,
    languages VARCHAR(50)[] NOT NULL DEFAULT '{}',

    -- Верификация и статус
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT uq_lawyers_user_id UNIQUE (user_id)
);
```

### Индексы

```sql
-- Основные индексы
CREATE INDEX ix_lawyers_id ON lawyers(id);
CREATE UNIQUE INDEX ix_lawyers_user_id ON lawyers(user_id);
CREATE INDEX ix_lawyers_verification_status ON lawyers(verification_status);
CREATE INDEX ix_lawyers_location ON lawyers(location);
CREATE INDEX ix_lawyers_is_available ON lawyers(is_available);
CREATE INDEX ix_lawyers_rating ON lawyers(rating);
CREATE INDEX ix_lawyers_experience_years ON lawyers(experience_years);
CREATE INDEX ix_lawyers_price_amount ON lawyers(price_amount);

-- Композитные индексы для оптимизации поиска
CREATE INDEX idx_lawyers_status_available
    ON lawyers(verification_status, is_available);

CREATE INDEX idx_lawyers_location_status
    ON lawyers(location, verification_status);

CREATE INDEX idx_lawyers_rating_desc
    ON lawyers(rating DESC);
```

### Миграция

```bash
# Создать миграцию
alembic revision --autogenerate -m "create_lawyers_table"

# Применить миграцию
alembic upgrade head

# Откатить миграцию
alembic downgrade -1
```

---

## 🔧 Интеграция

### 1. Подключение модуля

Модуль уже интегрирован в `app/main.py`:

```python
from app.modules.lawyer.presentation.api.lawyer_router import router as lawyer_router

app.include_router(lawyer_router, prefix=f"{settings.api_v1_prefix}")
```

### 2. Зависимости

```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.infrastructure.database import get_db
from app.modules.identity.presentation.dependencies import (
    get_current_user,
    require_role
)

# В endpoint:
async def some_endpoint(
    current_user: Annotated[UserDTO, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    ...
```

### 3. Создание репозитория и хендлера

```python
from app.modules.lawyer.infrastructure.persistence.repositories import LawyerRepositoryImpl
from app.modules.lawyer.application.queries import SearchLawyersHandler

# В endpoint:
lawyer_repository = LawyerRepositoryImpl(db)
handler = SearchLawyersHandler(lawyer_repository)
```

---

## 📝 Примеры использования

### Полный flow регистрации и поиска юриста

```bash
# 1. Регистрация пользователя (Identity Module)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@example.com",
    "password": "SecurePass123!",
    "full_name": "Иванов Иван Иванович",
    "phone_number": "+79991234567"
  }'

# 2. Логин и получение токена
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lawyer@example.com",
    "password": "SecurePass123!"
  }'

# Response: { "access_token": "eyJ...", ... }

# 3. Регистрация профиля юриста
curl -X POST http://localhost:8000/api/v1/lawyers \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "specializations": ["ДТП", "Страховые споры"],
    "experience_years": 10,
    "price_per_consultation": 5000.00,
    "license_number": "77/12345",
    "education": "МГУ им. М.В. Ломоносова, Юридический факультет, 2010",
    "about": "Специализируюсь на делах о ДТП и страховых спорах. Более 10 лет успешной практики...",
    "location": "Санкт-Петербург",
    "languages": ["Русский", "Английский"]
  }'

# 4. Администратор верифицирует юриста
curl -X POST http://localhost:8000/api/v1/lawyers/{lawyer_id}/verify \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Проверены все документы"
  }'

# 5. Юрист обновляет доступность
curl -X PATCH http://localhost:8000/api/v1/lawyers/{lawyer_id}/availability \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "is_available": true
  }'

# 6. Клиент ищет юристов по специализации
curl -X GET "http://localhost:8000/api/v1/lawyers?specializations=ДТП&min_rating=4.0&is_available=true"

# 7. Клиент получает детали юриста
curl -X GET http://localhost:8000/api/v1/lawyers/{lawyer_id}

# 8. Получить топ юристов
curl -X GET "http://localhost:8000/api/v1/lawyers/top-rated?specialization=ДТП&limit=10"
```

---

## 🧪 Тестирование

### Unit Tests (Domain Layer)

```python
# test/unit/modules/lawyer/domain/test_lawyer_entity.py
def test_verify_pending_lawyer_success():
    lawyer = create_pending_lawyer()

    result = lawyer.verify(verified_by_admin_id="admin-123")

    assert result.is_success
    assert lawyer.verification_status.value == VerificationStatusType.VERIFIED
    assert lawyer.verified_at is not None
    assert len(lawyer.domain_events) == 1
    assert isinstance(lawyer.domain_events[0], LawyerVerifiedEvent)
```

### Integration Tests (Repository)

```python
# test/integration/modules/lawyer/test_lawyer_repository.py
async def test_search_lawyers_by_specialization(db_session):
    repository = LawyerRepositoryImpl(db_session)

    lawyers, total = await repository.search(
        specializations=[SpecializationType.AUTO_ACCIDENTS],
        limit=10
    )

    assert total > 0
    assert all(
        SpecializationType.AUTO_ACCIDENTS in lawyer.specializations
        for lawyer in lawyers
    )
```

### E2E Tests (API)

```python
# test/e2e/modules/lawyer/test_lawyer_api.py
async def test_full_lawyer_registration_flow(client, user_token):
    # Register lawyer
    response = await client.post(
        "/api/v1/lawyers",
        headers={"Authorization": f"Bearer {user_token}"},
        json={...}
    )
    assert response.status_code == 201

    lawyer_id = response.json()["id"]

    # Get lawyer details
    response = await client.get(f"/api/v1/lawyers/{lawyer_id}")
    assert response.status_code == 200
```

---

## 🔐 Безопасность

### Контроль доступа

1. **Public endpoints** — Без аутентификации:
   - `GET /lawyers` — Поиск
   - `GET /lawyers/{id}` — Детали
   - `GET /lawyers/top-rated` — Топ юристов

2. **Authenticated endpoints** — Требуется JWT:
   - `POST /lawyers` — Регистрация (владелец)
   - `PATCH /lawyers/{id}/availability` — Обновление (владелец)

3. **Admin endpoints** — Требуется роль ADMIN:
   - `POST /lawyers/{id}/verify` — Верификация
   - `POST /lawyers/{id}/reject` — Отклонение

### Валидация

- **Pydantic schemas** на уровне Presentation
- **Value Objects** на уровне Domain
- **Domain Service** для сложной бизнес-логики
- Проверка на запрещенные слова в описаниях

### Аудит

Все критические операции логируются:
- Регистрация юриста
- Верификация/отклонение
- Изменение доступности

---

## 📈 Метрики

### Business Metrics

- Количество зарегистрированных юристов
- Количество верифицированных юристов
- Средний рейтинг по платформе
- Количество доступных юристов
- Распределение по специализациям

### Technical Metrics

- Время отклика API endpoints
- Количество поисковых запросов
- Использование индексов БД
- Cache hit rate (для топ юристов)

---

## 🚀 Дальнейшее развитие

### Запланированные фичи

1. **Рейтинговая система**:
   - Отзывы клиентов
   - Расчет среднего рейтинга
   - Модерация отзывов

2. **Расписание и доступность**:
   - Календарь доступности
   - Рабочие часы
   - Автоматическое управление доступностью

3. **Аналитика для юристов**:
   - Статистика консультаций
   - Доход за период
   - Популярные запросы

4. **Верификация**:
   - Автоматическая проверка лицензий через API ФНС
   - Загрузка документов (паспорт, диплом)
   - Видео-верификация

5. **Рекомендации**:
   - ML-модель для рекомендации юристов
   - Персонализированный поиск
   - Анализ истории клиента

---

## 📚 Связанные модули

- **Identity Module** — Аутентификация и управление пользователями
- **Consultation Module** (TODO) — Управление консультациями
- **Payment Module** (TODO) — Обработка платежей
- **Review Module** (TODO) — Отзывы и рейтинги

---

## 📧 Контакты

- **Email**: modera@erarta.ai, evgeniy@erarta.ai
- **Repository**: https://github.com/erarta/advocata
- **Documentation**: `/docs`

---

**Версия**: 1.0
**Дата создания**: 14 ноября 2024
**Статус**: ✅ Production Ready
