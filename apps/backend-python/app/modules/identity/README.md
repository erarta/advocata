# Identity & Access Module

**Bounded Context для управления идентификацией и доступом пользователей.**

## 📋 Описание

Identity Module отвечает за:
- 🔐 Регистрацию пользователей
- 📱 OTP верификацию (SMS/Email)
- 🎫 Аутентификацию (JWT токены)
- 👤 Управление профилями пользователей
- 🔑 Авторизацию и проверку ролей

## 🏗️ Архитектура

### Domain Layer
**Entities:**
- `User` - Агрегат пользователя с идентификацией и авторизацией

**Value Objects:**
- `Email` - Валидация и нормализация email
- `Phone` - Валидация и форматирование телефона (RU формат)
- `UserRole` - Роли пользователя (CLIENT, LAWYER, ADMIN)

**Domain Events:**
- `UserRegisteredEvent` - Пользователь зарегистрирован
- `UserVerifiedEvent` - Пользователь верифицирован
- `UserLoggedInEvent` - Пользователь вошел в систему

**Repositories:**
- `IUserRepository` - Интерфейс репозитория пользователей

**Domain Services:**
- `AuthDomainService` - Бизнес-логика аутентификации

### Application Layer
**Commands:**
- `RegisterUserCommand` - Регистрация нового пользователя
- `VerifyOTPCommand` - Проверка OTP кода
- `LoginUserCommand` - Вход в систему
- `RefreshTokenCommand` - Обновление access токена

**Queries:**
- `GetCurrentUserQuery` - Получить текущего пользователя
- `GetUserByIdQuery` - Получить пользователя по ID

**DTOs:**
- `UserDTO` - DTO для передачи данных пользователя
- `AuthTokensDTO` - DTO с JWT токенами

### Infrastructure Layer
**Persistence:**
- `UserModel` - SQLAlchemy модель
- `UserMapper` - Маппер Domain ↔ Model
- `UserRepositoryImpl` - Реализация репозитория

**Services:**
- `JWTService` - Генерация и валидация JWT токенов
- `OTPService` - Генерация и отправка OTP кодов
- `PasswordService` - Хеширование и проверка паролей

### Presentation Layer
**API Endpoints:**
```
POST   /api/v1/auth/register       - Регистрация
POST   /api/v1/auth/verify-otp     - Проверка OTP
POST   /api/v1/auth/login          - Вход
POST   /api/v1/auth/refresh        - Обновить токен
GET    /api/v1/auth/me             - Текущий пользователь
POST   /api/v1/auth/logout         - Выход
```

**Schemas:**
- `RegisterRequest` - Запрос регистрации
- `VerifyOTPRequest` - Запрос верификации
- `LoginRequest` - Запрос входа
- `UserResponse` - Ответ с данными пользователя
- `AuthResponse` - Ответ с токенами

## 🔒 Безопасность

### Аутентификация
- **JWT токены** с access (30 мин) и refresh (7 дней)
- **OTP верификация** через SMS/Email
- **Password hashing** с bcrypt (12 rounds)

### Авторизация
- **Role-based** access control
- **Dependency injection** для проверки ролей
- **Token blacklist** для logout

### Защита от атак
- **Rate limiting** на endpoints
- **OTP expiration** (5 минут)
- **Max OTP attempts** (3 попытки)
- **Password complexity** требования

## 📊 Диаграммы

### User Registration Flow
```
Client          API             Domain          Infrastructure
  |              |                |                    |
  |--Register--->|                |                    |
  |              |--Create User-->|                    |
  |              |                |--Hash Password---->|
  |              |                |<-------Done--------|
  |              |                |--Generate OTP----->|
  |              |                |<-------Done--------|
  |              |                |--Send SMS--------->|
  |              |<--User Created-|                    |
  |<--Response---|                |                    |
  |              |                |                    |
  |--Verify OTP->|                |                    |
  |              |--Verify------->|                    |
  |              |                |--Check OTP-------->|
  |              |                |<------Valid--------|
  |              |                |--Mark Verified---->|
  |              |<--Tokens-------|                    |
  |<--JWT Tokens-|                |                    |
```

### Authentication Flow
```
Client          API             Domain          JWT Service
  |              |                |                    |
  |---Login----->|                |                    |
  |              |--Authenticate->|                    |
  |              |                |--Verify Password-->|
  |              |                |<------Valid--------|
  |              |                |--Generate Tokens-->|
  |              |<--Tokens-------|<------Done---------|
  |<--JWT Tokens-|                |                    |
  |              |                |                    |
  |--Request---->|                |                    |
  | + Auth Header|--Validate----->|                    |
  |              |                |--Decode Token----->|
  |              |                |<------User ID------|
  |              |<--User---------|                    |
  |<--Response---|                |                    |
```

## 🧪 Тестирование

### Unit Tests
```bash
pytest tests/unit/identity/domain/
pytest tests/unit/identity/application/
```

### Integration Tests
```bash
pytest tests/integration/identity/
```

### E2E Tests
```bash
pytest tests/e2e/auth_flow_test.py
```

## 📝 Примеры использования

### Регистрация пользователя
```python
POST /api/v1/auth/register
{
  "phone": "+79991234567",
  "email": "user@example.com",
  "full_name": "Иван Иванов",
  "password": "SecurePass123!"
}

Response 201:
{
  "user_id": "uuid",
  "message": "OTP sent to +79991234567"
}
```

### Верификация OTP
```python
POST /api/v1/auth/verify-otp
{
  "phone": "+79991234567",
  "otp_code": "123456"
}

Response 200:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Получение текущего пользователя
```python
GET /api/v1/auth/me
Authorization: Bearer eyJ...

Response 200:
{
  "id": "uuid",
  "phone": "+79991234567",
  "email": "user@example.com",
  "full_name": "Иван Иванов",
  "role": "CLIENT",
  "is_verified": true,
  "created_at": "2025-01-01T00:00:00Z"
}
```

## 🔧 Конфигурация

См. переменные окружения в `.env`:
```env
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

## 📚 Дополнительная документация

- [Domain Model](./domain/README.md)
- [API Reference](../../docs/api/auth.md)
- [Security Best Practices](../../docs/security.md)

## 🗄️ База данных

### Миграции

Первая миграция создает таблицу `users`:

```bash
# Применить миграцию
alembic upgrade head

# Откатить миграцию
alembic downgrade -1

# Посмотреть историю
alembic history --verbose
```

### Схема таблицы users

```sql
CREATE TABLE users (
    -- Primary Key
    id VARCHAR(36) PRIMARY KEY,

    -- Identifiers
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,

    -- Profile
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT',

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified BOOLEAN NOT NULL DEFAULT false,

    -- OTP Verification
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMPTZ,
    otp_attempts INTEGER NOT NULL DEFAULT 0,

    -- Logging
    last_login_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for query optimization
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

**Версия:** 1.0.0
**Последнее обновление:** 2024-11-14
**Статус:** ✅ Полностью реализован (Domain + Application + Infrastructure + Presentation)
