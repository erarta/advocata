# Advocata Admin Panel

Панель администратора для управления платформой Advocata.

## Технологический стек

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## Возможности

- ✅ Управление пользователями
- ✅ Верификация юристов
- ✅ Мониторинг консультаций
- ✅ Аналитика и отчеты
- ✅ Управление платежами
- ✅ Просмотр документов

## Установка

```bash
# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.example .env

# Заполните .env файл
```

## Разработка

```bash
# Запуск в режиме разработки (порт 4000)
npm run dev

# Сборка
npm run build

# Запуск production build
npm run start

# Проверка типов
npm run type-check

# Линтинг
npm run lint
```

## Docker

```bash
# Сборка образа
docker build -t advocata-admin .

# Запуск контейнера
docker run -p 4000:4000 advocata-admin

# Использование docker-compose (из корня проекта)
docker-compose up admin
```

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── login/             # Страница входа
│   ├── (dashboard)/       # Защищенные маршруты
│   │   ├── lawyers/       # Управление юристами
│   │   ├── users/         # Управление пользователями
│   │   ├── consultations/ # Консультации
│   │   └── analytics/     # Аналитика
│   └── api/               # API routes
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты (Shadcn)
│   ├── layouts/          # Layout компоненты
│   ├── lawyers/          # Компоненты для юристов
│   └── analytics/        # Компоненты аналитики
├── lib/                  # Утилиты и хелперы
│   ├── api/             # API клиент
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Утилиты
└── styles/              # Глобальные стили
```

## Основные маршруты

- `/login` - Вход в систему
- `/` - Dashboard с аналитикой
- `/lawyers` - Список юристов
- `/lawyers/pending` - Юристы на верификации
- `/lawyers/[id]` - Профиль юриста
- `/users` - Управление пользователями
- `/consultations` - Консультации
- `/analytics` - Аналитика и отчеты

## Переменные окружения

- `NEXT_PUBLIC_API_URL` - URL backend API (по умолчанию: http://localhost:3000)
- `NEXTAUTH_URL` - URL приложения (по умолчанию: http://localhost:4000)
- `NEXTAUTH_SECRET` - Секретный ключ для NextAuth.js

## Дополнительная документация

- [CLAUDE.md](../../CLAUDE.md) - Руководство для AI ассистентов
- [Project Rules](../../.claude/project-rules.md) - Правила разработки
- [Coding Standards](../../.claude/coding-standards.md) - Стандарты кодирования

## Команда

Email: modera@erarta.ai, evgeniy@erarta.ai

## Лицензия

UNLICENSED - Proprietary
