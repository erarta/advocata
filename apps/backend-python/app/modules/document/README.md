# Document Module

## 📋 Описание

**Document Module** — модуль управления юридическими документами в платформе Advocata. Обеспечивает полный жизненный цикл документов: загрузка, хранение, обработка (OCR), поиск и управление.

### Основной функционал:

- 📤 **Загрузка документов** с валидацией и хранением в S3/MinIO
- 🔍 **OCR обработка** для сканов и изображений (извлечение текста)
- 💾 **Безопасное хранилище** с шифрованием и контролем доступа
- 🔎 **Поиск документов** с множественными фильтрами и full-text search
- 🏷️ **Теги и категоризация** для упрощения навигации
- 🔗 **Связь с консультациями** для контекста
- 📊 **Статусы обработки** (uploaded → processing → processed/failed)

---

## 🏗️ Архитектура

Модуль построен на **Domain-Driven Design (DDD)** с четким разделением на 4 слоя:

```
app/modules/document/
├── domain/                     # Доменный слой (бизнес-логика)
│   ├── entities/
│   │   └── document.py        # Document Aggregate Root
│   ├── value_objects/
│   │   ├── document_type.py   # 28 типов юридических документов
│   │   ├── document_status.py # Жизненный цикл (6 статусов)
│   │   ├── document_category.py # 19 категорий по специализациям
│   │   └── file_metadata.py   # Метаданные файла (size, MIME, extension)
│   ├── events/
│   │   ├── document_uploaded.py     # События домена
│   │   ├── document_processed.py
│   │   └── document_deleted.py
│   ├── repositories/
│   │   └── document_repository.py   # Интерфейс репозитория
│   └── services/
│       └── document_validation_service.py  # Доменный сервис
│
├── application/                # Слой приложения (use cases)
│   ├── dtos/
│   │   └── document_dto.py    # Data Transfer Objects
│   ├── commands/
│   │   ├── upload_document_handler.py
│   │   ├── update_document_metadata_handler.py
│   │   └── delete_document_handler.py
│   └── queries/
│       ├── get_document_by_id_handler.py
│       ├── search_documents_handler.py
│       └── get_documents_by_owner_handler.py
│
├── infrastructure/             # Инфраструктурный слой
│   ├── persistence/
│   │   ├── models/
│   │   │   └── document_model.py      # SQLAlchemy ORM модель
│   │   ├── mappers/
│   │   │   └── document_mapper.py     # Domain ↔ ORM маппинг
│   │   └── repositories/
│   │       └── document_repository_impl.py  # Реализация репозитория
│   └── storage/
│       └── storage_service.py   # S3/MinIO хранилище
│
└── presentation/               # Слой представления (API)
    ├── schemas/
    │   ├── requests.py        # Pydantic request schemas
    │   └── responses.py       # Pydantic response schemas
    └── api/
        └── document_router.py # FastAPI роутер (7 endpoints)
```

---

## 🚀 API Endpoints

### Public Endpoints

#### 1. Загрузить документ

```http
POST /api/v1/documents
Content-Type: multipart/form-data
```

**Требуется аутентификация.**

**Form Data:**
- `file` (file): Файл для загрузки
- `document_type` (string): Тип документа
- `category` (string): Категория
- `title` (string): Название
- `description` (string, optional): Описание
- `consultation_id` (string, optional): ID консультации
- `tags` (array[string], optional): Теги

**Поддерживаемые форматы:**
- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- Изображения (.jpg, .png, .tiff) - с OCR
- Текст (.txt, .rtf)

**Размер файла:** 1 KB - 100 MB

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/documents" \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/document.pdf" \
  -F "document_type=contract" \
  -F "category=auto_accidents" \
  -F "title=Договор купли-продажи автомобиля" \
  -F "description=Договор о покупке Honda Civic 2020" \
  -F "tags=ДТП" \
  -F "tags=договор"
```

**Response 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "owner_id": "123e4567-e89b-12d3-a456-426614174000",
  "document_type": "contract",
  "document_type_display": "Договор",
  "category": "auto_accidents",
  "category_display": "ДТП и автоправо",
  "title": "Договор купли-продажи автомобиля",
  "description": "Договор о покупке Honda Civic 2020",
  "file_size": 245760,
  "file_size_human": "240 KB",
  "mime_type": "application/pdf",
  "original_filename": "document.pdf",
  "file_extension": "pdf",
  "storage_path": "documents/123e4567-e89b-12d3-a456-426614174000/2024/11/550e8400-e29b-41d4-a716-446655440000/document.pdf",
  "status": "uploaded",
  "status_display": "Загружен",
  "consultation_id": null,
  "extracted_text": null,
  "tags": ["ДТП", "договор"],
  "processing_error": null,
  "uploaded_at": "2024-11-14T16:00:00Z",
  "processed_at": null,
  "created_at": "2024-11-14T16:00:00Z",
  "updated_at": "2024-11-14T16:00:00Z",
  "needs_ocr": false,
  "can_be_processed": true,
  "can_be_deleted": true,
  "is_processed": false
}
```

#### 2. Получить документ

```http
GET /api/v1/documents/{document_id}
```

**Требуется аутентификация.**

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/documents/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <token>"
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Договор купли-продажи автомобиля",
  "extracted_text": "Полный текст документа...",
  ...
}
```

**Response 404:**
```json
{
  "detail": "Document not found: 550e8400-e29b-41d4-a716-446655440000"
}
```

#### 3. Получить все документы пользователя

```http
GET /api/v1/documents
```

**Требуется аутентификация.**

**Query Parameters:**
- `limit` (int, 1-100, default: 50): Количество результатов
- `offset` (int, default: 0): Смещение

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/documents?limit=20&offset=0" \
  -H "Authorization: Bearer <token>"
```

**Response 200:**
```json
{
  "items": [
    {
      "id": "...",
      "title": "Договор купли-продажи",
      "document_type": "contract",
      "status": "processed",
      "uploaded_at": "2024-11-14T16:00:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0,
  "has_more": false,
  "page": 1,
  "total_pages": 1
}
```

#### 4. Поиск документов с фильтрами

```http
GET /api/v1/documents/search
```

**Требуется аутентификация.**

**Query Parameters:**
- `document_types` (array): Типы документов (OR логика)
- `categories` (array): Категории (OR логика)
- `statuses` (array): Статусы (OR логика)
- `q` (string): Текстовый поиск
- `tags` (array): Теги (OR логика)
- `consultation_id` (string): ID консультации
- `limit` (int, 1-100, default: 50): Количество результатов
- `offset` (int, default: 0): Смещение

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/documents/search?document_types=contract&categories=auto_accidents&q=Honda&tags=ДТП&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Response 200:**
```json
{
  "items": [...],
  "total": 3,
  "limit": 10,
  "offset": 0,
  "has_more": false,
  "page": 1,
  "total_pages": 1
}
```

#### 5. Обновить метаданные документа

```http
PATCH /api/v1/documents/{document_id}
```

**Требуется аутентификация.**

**Request Body:**
```json
{
  "title": "Новое название",
  "description": "Новое описание",
  "tags": ["новый", "тег"]
}
```

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Новое название",
  ...
}
```

#### 6. Удалить документ

```http
DELETE /api/v1/documents/{document_id}
```

**Требуется аутентификация.**

**Example Request:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/documents/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <token>"
```

**Response 204:** No Content

#### 7. Скачать файл документа

```http
GET /api/v1/documents/{document_id}/download
```

**Требуется аутентификация.**

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/v1/documents/550e8400-e29b-41d4-a716-446655440000/download" \
  -H "Authorization: Bearer <token>" \
  -O
```

**Response 200:** Binary file stream

---

## 📊 Доменная модель

### Document Aggregate Root

**Value Objects:**

1. **DocumentType** — Тип документа
   - 28 типов (contract, court_decision, claim, etc.)
   - Группы: Договоры, Судебные, Заявления, ДТП, Корпоративные, Трудовые

2. **DocumentCategory** — Категория по специализации
   - 19 категорий (auto_accidents, criminal, civil, etc.)
   - Соответствуют специализациям юристов

3. **DocumentStatus** — Статус обработки
   - `uploaded` — Загружен
   - `processing` — Обрабатывается
   - `processed` — Обработан
   - `failed` — Ошибка обработки
   - `archived` — Архивирован
   - `deleted` — Удален

4. **FileMetadata** — Метаданные файла
   - Размер (1 KB - 100 MB)
   - MIME-тип (PDF, DOCX, JPG, PNG, etc.)
   - Имя файла, расширение
   - Валидация безопасности

### Business Rules

1. **Загрузка:**
   - Один пользователь может иметь неограниченное количество документов
   - Валидация размера файла (1 KB - 100 MB)
   - Проверка расширения и MIME-типа
   - Автоматическое создание безопасного пути в S3
   - Событие `DocumentUploadedEvent`

2. **Обработка:**
   - Изображения автоматически отправляются на OCR
   - PDF и Word документы — извлечение текста
   - Обработка может быть повторена при ошибке
   - Событие `DocumentProcessedEvent`

3. **Доступ:**
   - Только владелец может просматривать/изменять документ
   - Админы не имеют доступа к чужим документам (privacy)

4. **Удаление:**
   - Soft delete - документ помечается как deleted
   - Физическое удаление файла из S3 — асинхронно
   - Событие `DocumentDeletedEvent`

5. **Поиск:**
   - Full-text search по title, description, extracted_text
   - Множественные фильтры (OR логика)
   - Сортировка по дате создания (DESC)

---

## 🗄️ База данных

### Таблица `documents`

```sql
CREATE TABLE documents (
    -- Идентификаторы
    id VARCHAR(36) PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL,

    -- Метаданные документа
    document_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,

    -- Метаданные файла
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_extension VARCHAR(20) NOT NULL,
    storage_path VARCHAR(500) NOT NULL UNIQUE,

    -- Статус
    status VARCHAR(20) NOT NULL DEFAULT 'uploaded',

    -- Связи
    consultation_id VARCHAR(36),

    -- Обработка
    extracted_text TEXT,
    processing_error VARCHAR(500),

    -- Теги
    tags VARCHAR(50)[] NOT NULL DEFAULT '{}',

    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT uq_documents_storage_path UNIQUE (storage_path)
);
```

### Индексы

```sql
-- Основные индексы
CREATE INDEX ix_documents_owner_id ON documents(owner_id);
CREATE INDEX ix_documents_document_type ON documents(document_type);
CREATE INDEX ix_documents_category ON documents(category);
CREATE INDEX ix_documents_status ON documents(status);
CREATE INDEX ix_documents_consultation_id ON documents(consultation_id);

-- Композитные индексы
CREATE INDEX idx_documents_owner_status ON documents(owner_id, status);
CREATE INDEX idx_documents_owner_created ON documents(owner_id, created_at);
CREATE INDEX idx_documents_type_category ON documents(document_type, category);

-- Full-text search
CREATE INDEX idx_documents_title_description
    ON documents USING gin (lower(title) gin_trgm_ops, lower(description) gin_trgm_ops);
```

### Миграция

```bash
# Применить миграцию
alembic upgrade head

# Откатить миграцию
alembic downgrade -1
```

---

## 💾 S3/MinIO Хранилище

### Структура хранения

```
bucket: advocata-documents/
├── documents/
│   └── {owner_id}/
│       └── {YYYY}/
│           └── {MM}/
│               └── {document_id}/
│                   └── {sanitized_filename}
```

**Пример:**
```
advocata-documents/documents/123e4567-e89b-12d3-a456-426614174000/2024/11/550e8400-e29b-41d4-a716-446655440000/dogovor-kupli-prodazhi.pdf
```

### Настройка

Добавьте в `.env`:

```env
# S3/MinIO Configuration
S3_ENDPOINT_URL=http://localhost:9000  # Для MinIO локально
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=advocata-documents
S3_REGION=us-east-1
```

Для **AWS S3** production:

```env
S3_ENDPOINT_URL=  # Оставить пустым
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=advocata-prod-documents
S3_REGION=eu-central-1
```

### MinIO локально (Docker)

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v /tmp/minio-data:/data \
  quay.io/minio/minio server /data --console-address ":9001"
```

Console: http://localhost:9001

---

## 🧪 Тестирование

### Unit Tests (Domain Layer)

```python
def test_document_upload():
    document_result = Document.create(
        owner_id=UUID("123e4567-e89b-12d3-a456-426614174000"),
        document_type=DocumentType.create("contract").value,
        category=DocumentCategory.create("auto_accidents").value,
        file_metadata=FileMetadata.create(
            file_size=1024,
            mime_type="application/pdf",
            original_filename="test.pdf"
        ).value,
        storage_path="documents/test.pdf",
        title="Test Document"
    )

    assert document_result.is_success
    document = document_result.value
    assert document.status.is_uploaded
    assert len(document.domain_events) == 1
```

### Integration Tests (API)

```python
async def test_upload_document(client, user_token):
    files = {"file": ("test.pdf", b"PDF content", "application/pdf")}
    data = {
        "document_type": "contract",
        "category": "auto_accidents",
        "title": "Test Document",
    }

    response = await client.post(
        "/api/v1/documents",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 201
    assert response.json()["status"] == "uploaded"
```

---

## 🔐 Безопасность

### Контроль доступа

- **Владелец документа** — полный доступ (чтение, обновление, удаление)
- **Другие пользователи** — нет доступа
- **Админы** — нет доступа к документам (privacy by design)

### Валидация

1. **Размер файла:** 1 KB - 100 MB
2. **Типы файлов:** Только разрешенные MIME-типы
3. **Запрещенные расширения:** .exe, .bat, .sh, .js, и др.
4. **Имя файла:** Sanitization от опасных символов
5. **Path traversal:** Защита от "../" атак

### Шифрование

- **In-transit:** HTTPS для API, TLS для S3
- **At-rest:** AES-256 server-side encryption в S3
- **Pre-signed URLs:** Временный доступ с истечением

---

## 📈 Метрики

### Business Metrics

- Количество загруженных документов
- Успешность обработки (processed vs failed)
- Средний размер документов
- Распределение по типам и категориям
- Использование хранилища (GB)

### Technical Metrics

- Время загрузки файла
- Время обработки OCR
- Успешность поиска
- S3 requests/errors

---

## 🚀 Дальнейшее развитие

### Запланированные фичи

1. **OCR Обработка:**
   - Интеграция с Tesseract OCR
   - Асинхронная обработка через Celery
   - Поддержка русского языка

2. **Версионирование:**
   - История изменений документа
   - Откат к предыдущей версии
   - Diff между версиями

3. **Шаринг:**
   - Временный доступ для юристов
   - Pre-signed URLs с истечением
   - Просмотр без скачивания

4. **Интеграция с RAG:**
   - Автоматическое создание чанков
   - Векторизация текста
   - Семантический поиск

5. **Превью:**
   - PDF в браузере
   - Thumbnail для изображений
   - Конвертация в HTML

---

## 📚 Связанные модули

- **Identity Module** — Аутентификация владельцев документов
- **Lawyer Module** — Доступ юристов к документам клиентов (будущее)
- **Consultation Module** (TODO) — Связь документов с консультациями
- **Chat Module + RAG** (TODO) — Использование извлеченного текста для AI

---

## 📧 Контакты

- **Email**: modera@erarta.ai, evgeniy@erarta.ai
- **Repository**: https://github.com/erarta/advocata
- **Documentation**: `/docs`

---

**Версия**: 1.0
**Дата создания**: 14 ноября 2024
**Статус**: ✅ Production Ready
