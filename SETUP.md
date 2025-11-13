# Advocata - Руководство по настройке

Полное руководство по настройке платформы Advocata для разработки.

## Оглавление

1. [Требования](#требования)
2. [Быстрый старт с Docker](#быстрый-старт-с-docker)
3. [Ручная настройка](#ручная-настройка)
4. [Настройка Supabase](#настройка-supabase)
5. [Настройка внешних сервисов](#настройка-внешних-сервисов)
6. [Проверка установки](#проверка-установки)
7. [Troubleshooting](#troubleshooting)

---

## Требования

### Обязательные

- **Docker Desktop** (для Windows/Mac) или **Docker + Docker Compose** (для Linux)
  - Docker: >= 24.0
  - Docker Compose: >= 2.20
- **Git**: >= 2.40
- **Node.js**: >= 20.x (если запускаете без Docker)
- **Flutter**: >= 3.19.0 (для мобильного приложения)

### Рекомендуемые

- **VSCode** или **WebStorm/IntelliJ IDEA**
- **Postman** или **Insomnia** (для тестирования API)
- **pgAdmin** или **DBeaver** (для работы с БД)

---

## Быстрый старт с Docker

Самый простой способ запустить платформу:

### 1. Клонирование репозитория

```bash
git clone https://github.com/erarta/advocata.git
cd advocata
```

### 2. Настройка переменных окружения

```bash
# Корневой .env
cp .env.example .env

# Backend
cp apps/backend/.env.example apps/backend/.env

# Admin
cp apps/admin/.env.example apps/admin/.env
```

### 3. Запуск всех сервисов

```bash
# Запуск в фоновом режиме
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
```

### 4. Проверка статуса

```bash
# Проверить запущенные контейнеры
docker-compose ps

# Должны быть запущены:
# - advocata-postgres
# - advocata-redis
# - advocata-backend
# - advocata-admin
# - advocata-landing
```

### 5. Доступ к сервисам

После запуска:

- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api/docs
- **Admin Panel**: http://localhost:4000
- **Landing Page**: http://localhost:4001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 6. Остановка сервисов

```bash
# Остановить все контейнеры
docker-compose down

# Остановить и удалить volumes (БД будет очищена!)
docker-compose down -v
```

---

## Ручная настройка

Если вы хотите запускать сервисы отдельно без Docker:

### 1. Установка зависимостей

**Backend:**
```bash
cd apps/backend
npm install
```

**Admin:**
```bash
cd apps/admin
npm install
```

**Landing:**
```bash
cd apps/landing
npm install
```

**Mobile:**
```bash
cd apps/mobile
flutter pub get
```

### 2. Настройка PostgreSQL

**Установка (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**Создание базы данных:**
```bash
sudo -u postgres psql

CREATE DATABASE advocata;
CREATE USER advocata WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE advocata TO advocata;
\q
```

**Настройка .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=advocata
DB_PASSWORD=your-password
DB_DATABASE=advocata
```

### 3. Настройка Redis

**Установка (Ubuntu/Debian):**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Проверка:**
```bash
redis-cli ping
# Должно вернуть: PONG
```

### 4. Запуск сервисов

**Backend (терминал 1):**
```bash
cd apps/backend
npm run start:dev
```

**Admin (терминал 2):**
```bash
cd apps/admin
npm run dev
```

**Landing (терминал 3):**
```bash
cd apps/landing
npm run dev
```

**Mobile (терминал 4):**
```bash
cd apps/mobile
flutter run
```

---

## Настройка Supabase

**КРИТИЧЕСКИ ВАЖНО:** Для соответствия 152-ФЗ необходимо использовать российские серверы!

### 1. Создание проекта Supabase

1. Зайдите на https://supabase.com
2. Создайте новый проект
3. **Регион**: выберите ближайший российский регион или Self-hosted в РФ
4. Сохраните:
   - Project URL
   - Anon/Public Key
   - Service Role Key

### 2. Настройка переменных окружения

**apps/backend/.env:**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**apps/mobile/.env:**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Настройка базы данных

```sql
-- Включите необходимые расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создайте таблицы (миграции будут добавлены позже)
```

---

## Настройка внешних сервисов

### ЮКасса (Платежи)

1. Зарегистрируйтесь на https://yookassa.ru
2. Получите Shop ID и Secret Key
3. Добавьте в `apps/backend/.env`:

```env
YUKASSA_SHOP_ID=your-shop-id
YUKASSA_SECRET_KEY=your-secret-key
```

### Twilio (SMS)

1. Зарегистрируйтесь на https://www.twilio.com
2. Получите Account SID, Auth Token, Phone Number
3. Добавьте в `apps/backend/.env`:

```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+7XXXXXXXXXX
```

### SendGrid (Email)

1. Зарегистрируйтесь на https://sendgrid.com
2. Создайте API Key
3. Добавьте в `apps/backend/.env`:

```env
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@advocata.ru
```

### Agora (Видеозвонки)

1. Зарегистрируйтесь на https://www.agora.io
2. Создайте проект
3. Добавьте в `apps/backend/.env`:

```env
AGORA_APP_ID=your-app-id
AGORA_APP_CERTIFICATE=your-certificate
```

---

## Проверка установки

### 1. Проверка Backend API

```bash
# Health check
curl http://localhost:3000/health

# Swagger docs
open http://localhost:3000/api/docs
```

### 2. Проверка базы данных

```bash
# Подключение к PostgreSQL
docker-compose exec postgres psql -U advocata -d advocata

# Или напрямую (если установлен локально)
psql -h localhost -U advocata -d advocata
```

### 3. Проверка Redis

```bash
# Подключение к Redis
docker-compose exec redis redis-cli

# Или напрямую
redis-cli
```

### 4. Проверка фронтенда

- Admin: http://localhost:4000
- Landing: http://localhost:4001

---

## Troubleshooting

### Порты заняты

**Ошибка:** `Error: Port 3000 is already in use`

**Решение:**
```bash
# Найти процесс, использующий порт
lsof -i :3000

# Убить процесс
kill -9 <PID>

# Или изменить порт в docker-compose.yml
```

### Docker контейнеры не запускаются

**Решение:**
```bash
# Очистить старые контейнеры и volumes
docker-compose down -v

# Пересобрать образы
docker-compose build --no-cache

# Запустить заново
docker-compose up -d
```

### Проблемы с подключением к БД

**Решение:**
```bash
# Проверить логи PostgreSQL
docker-compose logs postgres

# Проверить, что контейнер запущен
docker-compose ps postgres

# Перезапустить БД
docker-compose restart postgres
```

### Ошибки миграций

**Решение:**
```bash
# Откатить последнюю миграцию
cd apps/backend
npm run migration:revert

# Запустить миграции заново
npm run migration:run
```

### Проблемы с npm install

**Решение:**
```bash
# Очистить кеш npm
npm cache clean --force

# Удалить node_modules и package-lock.json
rm -rf node_modules package-lock.json

# Переустановить зависимости
npm install
```

---

## Дополнительные команды

### Docker

```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Пересборка конкретного сервиса
docker-compose up -d --build backend

# Вход в контейнер
docker-compose exec backend sh

# Выполнение команды в контейнере
docker-compose exec backend npm run test
```

### Backend

```bash
# Запуск тестов
npm run test
npm run test:e2e
npm run test:cov

# Генерация миграции
npm run migration:generate -- -n MigrationName

# Линтинг
npm run lint
npm run format
```

### Mobile

```bash
# Запуск на Android
flutter run -d android

# Запуск на iOS
flutter run -d ios

# Тесты
flutter test
flutter test --coverage

# Сборка
flutter build apk --release
flutter build ios --release
```

---

## Следующие шаги

После успешной установки:

1. 📖 Прочитайте [CLAUDE.md](./CLAUDE.md) для понимания архитектуры
2. 📋 Ознакомьтесь с [Project Rules](./.claude/project-rules.md)
3. 🚀 Начните разработку согласно [IMPLEMENTATION_ROADMAP.md](./docs/IMPLEMENTATION_ROADMAP.md)

---

## Поддержка

Если у вас возникли проблемы:

- Email: modera@erarta.ai, evgeniy@erarta.ai
- GitHub Issues: https://github.com/erarta/advocata/issues

---

**Версия:** 1.0
**Последнее обновление:** 13 ноября 2025
