# ADVOCATA - Разделение Задач по Субагентам

## Обзор

Этот документ описывает конкретные задачи для каждого субагента (AI-ассистента) в процессе разработки платформы Advocata.

---

## Phase 0: Подготовка (Недели 1-2)

### DevOps Agent
**Задачи:**
```
1. Настройка Supabase instance
   - Создать проект на российских серверах
   - Настроить PostgreSQL database
   - Настроить Auth providers
   - Настроить Storage buckets

2. Setup Git repositories
   - Создать monorepo структуру
   - Настроить branch protection rules
   - Setup PR templates

3. CI/CD Pipeline
   - GitHub Actions для backend
   - GitHub Actions для mobile (iOS/Android)
   - GitHub Actions для admin panel
   - Automated testing на PR
   - Deployment pipelines (staging + production)

4. Development Environment
   - Docker compose для локальной разработки
   - Environment variables setup
   - Database seeds для dev

5. Monitoring Setup
   - Sentry для error tracking
   - Application monitoring
   - Log aggregation
```

**Deliverables:**
- ✅ Работающая CI/CD pipeline
- ✅ Dev & staging environments
- ✅ Monitoring dashboard

---

### Documentation Agent
**Задачи:**
```
1. Ubiquitous Language
   - Определить ключевые термины домена
   - Создать глоссарий
   - Валидация с domain experts

2. Domain Model
   - Event Storming результаты
   - Bounded Contexts map
   - Context relationships (Context Map)

3. Architecture Documentation
   - C4 диаграммы (Context, Container, Component)
   - ADRs (Architecture Decision Records)
   - Technology choices rationale

4. Setup Documentation Tools
   - Notion/Confluence workspace
   - API documentation (OpenAPI)
   - Code documentation standards
```

**Deliverables:**
- ✅ Ubiquitous Language document
- ✅ Domain Model documentation
- ✅ Architecture ADRs

---

## Phase 1: MVP Backend (Недели 3-6)

### Backend Dev Agent #1: Identity & Auth Context
**Задачи:**
```
Week 3-4:

1. Domain Layer
   ├─ User entity
   │  ├─ User.create() factory method
   │  ├─ verifyEmail() method
   │  ├─ updateProfile() method
   │  └─ Domain events (UserCreated, EmailVerified)
   │
   ├─ Value Objects
   │  ├─ Email (with validation)
   │  ├─ PhoneNumber (Russian format)
   │  ├─ UserId
   │  └─ UserRole (Client, Lawyer, Admin)
   │
   └─ Repositories (interfaces)
      └─ IUserRepository

2. Application Layer
   ├─ Commands
   │  ├─ RegisterUserCommand + Handler
   │  ├─ VerifyOTPCommand + Handler
   │  └─ RefreshTokenCommand + Handler
   │
   └─ Queries
      └─ GetUserProfileQuery + Handler

3. Infrastructure Layer
   ├─ Supabase Auth integration
   ├─ UserRepository implementation
   ├─ JWT service
   └─ OTP service (email sending)

4. Presentation Layer
   ├─ AuthController
   │  ├─ POST /auth/register
   │  ├─ POST /auth/send-otp
   │  ├─ POST /auth/verify-otp
   │  └─ POST /auth/refresh-token
   │
   ├─ Guards
   │  └─ JwtAuthGuard
   │
   └─ DTOs & Validation
      ├─ RegisterUserDTO
      ├─ VerifyOTPDTO
      └─ RefreshTokenDTO

5. Tests
   ├─ Unit tests (Domain Layer)
   ├─ Integration tests (Repository)
   └─ API tests (Controller)
```

**Deliverables:**
- ✅ Полностью работающий Auth Context
- ✅ API endpoints для аутентификации
- ✅ 80%+ test coverage

**Файлы:**
```
backend/src/modules/identity/
├─ domain/
│  ├─ entities/
│  │  ├─ user.entity.ts
│  │  └─ __tests__/user.spec.ts
│  ├─ value-objects/
│  │  ├─ email.vo.ts
│  │  ├─ phone-number.vo.ts
│  │  └─ __tests__/
│  └─ repositories/
│     └─ user.repository.interface.ts
│
├─ application/
│  ├─ commands/
│  │  ├─ register-user/
│  │  │  ├─ register-user.command.ts
│  │  │  ├─ register-user.handler.ts
│  │  │  └─ __tests__/register-user.spec.ts
│  │  └─ verify-otp/
│  └─ queries/
│
├─ infrastructure/
│  ├─ persistence/
│  │  ├─ user.repository.ts
│  │  └─ __tests__/user.repository.integration.spec.ts
│  └─ services/
│     ├─ jwt.service.ts
│     └─ otp.service.ts
│
└─ presentation/
   ├─ controllers/
   │  ├─ auth.controller.ts
   │  └─ __tests__/auth.controller.integration.spec.ts
   └─ dtos/
      ├─ register-user.dto.ts
      └─ verify-otp.dto.ts
```

---

### Backend Dev Agent #2: Lawyer Management Context
**Задачи:**
```
Week 5-6:

1. Domain Layer
   ├─ Lawyer aggregate
   │  ├─ Lawyer.create()
   │  ├─ verify(verificationResult)
   │  ├─ updateAvailability(timeSlots)
   │  ├─ setOnline(isOnline)
   │  └─ Domain events
   │
   ├─ Value Objects
   │  ├─ LawyerProfile
   │  ├─ Specialization
   │  ├─ Experience
   │  ├─ Money
   │  └─ LawyerAvailability
   │
   └─ Domain Services
      └─ LawyerVerificationService

2. Application Layer
   ├─ Commands
   │  ├─ RegisterLawyerCommand + Handler
   │  ├─ VerifyLawyerCommand + Handler
   │  └─ UpdateAvailabilityCommand + Handler
   │
   └─ Queries
      ├─ SearchLawyersQuery + Handler
      ├─ GetLawyerDetailQuery + Handler
      └─ GetLawyerAvailabilityQuery + Handler

3. Infrastructure Layer
   ├─ LawyerRepository implementation
   ├─ Database schema для lawyers
   └─ External services
      └─ BarRegistryService (проверка лицензий)

4. Presentation Layer
   ├─ LawyerController
   │  ├─ GET /lawyers (search with filters)
   │  ├─ GET /lawyers/:id
   │  ├─ POST /lawyers
   │  ├─ PUT /lawyers/:id
   │  ├─ GET /lawyers/:id/availability
   │  └─ PUT /lawyers/:id/availability
   │
   └─ DTOs
      ├─ CreateLawyerDTO
      ├─ SearchLawyersDTO
      └─ UpdateAvailabilityDTO

5. Tests
   ├─ Unit tests (80%+ coverage)
   ├─ Integration tests (Repository)
   └─ API tests
```

**Deliverables:**
- ✅ Lawyer Management Context
- ✅ Search & filter API
- ✅ Verification flow
- ✅ 80%+ test coverage

**Файлы:**
```
backend/src/modules/lawyer/
├─ domain/
│  ├─ entities/
│  │  ├─ lawyer.entity.ts
│  │  └─ __tests__/lawyer.spec.ts
│  ├─ value-objects/
│  │  ├─ lawyer-profile.vo.ts
│  │  ├─ specialization.vo.ts
│  │  ├─ experience.vo.ts
│  │  └─ __tests__/
│  └─ services/
│     └─ lawyer-verification.service.ts
│
├─ application/
│  ├─ commands/
│  │  ├─ register-lawyer/
│  │  ├─ verify-lawyer/
│  │  └─ update-availability/
│  └─ queries/
│     ├─ search-lawyers/
│     ├─ get-lawyer-detail/
│     └─ get-lawyer-availability/
│
├─ infrastructure/
│  ├─ persistence/
│  │  ├─ lawyer.repository.ts
│  │  └─ __tests__/lawyer.repository.integration.spec.ts
│  └─ services/
│     └─ bar-registry.service.ts
│
└─ presentation/
   ├─ controllers/
   │  ├─ lawyer.controller.ts
   │  └─ __tests__/lawyer.controller.integration.spec.ts
   └─ dtos/
```

---

### Testing Agent
**Задачи:**
```
Week 3-6:

1. Setup Testing Infrastructure
   ├─ Jest configuration
   ├─ Test database setup
   ├─ Mock factories
   └─ Test utilities

2. Unit Tests для Identity Context
   ├─ User entity tests
   ├─ Value object tests (Email, PhoneNumber)
   ├─ Use case tests (RegisterUser, VerifyOTP)
   └─ Target: 90%+ coverage

3. Unit Tests для Lawyer Context
   ├─ Lawyer entity tests
   ├─ Value object tests (Specialization, Experience)
   ├─ Use case tests
   └─ Target: 90%+ coverage

4. Integration Tests
   ├─ Repository tests (with test DB)
   ├─ API endpoint tests
   └─ Authentication flow tests

5. Test Documentation
   └─ Testing guidelines document
```

**Deliverables:**
- ✅ Test infrastructure
- ✅ 80%+ overall coverage
- ✅ All tests passing in CI

---

## Phase 2: MVP Mobile App (Недели 7-10)

### Mobile Dev Agent #1: Rebrand + Auth
**Задачи:**
```
Week 7-8:

1. Rebranding
   ├─ Обновить app name (Zer0 → Advocata)
   ├─ Обновить app icon
   ├─ Обновить splash screen
   ├─ Обновить цветовую схему (AppColors)
   ├─ Обновить типографику (AppTextStyles)
   └─ Удалить food tracking features

2. Core Structure
   ├─ Настроить navigation (GoRouter)
   │  ├─ /onboarding
   │  ├─ /auth/login
   │  ├─ /auth/otp
   │  └─ /home
   │
   ├─ Создать domain models
   │  ├─ User entity
   │  ├─ Lawyer entity
   │  └─ Value objects
   │
   └─ Setup Riverpod providers
      ├─ authProvider
      ├─ userProfileProvider
      └─ supabaseProvider

3. Auth Flow
   ├─ OnboardingScreen
   │  ├─ Swipeable pages
   │  ├─ Skip button
   │  └─ Get Started button
   │
   ├─ LoginScreen
   │  ├─ Email input
   │  ├─ Phone input
   │  └─ Send OTP button
   │
   ├─ OTPVerificationScreen (переиспользовать из Zer0)
   │  ├─ 6-digit OTP input
   │  ├─ Auto-submit on complete
   │  ├─ Resend OTP timer
   │  └─ Error handling
   │
   └─ Integration с Backend Auth API
      ├─ POST /auth/send-otp
      └─ POST /auth/verify-otp

4. Tests
   ├─ Widget tests для auth screens
   ├─ Unit tests для auth providers
   └─ Integration tests для auth flow
```

**Deliverables:**
- ✅ Ребрендированное приложение
- ✅ Работающий auth flow
- ✅ Navigation setup

**Файлы:**
```
mobile/lib/
├─ core/
│  ├─ theme/
│  │  ├─ app_colors.dart
│  │  ├─ app_text_styles.dart
│  │  └─ app_theme.dart
│  └─ widgets/
│     ├─ buttons/
│     │  └─ primary_button.dart
│     └─ inputs/
│        └─ otp_input_field.dart
│
├─ features/
│  └─ auth/
│     ├─ domain/
│     │  ├─ entities/
│     │  │  └─ user.dart
│     │  └─ repositories/
│     │     └─ auth_repository.dart
│     ├─ data/
│     │  ├─ models/
│     │  │  └─ user_model.dart
│     │  ├─ datasources/
│     │  │  └─ auth_remote_datasource.dart
│     │  └─ repositories/
│     │     └─ auth_repository_impl.dart
│     └─ presentation/
│        ├─ providers/
│        │  └─ auth_provider.dart
│        ├─ screens/
│        │  ├─ onboarding_screen.dart
│        │  ├─ login_screen.dart
│        │  └─ otp_verification_screen.dart
│        └─ widgets/
│
└─ config/
   ├─ router.dart
   └─ supabase_config.dart
```

---

### Mobile Dev Agent #2: Lawyer Features
**Задачи:**
```
Week 9-10:

1. Home Screen
   ├─ Main layout с bottom navigation
   │  ├─ Home tab
   │  ├─ Search tab
   │  ├─ Consultations tab
   │  └─ Profile tab
   │
   ├─ Quick actions cards
   │  ├─ "Консультация" card
   │  ├─ "Вызов юриста" card
   │  ├─ "Шаблоны документов" card
   │  └─ "Каталог юристов" card
   │
   └─ Recent consultations list

2. Lawyers Search
   ├─ LawyersListScreen
   │  ├─ Search bar
   │  ├─ Filter button → FilterBottomSheet
   │  ├─ LawyerCard list (ListView.builder)
   │  └─ Pull-to-refresh
   │
   ├─ FilterBottomSheet
   │  ├─ Specialization chips
   │  ├─ City dropdown
   │  ├─ Price range slider
   │  ├─ Rating filter
   │  └─ Apply filters button
   │
   └─ Integration с Backend
      └─ GET /lawyers?specializations=...&city=...

3. Lawyer Detail
   ├─ LawyerDetailScreen
   │  ├─ Lawyer profile info
   │  │  ├─ Avatar
   │  │  ├─ Name, specializations
   │  │  ├─ Experience, rating
   │  │  └─ Hourly rate
   │  │
   │  ├─ About section (bio)
   │  ├─ Education & certificates
   │  ├─ Reviews list
   │  ├─ Availability calendar
   │  │
   │  └─ Action buttons
   │     ├─ "Забронировать" (primary)
   │     └─ "Написать" (secondary)
   │
   └─ Integration
      └─ GET /lawyers/:id

4. Booking Flow (Simplified for MVP)
   ├─ ConsultationBookingScreen
   │  ├─ Type selection (video, phone, in-person)
   │  ├─ Date picker
   │  ├─ Time slot selection
   │  ├─ Duration selector
   │  ├─ Price summary
   │  └─ Confirm button
   │
   └─ Success screen
      └─ Booking confirmed

5. Reusable Widgets
   ├─ LawyerCard
   │  ├─ Avatar
   │  ├─ Name + specializations
   │  ├─ Rating + reviews
   │  ├─ Price
   │  └─ Online indicator
   │
   ├─ SpecializationTag
   └─ RatingStars

6. Tests
   ├─ Widget tests для screens
   ├─ Widget tests для components
   └─ Integration test для lawyer search flow
```

**Deliverables:**
- ✅ Home screen
- ✅ Lawyer search & filters
- ✅ Lawyer detail
- ✅ Basic booking flow

**Файлы:**
```
mobile/lib/features/
├─ home/
│  └─ presentation/
│     ├─ screens/
│     │  └─ home_screen.dart
│     └─ widgets/
│        └─ quick_action_card.dart
│
├─ lawyer/
│  ├─ domain/
│  │  ├─ entities/
│  │  │  └─ lawyer.dart
│  │  └─ repositories/
│  │     └─ lawyer_repository.dart
│  │
│  ├─ data/
│  │  ├─ models/
│  │  │  └─ lawyer_model.dart
│  │  ├─ datasources/
│  │  │  └─ lawyer_remote_datasource.dart
│  │  └─ repositories/
│  │     └─ lawyer_repository_impl.dart
│  │
│  └─ presentation/
│     ├─ providers/
│     │  ├─ lawyer_search_provider.dart
│     │  └─ lawyer_detail_provider.dart
│     ├─ screens/
│     │  ├─ lawyers_list_screen.dart
│     │  └─ lawyer_detail_screen.dart
│     └─ widgets/
│        ├─ lawyer_card.dart
│        ├─ filter_bottom_sheet.dart
│        └─ specialization_tag.dart
│
└─ consultation/
   └─ presentation/
      └─ screens/
         └─ consultation_booking_screen.dart
```

---

## Phase 3: Consultation & Payment (Недели 11-14)

### Backend Dev Agent #3: Consultation Context
**Задачи:**
```
Week 11-12:

1. Domain Layer
   ├─ Consultation aggregate
   │  ├─ create()
   │  ├─ start()
   │  ├─ complete()
   │  ├─ cancel()
   │  └─ addMessage()
   │
   ├─ Value Objects
   │  ├─ ConsultationType (video, phone, in_person)
   │  ├─ ConsultationStatus
   │  └─ DateRange
   │
   └─ Domain Services
      └─ ConsultationAvailabilityService
         ├─ checkAvailability()
         └─ findAvailableSlots()

2. Application Layer
   ├─ Commands
   │  ├─ BookConsultationCommand + Handler
   │  ├─ StartConsultationCommand + Handler
   │  ├─ CompleteConsultationCommand + Handler
   │  └─ CancelConsultationCommand + Handler
   │
   └─ Queries
      ├─ GetConsultationQuery + Handler
      └─ GetConsultationHistoryQuery + Handler

3. Infrastructure Layer
   ├─ ConsultationRepository
   ├─ Database schema
   └─ Real-time messaging
      └─ Supabase Realtime integration

4. Presentation Layer
   ├─ ConsultationController
   │  ├─ POST /consultations (book)
   │  ├─ GET /consultations (history)
   │  ├─ GET /consultations/:id
   │  ├─ POST /consultations/:id/start
   │  ├─ POST /consultations/:id/complete
   │  ├─ POST /consultations/:id/cancel
   │  ├─ GET /consultations/:id/messages
   │  └─ POST /consultations/:id/messages
   │
   └─ WebSocket endpoint для real-time chat

5. Tests
   ├─ Unit tests (Consultation aggregate)
   ├─ Integration tests (Repository)
   └─ E2E test (booking flow)
```

**Deliverables:**
- ✅ Consultation Context
- ✅ Booking API
- ✅ Real-time messaging
- ✅ 80%+ test coverage

---

### Backend Dev Agent #4: Payment Context
**Задачи:**
```
Week 11-12:

1. Domain Layer
   ├─ Payment aggregate
   │  ├─ create()
   │  ├─ markAsProcessing()
   │  ├─ markAsSucceeded()
   │  ├─ markAsFailed()
   │  └─ refund()
   │
   ├─ Subscription aggregate
   │  ├─ create()
   │  ├─ useConsultation()
   │  ├─ renew()
   │  └─ cancel()
   │
   └─ Value Objects
      ├─ Money
      ├─ PaymentMethod
      └─ SubscriptionPlan

2. Application Layer
   ├─ Commands
   │  ├─ CreatePaymentCommand + Handler
   │  ├─ ProcessPaymentCommand + Handler
   │  ├─ RefundPaymentCommand + Handler
   │  ├─ CreateSubscriptionCommand + Handler
   │  └─ CancelSubscriptionCommand + Handler
   │
   └─ Queries
      ├─ GetPaymentHistoryQuery
      └─ GetSubscriptionQuery

3. Infrastructure Layer
   ├─ PaymentRepository
   ├─ SubscriptionRepository
   └─ Payment Gateway Integration
      └─ ЮКасса API
         ├─ createPayment()
         ├─ capturePayment()
         └─ refundPayment()

4. Presentation Layer
   ├─ PaymentController
   │  ├─ POST /payments (create payment)
   │  ├─ GET /payments (history)
   │  ├─ GET /payments/:id
   │  └─ POST /payments/:id/refund
   │
   ├─ SubscriptionController
   │  ├─ POST /subscriptions (create)
   │  ├─ GET /subscriptions (current)
   │  ├─ PUT /subscriptions/:id (update)
   │  └─ DELETE /subscriptions/:id (cancel)
   │
   └─ Webhook endpoint
      └─ POST /webhooks/yookassa

5. Tests
   ├─ Unit tests (Payment, Subscription)
   ├─ Integration tests
   └─ Mock ЮКасса responses
```

**Deliverables:**
- ✅ Payment Context
- ✅ ЮКасса integration
- ✅ Subscription management
- ✅ Webhook handling

---

### Mobile Dev Agent #3: Consultation Features
**Задачи:**
```
Week 13-14:

1. Booking Screen (Extended)
   ├─ ConsultationBookingScreen
   │  ├─ Lawyer info summary
   │  ├─ Type selection
   │  ├─ Date & time picker
   │  ├─ Duration selector
   │  ├─ Notes input (optional)
   │  ├─ Payment method selection
   │  ├─ Price breakdown
   │  └─ Confirm & Pay button
   │
   └─ Payment integration
      ├─ ЮКасса SDK integration
      ├─ Card input form
      └─ 3DS handling

2. Active Consultation Screen
   ├─ ActiveConsultationScreen
   │  ├─ Lawyer info header
   │  ├─ Consultation timer
   │  ├─ Chat messages list
   │  ├─ Message input
   │  ├─ Send button
   │  ├─ Attach document button
   │  └─ End consultation button
   │
   ├─ Real-time chat
   │  ├─ WebSocket connection
   │  ├─ Message sending
   │  ├─ Message receiving
   │  └─ Typing indicator
   │
   └─ Consultation timer
      ├─ Countdown display (MM:SS)
      ├─ Warning at 5 minutes left
      └─ Auto-end on time up

3. Consultation History
   ├─ ConsultationHistoryScreen
   │  ├─ Filter tabs (All, Upcoming, Completed, Cancelled)
   │  ├─ ConsultationCard list
   │  └─ Pull-to-refresh
   │
   ├─ Consultation detail
   │  ├─ Lawyer info
   │  ├─ Date, time, duration
   │  ├─ Price paid
   │  ├─ Notes
   │  ├─ Chat history
   │  └─ Rate & review button (if completed)
   │
   └─ Review flow
      ├─ Rating (1-5 stars)
      ├─ Comment textarea
      └─ Submit button

4. Widgets
   ├─ ConsultationCard
   │  ├─ Lawyer avatar + name
   │  ├─ Date & time
   │  ├─ Status badge
   │  └─ Action buttons
   │
   ├─ ChatBubble
   │  ├─ Sender/receiver styling
   │  ├─ Timestamp
   │  ├─ Read status
   │  └─ Document attachment
   │
   └─ ConsultationTimer
      ├─ Circular progress
      └─ Time display

5. Integration
   ├─ POST /consultations (booking)
   ├─ GET /consultations (history)
   ├─ GET /consultations/:id
   ├─ WebSocket connection для chat
   └─ POST /consultations/:id/messages

6. Tests
   ├─ Widget tests для consultation screens
   ├─ Widget tests для chat components
   └─ Integration test для full consultation flow
```

**Deliverables:**
- ✅ Booking screen с payment
- ✅ Active consultation screen
- ✅ Real-time chat
- ✅ Consultation history

---

## Phase 4: Admin Panel (Недели 15-17)

### Admin Agent: Admin Panel Development
**Задачи:**
```
Week 15-16:

1. Project Setup
   ├─ Next.js 14 (App Router)
   ├─ Shadcn/ui components
   ├─ Tailwind CSS
   ├─ React Query
   └─ Zustand для state

2. Authentication
   ├─ Login page
   ├─ Admin auth flow
   └─ Protected routes

3. Layout
   ├─ Sidebar navigation
   │  ├─ Dashboard
   │  ├─ Lawyers
   │  ├─ Users
   │  ├─ Consultations
   │  ├─ Payments
   │  ├─ Analytics
   │  └─ Settings
   │
   └─ Header
      ├─ Breadcrumbs
      ├─ Search
      └─ User menu

4. Lawyer Management
   ├─ Pending Lawyers Page
   │  ├─ Table с pending lawyers
   │  ├─ Filters (date, specialization)
   │  └─ Quick actions
   │
   ├─ Lawyer Detail Modal
   │  ├─ Personal info
   │  ├─ Documents viewer
   │  ├─ Verification form
   │  └─ Approve/Reject buttons
   │
   └─ All Lawyers Page
      ├─ Table with filters
      ├─ Status filters
      └─ Search

5. User Management
   ├─ Users Table
   │  ├─ Search & filters
   │  ├─ Role filter
   │  └─ Status filter
   │
   └─ User Detail Modal
      ├─ Profile info
      ├─ Consultations history
      ├─ Payments history
      └─ Ban/Suspend actions

6. Consultation Management
   ├─ Consultations Table
   │  ├─ Status filters
   │  ├─ Date range picker
   │  └─ Search
   │
   └─ Consultation Detail Modal
      ├─ Client & Lawyer info
      ├─ Date, time, duration
      ├─ Chat messages
      └─ Refund button (if needed)

7. API Integration
   ├─ API client setup (axios)
   ├─ React Query hooks
   │  ├─ useLawyers()
   │  ├─ useUsers()
   │  ├─ useConsultations()
   │  └─ useVerifyLawyer()
   │
   └─ Error handling

Week 17:

8. Analytics Dashboard
   ├─ KPI Cards
   │  ├─ Total Users
   │  ├─ Active Consultations Today
   │  ├─ Revenue (Today, This Month)
   │  └─ Average Rating
   │
   ├─ Charts
   │  ├─ Revenue Chart (monthly)
   │  ├─ Users Growth Chart
   │  ├─ Consultations Chart (daily)
   │  └─ Top Lawyers (by rating/consultations)
   │
   └─ Recent Activity Feed
      ├─ New registrations
      ├─ Completed consultations
      └─ Pending verifications

9. Reports
   ├─ Export to CSV
   ├─ Date range selection
   └─ Custom filters

10. Tests
    ├─ Component tests (React Testing Library)
    └─ E2E tests (Playwright)
```

**Deliverables:**
- ✅ Работающая админ панель
- ✅ Lawyer verification flow
- ✅ Analytics dashboard
- ✅ Reports export

**Файлы:**
```
admin/src/
├─ app/
│  ├─ (auth)/
│  │  └─ login/
│  │     └─ page.tsx
│  │
│  └─ (dashboard)/
│     ├─ page.tsx (Dashboard)
│     ├─ lawyers/
│     │  ├─ page.tsx
│     │  ├─ pending/
│     │  │  └─ page.tsx
│     │  └─ [id]/
│     │     └─ page.tsx
│     ├─ users/
│     │  ├─ page.tsx
│     │  └─ [id]/
│     │     └─ page.tsx
│     ├─ consultations/
│     │  └─ page.tsx
│     └─ analytics/
│        └─ page.tsx
│
├─ components/
│  ├─ ui/ (Shadcn components)
│  ├─ layouts/
│  │  ├─ sidebar.tsx
│  │  └─ header.tsx
│  ├─ lawyers/
│  │  ├─ lawyer-table.tsx
│  │  ├─ verification-form.tsx
│  │  └─ document-viewer.tsx
│  └─ analytics/
│     ├─ revenue-chart.tsx
│     └─ users-chart.tsx
│
└─ lib/
   ├─ api/
   │  └─ client.ts
   └─ hooks/
      ├─ use-lawyers.ts
      ├─ use-users.ts
      └─ use-analytics.ts
```

---

## Phase 5: Landing Page (Неделя 18)

### Landing Agent: Landing Development
**Задачи:**
```
Week 18:

1. Project Setup
   ├─ Next.js 14
   ├─ Tailwind CSS
   ├─ Framer Motion
   └─ SEO optimization

2. Hero Section
   ├─ Headline + Subheadline
   ├─ CTA buttons
   ├─ Key metrics showcase
   └─ Gradient background + animations

3. Problem Section
   ├─ Pain points для clients
   ├─ Pain points для lawyers
   └─ Visual elements

4. Solution Section
   ├─ How it works
   ├─ Key features
   └─ Screenshots/mockups

5. Market Opportunity Section
   ├─ Market size
   ├─ Growth rate
   ├─ Competition analysis
   └─ Data visualization

6. Business Model Section
   ├─ Pricing tiers
   ├─ Revenue streams
   └─ Unit economics

7. Traction Section (if available)
   ├─ User growth
   ├─ Revenue
   └─ Metrics

8. Team Section
   ├─ Founder profiles
   ├─ Key team members
   └─ Advisors

9. Investment Ask Section
   ├─ Funding needs
   ├─ Use of funds
   └─ CTA (Download pitch deck)

10. Contact Section
    ├─ Contact form
    ├─ Email
    └─ Social links

11. Responsive Design
    ├─ Mobile optimization
    ├─ Tablet optimization
    └─ Desktop optimization

12. Animations
    ├─ Scroll animations (Framer Motion)
    ├─ Section transitions
    └─ Micro-interactions

13. SEO
    ├─ Meta tags
    ├─ Open Graph tags
    ├─ JSON-LD structured data
    └─ Sitemap

14. Deployment
    └─ Vercel deployment
```

**Deliverables:**
- ✅ Professional landing page
- ✅ Responsive design
- ✅ Smooth animations
- ✅ SEO optimized

---

## Phase 6: Advanced Features (Недели 19-22)

### Backend Dev Agent: Advanced Features
**Задачи:**
```
Week 19-20: Video Calls

1. Video Call Integration
   ├─ Choose provider (Agora vs Twilio vs Jitsi)
   ├─ Create VideoCallSession entity
   └─ Implement endpoints
      ├─ POST /consultations/:id/video/start
      ├─ POST /consultations/:id/video/join
      └─ POST /consultations/:id/video/end

Week 21: Notifications

1. Notification Context Implementation
   ├─ Domain Layer
   │  ├─ Notification aggregate
   │  └─ NotificationStrategy pattern
   │
   ├─ Application Layer
   │  └─ SendNotificationCommand
   │
   └─ Infrastructure Layer
      ├─ Email (Resend/SendGrid)
      ├─ SMS (Twilio/local provider)
      └─ Push (Firebase Cloud Messaging)

2. Notification Triggers
   ├─ On consultation booked
   ├─ On consultation starting (15 min before)
   ├─ On consultation completed
   ├─ On payment received
   └─ On lawyer verified

Week 22: Documents & Templates

1. Document Context
   ├─ Document aggregate
   ├─ DocumentTemplate aggregate
   └─ Endpoints
      ├─ POST /documents (upload)
      ├─ GET /documents/:id (download)
      ├─ GET /document-templates
      └─ POST /document-templates/:id/fill
```

**Deliverables:**
- ✅ Video call integration
- ✅ Notification system
- ✅ Document management

---

### Mobile Dev Agent: Advanced Features UI
**Задачи:**
```
Week 19-20: Video Call UI

1. Video Call Screen
   ├─ Camera preview
   ├─ Remote video display
   ├─ Controls
   │  ├─ Mute/Unmute
   │  ├─ Camera on/off
   │  ├─ Switch camera
   │  ├─ End call
   │  └─ Chat toggle
   │
   └─ Network quality indicator

Week 21: Notifications

1. Push Notifications
   ├─ Firebase setup
   ├─ Permission request
   ├─ Token registration
   └─ Notification handlers

2. In-App Notifications
   ├─ Notification list screen
   ├─ Notification badge
   └─ Mark as read

Week 22: Documents

1. Document Features
   ├─ Document upload
   ├─ Document viewer (PDF)
   ├─ Document list
   └─ Template selection
```

**Deliverables:**
- ✅ Video call screens
- ✅ Push notifications
- ✅ Document management UI

---

## Phase 7: Testing & Polish (Недели 23-24)

### QA Agent: Quality Assurance
**Задачи:**
```
Week 23:

1. Test Planning
   ├─ Test cases document
   ├─ Test scenarios
   └─ Edge cases list

2. Manual Testing
   ├─ Regression testing
   │  ├─ Auth flow
   │  ├─ Lawyer search
   │  ├─ Booking flow
   │  ├─ Consultation flow
   │  └─ Payment flow
   │
   ├─ Device Testing
   │  ├─ iOS (iPhone 12, 13, 14, 15)
   │  ├─ Android (Samsung, Pixel, Xiaomi)
   │  └─ Tablet testing
   │
   └─ Edge Cases
      ├─ Poor network conditions
      ├─ Background/foreground transitions
      ├─ Interrupted flows
      └─ Error states

3. Bug Reporting
   ├─ Create bug tickets (Jira/Linear)
   ├─ Assign priority
   ├─ Attach screenshots/videos
   └─ Steps to reproduce

Week 24:

4. Final QA Round
   ├─ Verify bug fixes
   ├─ Re-test critical flows
   └─ Sign off for release
```

**Deliverables:**
- ✅ Test report
- ✅ All critical bugs fixed
- ✅ QA sign-off

---

### Bug Fix Agent: Bug Resolution
**Задачи:**
```
Week 23-24:

1. Critical Bugs (P0)
   - Fix within 24 hours
   - Blockers for release

2. High Priority Bugs (P1)
   - Fix within 48 hours
   - Major issues

3. Medium Priority Bugs (P2)
   - Fix within 1 week
   - Nice-to-have fixes

4. Bug Fix Process
   ├─ Reproduce bug
   ├─ Write failing test
   ├─ Fix code
   ├─ Verify test passes
   └─ Deploy to staging
```

**Deliverables:**
- ✅ All P0 and P1 bugs fixed
- ✅ P2 bugs tracked for post-launch

---

### Performance Agent: Optimization
**Задачи:**
```
Week 24:

1. Backend Performance
   ├─ Profile API endpoints
   ├─ Optimize slow queries
   ├─ Add database indexes
   ├─ Implement caching (Redis)
   └─ Load testing (k6)

2. Mobile Performance
   ├─ Reduce app size
   ├─ Optimize images
   ├─ Lazy loading
   ├─ Memory profiling
   └─ Battery usage optimization

3. Performance Metrics
   ├─ API response time (p95 < 500ms)
   ├─ App launch time (< 3s)
   ├─ Time to interactive (< 5s)
   └─ Crash rate (< 1%)
```

**Deliverables:**
- ✅ Performance benchmarks met
- ✅ Load test report

---

## Субагенты: Сводная Таблица

| Phase | Agent | Weeks | Key Deliverables |
|-------|-------|-------|------------------|
| 0 | DevOps | 1-2 | CI/CD, Infrastructure |
| 0 | Documentation | 1-2 | Domain Model, ADRs |
| 1 | Backend #1 | 3-4 | Identity Context |
| 1 | Backend #2 | 5-6 | Lawyer Context |
| 1 | Testing | 3-6 | Unit + Integration Tests |
| 2 | Mobile #1 | 7-8 | Rebrand + Auth |
| 2 | Mobile #2 | 9-10 | Lawyer Features |
| 3 | Backend #3 | 11-12 | Consultation Context |
| 3 | Backend #4 | 11-12 | Payment Context |
| 3 | Mobile #3 | 13-14 | Consultation UI |
| 4 | Admin | 15-17 | Admin Panel |
| 5 | Landing | 18 | Landing Page |
| 6 | Backend Advanced | 19-22 | Video, Notifications, Docs |
| 6 | Mobile Advanced | 19-22 | Advanced UI |
| 7 | QA | 23-24 | Testing |
| 7 | Bug Fix | 23-24 | Bug Fixes |
| 7 | Performance | 24 | Optimization |

---

## Координация между Субагентами

### Daily Standups (Async)
- Что сделано вчера
- Что будет сделано сегодня
- Блокеры

### Weekly Sync
- Progress review
- Blockers resolution
- Next week planning

### Code Review Process
- All PRs require 1 approval
- Automated tests must pass
- No merge on Friday afternoons

---

## Инструменты для Координации

- **Code**: GitHub
- **Tasks**: Linear/Jira
- **Communication**: Slack/Telegram
- **Documentation**: Notion/Confluence
- **Design**: Figma

---

**Документ создан**: 13 ноября 2025
**Для**: Advocata Platform Development
