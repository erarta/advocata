# ADVOCATA - Development Guide for AI Assistants

## 🎯 Project Overview

**Advocata** is an on-demand legal services marketplace platform - "Uber for lawyers". The platform connects clients with verified lawyers for emergency consultations (car accidents, arrests, labor disputes).

**Business Model:** Subscription-based + on-demand bookings
**Target Market:** Russia (starting with St. Petersburg)
**Timeline:** 24 weeks to MVP
**Architecture:** Domain-Driven Design + Microservices

---

## 📊 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │  Mobile   │  │   Web     │  │  Admin    │  │  Landing  │   │
│  │  (Flutter)│  │  (Future) │  │ (Next.js) │  │ (Next.js) │   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │
│        │              │              │              │           │
│        └──────────────┴──────────────┴──────────────┘           │
│                         │                                        │
│                         ▼                                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │             API Gateway / Load Balancer                    │ │
│  │             (Nginx / Traefik)                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│   Backend   │   │   Supabase   │   │  External    │
│  (NestJS)   │   │  (Database   │   │  Services    │
│             │   │   + Auth)    │   │              │
│  ┌───────┐  │   │              │   │ - ЮКасса     │
│  │ API   │  │   │ - PostgreSQL │   │ - Twilio     │
│  │ REST  │  │   │ - Auth       │   │ - SendGrid   │
│  │ WS    │  │   │ - Storage    │   │ - Agora/Jitsi│
│  └───────┘  │   │ - Realtime   │   │              │
└─────────────┘   └──────────────┘   └──────────────┘
      │                   │
      └───────┬───────────┘
              ▼
    ┌─────────────────┐
    │  Redis Cache    │
    └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │  Message Queue  │
    │    (BullMQ)     │
    └─────────────────┘
```

---

## 🏗️ Domain Model & Bounded Contexts

### Context Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADVOCATA SYSTEM                               │
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │  Identity &      │     │    Lawyer        │                 │
│  │  Access Context  │────▶│   Management     │                 │
│  │                  │     │    Context       │                 │
│  │ - User           │     │ - Lawyer         │                 │
│  │ - Auth           │     │ - Verification   │                 │
│  │ - Roles          │     │ - Availability   │                 │
│  └──────────────────┘     └──────────────────┘                 │
│           │                         │                            │
│           │                         │                            │
│           ▼                         ▼                            │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │  Consultation    │     │    Payment       │                 │
│  │    Management    │────▶│    Context       │                 │
│  │    Context       │     │                  │                 │
│  │ - Consultation   │     │ - Payment        │                 │
│  │ - Booking        │     │ - Subscription   │                 │
│  │ - Session        │     │ - Refund         │                 │
│  └──────────────────┘     └──────────────────┘                 │
│           │                                                      │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │  Notification    │     │    Document      │                 │
│  │    Context       │     │    Context       │                 │
│  │                  │     │                  │                 │
│  │ - Email          │     │ - Document       │                 │
│  │ - SMS            │     │ - Template       │                 │
│  │ - Push           │     │ - Signature      │                 │
│  └──────────────────┘     └──────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### Ubiquitous Language

| Term | Russian | Definition |
|------|---------|------------|
| **Client** | Клиент | Person seeking legal help |
| **Lawyer** | Юрист/Адвокат | Legal professional on platform |
| **Consultation** | Консультация | Session between client and lawyer |
| **Booking** | Бронирование | Scheduled consultation |
| **Verification** | Верификация | Process of validating lawyer credentials |
| **Specialization** | Специализация | Lawyer's area of expertise (ДТП, Уголовное право) |
| **Availability** | Доступность | Lawyer's working hours |
| **Session** | Сессия | Active consultation in progress |
| **Subscription** | Подписка | Monthly payment plan |
| **Emergency Call** | Экстренный вызов | Urgent lawyer request |

---

## 🐳 Docker Setup

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  Backend   │  │  Database  │  │   Redis    │        │
│  │  (NestJS)  │  │ (Postgres) │  │            │        │
│  │  Port:3000 │  │ Port:5432  │  │  Port:6379 │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Admin    │  │  Landing   │  │   Nginx    │        │
│  │  (Next.js) │  │  (Next.js) │  │            │        │
│  │  Port:4000 │  │ Port:4001  │  │  Port:80   │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: advocata-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://advocata:password@postgres:5432/advocata
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules
    networks:
      - advocata-network
    command: npm run start:dev

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: advocata-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=advocata
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=advocata
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backend/database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - advocata-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: advocata-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - advocata-network

  # Admin Panel
  admin:
    build:
      context: ./admin
      dockerfile: Dockerfile
    container_name: advocata-admin
    ports:
      - "4000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3000
    volumes:
      - ./admin:/app
      - /app/node_modules
      - /app/.next
    networks:
      - advocata-network
    command: npm run dev

  # Landing Page
  landing:
    build:
      context: ./landing
      dockerfile: Dockerfile
    container_name: advocata-landing
    ports:
      - "4001:3000"
    volumes:
      - ./landing:/app
      - /app/node_modules
      - /app/.next
    networks:
      - advocata-network
    command: npm run dev

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: advocata-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/certs:/etc/nginx/certs
    depends_on:
      - backend
      - admin
      - landing
    networks:
      - advocata-network

volumes:
  postgres-data:
  redis-data:

networks:
  advocata-network:
    driver: bridge
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=development /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Quick Start

```bash
# Development
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up -d --build backend

# Execute command in container
docker-compose exec backend npm run test

# Production
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🚀 Services & Components

### Backend Services (NestJS)

```
backend/
├── src/
│   ├── modules/
│   │   ├── identity/              # Identity & Access Context
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   │
│   │   ├── lawyer/                # Lawyer Management Context
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── lawyer.entity.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── specialization.vo.ts
│   │   │   │   │   └── experience.vo.ts
│   │   │   │   └── services/
│   │   │   │       └── lawyer-verification.service.ts
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── register-lawyer/
│   │   │   │   │   └── verify-lawyer/
│   │   │   │   └── queries/
│   │   │   │       ├── search-lawyers/
│   │   │   │       └── get-lawyer-detail/
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   └── lawyer.repository.ts
│   │   │   │   └── services/
│   │   │   └── presentation/
│   │   │       ├── controllers/
│   │   │       │   └── lawyer.controller.ts
│   │   │       └── dtos/
│   │   │
│   │   ├── consultation/          # Consultation Context
│   │   ├── payment/               # Payment Context
│   │   ├── notification/          # Notification Context
│   │   └── document/              # Document Context
│   │
│   ├── shared/                    # Shared Kernel
│   │   ├── domain/
│   │   │   ├── aggregate-root.ts
│   │   │   ├── entity.ts
│   │   │   ├── value-object.ts
│   │   │   ├── domain-event.ts
│   │   │   └── result.ts
│   │   └── infrastructure/
│   │       ├── database/
│   │       ├── cache/
│   │       └── event-bus/
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docker/
    ├── Dockerfile
    └── docker-compose.yml
```

### Mobile App (Flutter)

```
mobile/
├── lib/
│   ├── core/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   │   ├── supabase/
│   │   │   └── storage/
│   │   └── presentation/
│   │       ├── theme/
│   │       │   ├── app_colors.dart
│   │       │   └── app_text_styles.dart
│   │       └── widgets/
│   │           ├── buttons/
│   │           ├── inputs/
│   │           └── cards/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       ├── screens/
│   │   │       └── widgets/
│   │   │
│   │   ├── lawyer/
│   │   ├── consultation/
│   │   ├── payment/
│   │   └── profile/
│   │
│   ├── config/
│   │   ├── router.dart
│   │   └── supabase_config.dart
│   │
│   └── main.dart
│
└── test/
    ├── unit/
    ├── widget/
    └── integration/
```

### Admin Panel (Next.js)

```
admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   └── (dashboard)/
│   │       ├── page.tsx
│   │       ├── lawyers/
│   │       │   ├── page.tsx
│   │       │   ├── pending/
│   │       │   └── [id]/
│   │       ├── users/
│   │       ├── consultations/
│   │       └── analytics/
│   │
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   ├── layouts/
│   │   ├── lawyers/
│   │   └── analytics/
│   │
│   └── lib/
│       ├── api/
│       └── hooks/
│
└── public/
```

---

## 🔐 Security & Compliance

### Data Localization (152-ФЗ)

**CRITICAL:** All personal data MUST be stored on Russian servers.

```typescript
// Supabase configuration
const SUPABASE_URL = 'https://[russian-region].supabase.co';

// All database operations must go through Russian instance
// NO data transfer abroad without local buffering
```

### Encryption

```typescript
// End-to-end encryption for lawyer-client communications
import { encrypt, decrypt } from '@/shared/encryption';

// Encrypt sensitive data before storing
const encryptedMessage = encrypt(message, clientPublicKey);
await supabase.from('consultation_messages').insert({
  consultation_id: consultationId,
  content: encryptedMessage,
});
```

### Audit Logging

```typescript
// Log all data access and modifications
@Injectable()
export class AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    await this.supabase.from('audit_logs').insert({
      user_id: event.userId,
      action: event.action,
      entity_type: event.entityType,
      entity_id: event.entityId,
      old_value: event.oldValue,
      new_value: event.newValue,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      created_at: new Date(),
    });
  }
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Backend Tests
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Run linter
        run: |
          cd backend
          npm run lint

      - name: Run tests
        run: |
          cd backend
          npm run test
          npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  # Mobile Tests
  mobile-test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.0'

      - name: Install dependencies
        run: |
          cd mobile
          flutter pub get

      - name: Analyze
        run: |
          cd mobile
          flutter analyze

      - name: Run tests
        run: |
          cd mobile
          flutter test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./mobile/coverage/lcov.info

  # Backend Deploy (Staging)
  backend-deploy-staging:
    needs: backend-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: |
          docker build -t advocata-backend:staging ./backend

      - name: Push to registry
        run: |
          docker push advocata-backend:staging

      - name: Deploy to staging
        run: |
          # Deploy commands here

  # Backend Deploy (Production)
  backend-deploy-prod:
    needs: backend-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: |
          docker build -t advocata-backend:latest ./backend

      - name: Push to registry
        run: |
          docker push advocata-backend:latest

      - name: Deploy to production
        run: |
          # Deploy commands here
```

---

## 📈 Monitoring & Observability

### Metrics to Track

```typescript
// Custom metrics using Prometheus
import { Counter, Histogram } from 'prom-client';

// API Metrics
const apiRequestDuration = new Histogram({
  name: 'api_request_duration_seconds',
  help: 'Duration of API requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const apiRequestTotal = new Counter({
  name: 'api_request_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Business Metrics
const consultationsBooked = new Counter({
  name: 'consultations_booked_total',
  help: 'Total number of consultations booked',
});

const paymentsProcessed = new Counter({
  name: 'payments_processed_total',
  help: 'Total number of payments processed',
  labelNames: ['status'],
});
```

### Health Check Endpoint

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private databaseService: DatabaseService,
    private redisService: RedisService,
  ) {}

  @Get()
  async check(): Promise<HealthCheckResult> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkSupabase(),
    ]);

    const isHealthy = checks.every(check => check.status === 'ok');

    return {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    try {
      await this.databaseService.ping();
      return { name: 'database', status: 'ok' };
    } catch (error) {
      return { name: 'database', status: 'error', message: error.message };
    }
  }
}
```

### Logging

```typescript
// Structured logging with Winston
import { Logger } from 'winston';

logger.info('Consultation booked', {
  consultationId: consultation.id,
  clientId: consultation.clientId,
  lawyerId: consultation.lawyerId,
  scheduledTime: consultation.scheduledStart,
});

logger.error('Payment failed', {
  paymentId: payment.id,
  userId: payment.userId,
  amount: payment.amount,
  error: error.message,
  stack: error.stack,
});
```

---

## 🧪 Testing Strategy

### Test Pyramid

```
                  ▲
                 ╱│╲
                ╱ │ ╲
               ╱  │  ╲ E2E Tests (10%)
              ╱───┼───╲ - Playwright
             ╱    │    ╲ - Critical flows
            ╱─────┼─────╲
           ╱      │      ╲ Integration Tests (30%)
          ╱───────┼───────╲ - API tests
         ╱        │        ╲ - Database tests
        ╱─────────┼─────────╲
       ╱══════════╪══════════╲ Unit Tests (60%)
      ╱═══════════╪═══════════╲ - Domain logic
     ════════════════════════════ - Use cases
```

### Example Tests

**Unit Test (Domain Layer):**
```typescript
describe('Lawyer Entity', () => {
  describe('verify', () => {
    it('should verify pending lawyer successfully', () => {
      const lawyer = createPendingLawyer();
      const verificationResult = VerificationResult.approved();

      const result = lawyer.verify(verificationResult);

      expect(result.isSuccess).toBe(true);
      expect(lawyer.status).toBe(LawyerStatus.Active);
      expect(lawyer.domainEvents).toContainEqual(
        expect.objectContaining({
          _type: 'LawyerVerifiedEvent',
        })
      );
    });
  });
});
```

**Integration Test (API):**
```typescript
describe('Lawyer Controller', () => {
  it('should search lawyers by specialization', async () => {
    const response = await request(app.getHttpServer())
      .get('/lawyers?specializations=ДТП')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.items).toBeInstanceOf(Array);
    expect(response.body.items[0]).toHaveProperty('specializations');
  });
});
```

**E2E Test (Full Flow):**
```typescript
test('full consultation booking flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'client@example.com');
  await page.click('button[type="submit"]');

  // Search lawyers
  await page.goto('/lawyers');
  await page.fill('[name="search"]', 'ДТП');
  await page.click('.lawyer-card:first-child');

  // Book consultation
  await page.click('button:has-text("Забронировать")');
  await page.click('.time-slot:first-child');
  await page.click('button:has-text("Подтвердить")');

  // Verify booking
  await expect(page.locator('text=Консультация забронирована')).toBeVisible();
});
```

---

## 🔧 Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/erarta/advocata.git
cd advocata

# 2. Copy environment variables
cp .env.example .env

# 3. Start services with Docker
docker-compose up -d

# 4. Install dependencies (if not using Docker)
cd backend && npm install
cd ../mobile && flutter pub get
cd ../admin && npm install

# 5. Run database migrations
cd backend && npm run migration:run

# 6. Start development
# Backend
cd backend && npm run start:dev

# Mobile
cd mobile && flutter run

# Admin
cd admin && npm run dev
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/lawyer-search

# 2. Make changes and commit
git add .
git commit -m "feat(lawyer): add search with filters"

# 3. Push to remote
git push origin feature/lawyer-search

# 4. Create Pull Request on GitHub

# 5. After review and approval, merge to develop
```

### Code Review Checklist

Before submitting PR:
- [ ] Code follows DDD/SOLID principles
- [ ] Business logic in Domain Layer
- [ ] Tests written (coverage > 75%)
- [ ] No console.log / print statements
- [ ] Error handling implemented
- [ ] Types are explicit (no `any` / `dynamic`)
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance considered

---

## 📞 Key Contacts & Resources

### Documentation
- **Full Development Plan**: `/docs/ADVOCATA_COMPLETE_PLAN.md`
- **Implementation Roadmap**: `/docs/IMPLEMENTATION_ROADMAP.md`
- **Subagent Tasks**: `/docs/SUBAGENT_TASKS.md`
- **Project Rules**: `/.claude/project-rules.md`
- **Business Plan**: `/docs/advocata_plan.md`

### External Services

| Service | Purpose | Documentation |
|---------|---------|---------------|
| Supabase | Database + Auth | https://supabase.com/docs |
| ЮКасса | Payments | https://yookassa.ru/docs |
| Twilio | SMS | https://www.twilio.com/docs |
| SendGrid | Email | https://docs.sendgrid.com |
| Agora | Video Calls | https://docs.agora.io |

### Team Contacts
- **Email**: modera@erarta.ai, evgeniy@erarta.ai
- **Repository**: https://github.com/erarta/advocata

---

## 🎯 Quick Command Reference

### Backend
```bash
# Development
npm run start:dev

# Build
npm run build

# Tests
npm run test              # Unit tests
npm run test:e2e         # E2E tests
npm run test:cov         # Coverage

# Linting
npm run lint
npm run format

# Database
npm run migration:generate
npm run migration:run
npm run migration:revert
```

### Mobile
```bash
# Run
flutter run

# Build
flutter build apk        # Android
flutter build ios        # iOS

# Tests
flutter test            # Unit + Widget tests
flutter test --coverage # With coverage
flutter drive          # Integration tests

# Code generation
flutter pub run build_runner build --delete-conflicting-outputs
```

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild
docker-compose up -d --build

# Execute in container
docker-compose exec backend npm run test
```

---

## 🚀 Next Steps for AI Assistants

When working on Advocata:

1. **Read Project Rules**: Start with `/.claude/project-rules.md`
2. **Understand Domain**: Review bounded contexts and ubiquitous language
3. **Check Tasks**: See `/docs/SUBAGENT_TASKS.md` for your specific assignments
4. **Follow DDD**: Always start with Domain Layer
5. **Write Tests**: Maintain 75-85% coverage
6. **Use Docker**: Leverage Docker for consistent environments
7. **Document Changes**: Update relevant docs and ADRs
8. **Security First**: Always consider 152-ФЗ compliance

---

**Version**: 1.0
**Last Updated**: November 13, 2025
**Status**: Active Development
