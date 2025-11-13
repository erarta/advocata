# Advocata Backend

Backend API для платформы Advocata - маркетплейса юридических услуг.

## Технологический стек

- **Runtime**: Node.js 20
- **Framework**: NestJS 10
- **Database**: PostgreSQL (via Supabase)
- **Cache**: Redis
- **Queue**: BullMQ
- **Architecture**: Domain-Driven Design + Clean Architecture

## Архитектура

Проект построен на принципах Domain-Driven Design (DDD) с разделением на Bounded Contexts:

```
src/
├── modules/                    # Bounded Contexts
│   ├── identity/              # Аутентификация и управление пользователями
│   ├── lawyer/                # Управление профилями юристов
│   ├── consultation/          # Консультации и бронирование
│   ├── payment/               # Платежи и подписки
│   ├── notification/          # Уведомления (Email, SMS, Push)
│   └── document/              # Документы и шаблоны
└── shared/                    # Shared Kernel
    ├── domain/                # Базовые классы DDD
    └── infrastructure/        # Инфраструктурные сервисы
```

### Структура каждого контекста

```
context/
├── domain/                    # Domain Layer - бизнес-логика
│   ├── entities/             # Сущности
│   ├── value-objects/        # Value Objects
│   └── services/             # Domain Services
├── application/              # Application Layer - use cases
│   ├── commands/             # Command handlers (write operations)
│   └── queries/              # Query handlers (read operations)
├── infrastructure/           # Infrastructure Layer - технические детали
│   ├── persistence/          # Repositories, ORM entities
│   └── services/             # External services integration
└── presentation/             # Presentation Layer - HTTP
    ├── controllers/          # REST API controllers
    └── dtos/                 # Data Transfer Objects
```

## Установка

```bash
# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.example .env

# Заполните .env файл актуальными значениями
```

## Разработка

```bash
# Запуск в режиме разработки
npm run start:dev

# Запуск с отладкой
npm run start:debug

# Сборка
npm run build

# Запуск production build
npm run start:prod
```

## Тестирование

```bash
# Unit тесты
npm run test

# Unit тесты в watch режиме
npm run test:watch

# Покрытие кода
npm run test:cov

# E2E тесты
npm run test:e2e
```

## Линтинг и форматирование

```bash
# Проверка кода
npm run lint

# Форматирование кода
npm run format
```

## Docker

```bash
# Сборка образа
docker build -t advocata-backend .

# Запуск контейнера
docker run -p 3000:3000 advocata-backend

# Использование docker-compose (из корня проекта)
docker-compose up backend
```

## База данных

```bash
# Генерация миграции
npm run migration:generate -- -n MigrationName

# Запуск миграций
npm run migration:run

# Откат миграции
npm run migration:revert
```

## API Documentation

После запуска приложения, документация Swagger доступна по адресу:

```
http://localhost:3000/api/docs
```

## Переменные окружения

Основные переменные окружения (см. `.env.example`):

- `NODE_ENV` - окружение (development/production)
- `PORT` - порт приложения (по умолчанию 3000)
- `SUPABASE_URL` - URL Supabase проекта
- `SUPABASE_ANON_KEY` - публичный ключ Supabase
- `REDIS_HOST` - хост Redis сервера
- `JWT_SECRET` - секретный ключ для JWT токенов

## Принципы разработки

### Domain-Driven Design (DDD)

1. **Ubiquitous Language** - используем общий язык с доменными экспертами
2. **Bounded Contexts** - каждый контекст имеет четкие границы
3. **Aggregates** - группируем связанные сущности
4. **Domain Events** - используем события для связи между контекстами

### SOLID Principles

1. **Single Responsibility** - один класс = одна ответственность
2. **Open/Closed** - открыты для расширения, закрыты для модификации
3. **Liskov Substitution** - подтипы должны быть заменяемы базовыми типами
4. **Interface Segregation** - узкие специализированные интерфейсы
5. **Dependency Inversion** - зависимости на абстракции, а не на конкретику

### Result Pattern

Вместо исключений для бизнес-логики используем Result паттерн:

```typescript
const result = await userService.createUser(dto);

if (result.isFailure) {
  return BadRequest(result.error);
}

return Ok(result.value);
```

## Структура проекта

- `src/modules/` - Bounded Contexts
- `src/shared/` - Shared Kernel (общий код)
- `src/config/` - Конфигурация приложения
- `test/` - Тесты
  - `unit/` - Unit тесты
  - `integration/` - Интеграционные тесты
  - `e2e/` - End-to-end тесты

## Дополнительная документация

- [CLAUDE.md](../../CLAUDE.md) - Руководство для AI ассистентов
- [Project Rules](../../.claude/project-rules.md) - Правила разработки
- [Coding Standards](../../.claude/coding-standards.md) - Стандарты кодирования
- [Testing Guidelines](../../.claude/testing-guidelines.md) - Руководство по тестированию

## Команда

Email: modera@erarta.ai, evgeniy@erarta.ai

## Лицензия

UNLICENSED - Proprietary
