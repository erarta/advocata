# ADVOCATA - Краткая Дорожная Карта Реализации

## Обзор

**Цель**: Создание платформы "Uber для юристов" с использованием DDD + SOLID принципов

**Timeline**: 24 недели (~6 месяцев)

**Команда**: 8-11 человек

**Инвестиции**: 110-170 млн рублей

---

## Технологический Стек

### Backend
- **Runtime**: Node.js/Bun
- **Framework**: NestJS
- **Database**: PostgreSQL (Supabase) - российские серверы
- **Cache**: Redis
- **Queue**: BullMQ

### Mobile
- **Framework**: Flutter 3.x
- **State Management**: Riverpod
- **Backend**: Supabase Client
- **Navigation**: GoRouter

### Admin Panel
- **Framework**: Next.js 14
- **UI**: Shadcn/ui + Tailwind
- **State**: React Query + Zustand

### Landing
- **Framework**: Next.js 14
- **Animation**: Framer Motion

---

## Архитектура (Domain-Driven Design)

### Bounded Contexts

1. **Identity & Access** - аутентификация, пользователи
2. **Lawyer Management** - профили юристов, верификация
3. **Consultation Management** - бронирование, проведение консультаций
4. **Payment** - платежи, подписки
5. **Notification** - Email, SMS, Push уведомления
6. **Document** - документы, шаблоны

### Слои архитектуры

```
┌─────────────────────────────────────┐
│ Presentation Layer (API/UI)          │ ← Controllers, Screens
├─────────────────────────────────────┤
│ Application Layer (Use Cases)        │ ← Commands, Queries
├─────────────────────────────────────┤
│ Domain Layer (Business Logic)        │ ← Entities, Value Objects
├─────────────────────────────────────┤
│ Infrastructure Layer (Technical)     │ ← Repositories, External APIs
└─────────────────────────────────────┘
```

---

## План по Фазам

### Phase 0: Подготовка (Недели 1-2)
**Задачи:**
- Набор команды
- Настройка инфраструктуры (Supabase, CI/CD)
- Development environment
- Базовая документация

**Deliverables:**
- ✅ Работающая CI/CD
- ✅ Dev & staging окружения
- ✅ Команда onboarded

---

### Phase 1: MVP Backend (Недели 3-6)
**Задачи:**
- Identity & Auth Context (User, OTP, JWT)
- Lawyer Management Context (регистрация, поиск)
- Database schema
- Unit + Integration tests

**Deliverables:**
- ✅ Auth API
- ✅ Lawyer search API
- ✅ 75%+ code coverage

**Субагенты:**
- Backend Dev Agent #1 (Identity)
- Backend Dev Agent #2 (Lawyer)
- Testing Agent

---

### Phase 2: MVP Mobile App (Недели 7-10)
**Задачи:**
- Ребрендинг Zer0 → Advocata
- Auth flow (OTP)
- Lawyer search & filters
- Lawyer detail & booking

**Deliverables:**
- ✅ iOS + Android app
- ✅ Auth + Lawyer search
- ✅ Booking flow

**Субагенты:**
- Mobile Dev Agent #1 (Rebrand + Auth)
- Mobile Dev Agent #2 (Lawyer features)

---

### Phase 3: Consultation & Payment (Недели 11-14)
**Задачи:**
- Backend: Consultation Context
- Backend: Payment Context (ЮКасса)
- Mobile: Booking screen
- Mobile: Active consultation screen
- Real-time chat

**Deliverables:**
- ✅ Полный цикл консультации
- ✅ Интеграция платежей
- ✅ Real-time messaging

**Субагенты:**
- Backend Dev Agent #3 (Consultation)
- Backend Dev Agent #4 (Payment)
- Mobile Dev Agent #3

---

### Phase 4: Admin Panel (Недели 15-17)
**Задачи:**
- Admin authentication
- Lawyer verification UI
- User management
- Analytics dashboard

**Deliverables:**
- ✅ Next.js admin panel
- ✅ Lawyer verification
- ✅ Analytics & KPIs

**Субагенты:**
- Admin Agent (Next.js)
- Analytics Agent

---

### Phase 5: Landing Page (Неделя 18)
**Задачи:**
- Hero, Problem/Solution sections
- Market opportunity
- Team & Investment ask
- Responsive design + animations

**Deliverables:**
- ✅ Лендинг для инвесторов
- ✅ Презентация для скачивания

**Субагенты:**
- Landing Agent
- Content Agent

---

### Phase 6: Advanced Features (Недели 19-22)
**Задачи:**
- Video calls (Agora/Twilio)
- Notifications (Email, SMS, Push)
- Documents & templates
- Payment subscriptions

**Deliverables:**
- ✅ Video calls в консультациях
- ✅ Система уведомлений
- ✅ Document management

**Субагенты:**
- Backend Dev Agent (advanced)
- Mobile Dev Agent (video/docs)
- Integration Agent

---

### Phase 7: Testing & Polish (Недели 23-24)
**Задачи:**
- Full regression testing
- Bug fixing (критические → средние)
- Performance optimization
- UI/UX polish
- Production deployment prep

**Deliverables:**
- ✅ Протестированное приложение
- ✅ Все критические баги исправлены
- ✅ Готовность к запуску

**Субагенты:**
- QA Agent
- Bug Fix Agent
- Performance Agent

---

## Стратегия Тестирования

### Test Pyramid
```
                  ▲
                 ╱│╲
                ╱ │ ╲  E2E Tests (10%)
               ╱──┼──╲
              ╱   │   ╲  Integration Tests (30%)
             ╱────┼────╲
            ╱═════╪═════╲ Unit Tests (60%)
           ═══════════════
```

### Coverage Goals
- Domain Layer: 90-100%
- Application Layer: 80-90%
- Infrastructure Layer: 70-80%
- Overall: 75-85%

### Tools
- **Backend**: Jest, Supertest, Playwright
- **Mobile**: flutter_test, integration_test, mockito

---

## Команда

### Минимальная команда (MVP)
- 1 CTO/Tech Lead
- 2 Backend Developers
- 2 Mobile Developers
- 1 Frontend Developer (Admin/Landing)
- 1 UI/UX Designer
- 1 QA Engineer
- 1 DevOps Engineer
- 1 Product Manager
- 1 Compliance Officer

**Total: 11 человек**

---

## Ключевые Риски и Митигация

### 1. Локализация данных (152-ФЗ)
**Риск**: Нарушение требований о хранении персональных данных
**Митигация**:
- Использовать только российские серверы
- End-to-end шифрование
- Regular compliance audits

### 2. Качество юристов
**Риск**: Низкое качество услуг вредит репутации
**Митигация**:
- Строгая верификация (лицензии, дипломы)
- Рейтинговая система
- Quality checks
- Быстрая реакция на жалобы

### 3. Высокий CAC
**Риск**: Дорогое привлечение клиентов
**Митигация**:
- Content marketing
- Referral program
- Partnerships (автошколы, страховые)
- Organic growth (SEO)

---

## Метрики Успеха

### Development Metrics
| Метрика | Target |
|---------|--------|
| Code Coverage | 75-85% |
| API Response Time (p95) | <500ms |
| Mobile Crash Rate | <1% |
| Build Success Rate | >95% |

### Business Metrics (1 год)
| Метрика | Target |
|---------|--------|
| Активные пользователи | 8,000 |
| Юристы на платформе | 200 |
| Консультации/месяц | 2,500 |
| MRR | 8M ₽ |
| Churn Rate | <5% |
| NPS Score | 60+ |

---

## Следующие Шаги

### Week 1
1. ✅ Нанять CTO и Tech Leads
2. ✅ Создать Supabase instance (РФ серверы)
3. ✅ Setup Git repos + CI/CD
4. ✅ Event Storming session
5. ✅ Fundraising презентация

### Week 2
1. ✅ Нанять разработчиков
2. ✅ Onboarding команды
3. ✅ Ubiquitous Language документ
4. ✅ Architecture Decision Records
5. ✅ Start Phase 1 development

---

## Важные Документы

1. **ADVOCATA_COMPLETE_PLAN.md** - Полный план разработки
2. **advocata_plan.md** - Бизнес-план и исследование рынка
3. **IMPLEMENTATION_ROADMAP.md** - Этот документ (краткая дорожная карта)

---

## Контакты Команды

- **Email**: modera@erarta.ai, evgeniy@erarta.ai
- **Project**: Advocata Platform
- **Repository**: https://github.com/erarta/advocata

---

**Создано**: 13 ноября 2025
**Версия**: 1.0
**Готовность к запуску**: Week 1
