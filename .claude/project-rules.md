# Advocata Project Rules

## Overview

This document defines the core rules and principles for developing the Advocata platform - a marketplace for on-demand legal services.

---

## 1. Architecture Principles

### Domain-Driven Design (DDD)

**Bounded Contexts:**
1. Identity & Access - authentication, user management
2. Lawyer Management - lawyer profiles, verification, availability
3. Consultation Management - booking, conducting consultations
4. Payment - payments, subscriptions, refunds
5. Notification - email, SMS, push notifications
6. Document - legal documents, templates

**Layered Architecture:**
```
┌─────────────────────────────────────┐
│ Presentation Layer (API/UI)          │
├─────────────────────────────────────┤
│ Application Layer (Use Cases)        │
├─────────────────────────────────────┤
│ Domain Layer (Business Logic)        │
├─────────────────────────────────────┤
│ Infrastructure Layer (Technical)     │
└─────────────────────────────────────┘
```

### SOLID Principles

**Always apply:**
- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

---

## 2. Development Rules

### Rule #1: Context Isolation
- Each Bounded Context is independent
- No direct dependencies between contexts
- Communication via Domain Events or API calls
- Shared code goes to `shared/` kernel

### Rule #2: Domain First
- Start with Domain Layer (Entities, Value Objects, Domain Services)
- Then Application Layer (Use Cases)
- Then Infrastructure Layer (Repositories, External Services)
- Finally Presentation Layer (Controllers, Screens)

### Rule #3: Test Coverage
- Domain Layer: 90-100% coverage
- Application Layer: 80-90% coverage
- Infrastructure Layer: 70-80% coverage
- Overall target: 75-85% coverage

### Rule #4: No Business Logic in Infrastructure
- Repositories only handle data persistence
- Controllers only handle HTTP/presentation concerns
- All business rules in Domain/Application layers

### Rule #5: Immutability
- Value Objects are immutable
- Use factory methods for entity creation
- No public setters - use methods with validation

---

## 3. Naming Conventions

### Backend (TypeScript/NestJS)

**Entities:**
```typescript
class User extends AggregateRoot { }
class Lawyer extends AggregateRoot { }
```

**Value Objects:**
```typescript
class Email extends ValueObject { }
class Money extends ValueObject { }
```

**Use Cases:**
```typescript
class RegisterUserUseCase { }
class VerifyLawyerUseCase { }
```

**Repositories:**
```typescript
interface IUserRepository { }
class UserRepositoryImpl implements IUserRepository { }
```

**Controllers:**
```typescript
@Controller('users')
class UserController { }
```

**DTOs:**
```typescript
class RegisterUserDto { }
class CreateLawyerDto { }
```

### Mobile (Dart/Flutter)

**Entities:**
```dart
@freezed
class User with _$User { }
class Lawyer with _$Lawyer { }
```

**Repositories:**
```dart
abstract class LawyerRepository { }
class LawyerRepositoryImpl implements LawyerRepository { }
```

**Providers (Riverpod):**
```dart
@riverpod
class AuthNotifier extends _$AuthNotifier { }

@riverpod
Future<List<Lawyer>> searchLawyers(...) async { }
```

**Screens:**
```dart
class LawyersListScreen extends ConsumerWidget { }
class LawyerDetailScreen extends ConsumerWidget { }
```

**Widgets:**
```dart
class LawyerCard extends StatelessWidget { }
class PrimaryButton extends StatelessWidget { }
```

---

## 4. File Structure

### Backend
```
backend/src/modules/{context}/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── services/
│   └── repositories/
├── application/
│   ├── commands/
│   ├── queries/
│   └── services/
├── infrastructure/
│   ├── persistence/
│   ├── services/
│   └── adapters/
└── presentation/
    ├── controllers/
    ├── dtos/
    └── guards/
```

### Mobile
```
mobile/lib/features/{feature}/
├── domain/
│   ├── entities/
│   ├── value_objects/
│   └── repositories/
├── data/
│   ├── models/
│   ├── datasources/
│   └── repositories/
└── presentation/
    ├── providers/
    ├── screens/
    └── widgets/
```

---

## 5. Code Quality Rules

### Backend

**Linting:**
- Use ESLint with strict rules
- Prettier for formatting
- No `any` types (use `unknown` when needed)
- Explicit return types for functions

**Testing:**
- Unit tests for domain logic
- Integration tests for repositories
- E2E tests for critical flows
- Mock external dependencies

**Error Handling:**
```typescript
// Use Result pattern
class Result<T> {
  isSuccess: boolean;
  isFailure: boolean;
  value?: T;
  error?: string;
}

// Example
const userOrError = User.create(props);
if (userOrError.isFailure) {
  return Result.fail(userOrError.error);
}
```

### Mobile

**Linting:**
- Use `analysis_options.yaml` strict rules
- flutter_lints package
- No unused imports/variables
- Prefer const constructors

**State Management:**
- Use Riverpod for all state
- No setState in complex logic
- Providers for data fetching
- StateNotifier for complex state

**Error Handling:**
```dart
// Use Either from dartz
Either<Failure, User> result = await repository.getUser();

result.fold(
  (failure) => showError(failure.message),
  (user) => displayUser(user),
);
```

---

## 6. Git Workflow

### Branch Naming
```
feature/lawyer-search
bugfix/payment-processing
hotfix/critical-bug
refactor/domain-model
docs/api-documentation
```

### Commit Messages
```
feat(lawyer): add lawyer search with filters

- Implement SearchLawyersQuery
- Add specialization and city filters
- Add pagination support

Closes #123
```

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build/tooling changes

### Pull Request Process
1. Create feature branch from `main`
2. Write code + tests
3. Ensure all tests pass
4. Create PR with description
5. Request code review (1 approval required)
6. Address feedback
7. Merge when approved + CI green

---

## 7. Security & Compliance

### Critical Requirements

**Data Localization (152-ФЗ):**
- ALL personal data MUST be stored on Russian servers
- Use Supabase instance located in Russia
- No data transfer abroad without local buffering
- End-to-end encryption for lawyer-client communications

**Authentication:**
- JWT tokens with expiration
- Refresh token rotation
- OTP verification for sensitive actions
- Rate limiting on auth endpoints

**Data Protection:**
- Encrypt sensitive data at rest
- HTTPS for all communications
- Input validation on all endpoints
- SQL injection prevention (use ORM)
- XSS prevention (sanitize inputs)

**Audit Logging:**
- Log all data access
- Log all modifications
- Retain logs for 1 year minimum
- Separate audit log storage

---

## 8. Performance Requirements

### Backend
- API response time (p95): < 500ms
- Database query time: < 100ms
- Concurrent users: 10,000+
- Requests per second: 1,000+

### Mobile
- App launch time: < 3s
- Time to interactive: < 5s
- Crash rate: < 1%
- Memory usage: < 200MB

### Database
- Use indexes for frequent queries
- Implement pagination (max 100 items)
- Use Redis caching for hot data
- Connection pooling

---

## 9. Documentation Requirements

### Code Documentation

**Backend:**
```typescript
/**
 * Verifies a lawyer by checking their bar license and education.
 *
 * @param lawyerId - The ID of the lawyer to verify
 * @param verificationData - Documents and license information
 * @returns Result indicating success or failure with reason
 *
 * @throws {LawyerNotFoundException} When lawyer is not found
 * @throws {InvalidLicenseException} When bar license is invalid
 */
async verifyLawyer(
  lawyerId: LawyerId,
  verificationData: VerificationData
): Promise<Result<void>>
```

**Mobile:**
```dart
/// Searches for lawyers based on filters.
///
/// Returns a list of lawyers matching the [specializations], [city],
/// and [maxHourlyRate] filters. Results are paginated.
///
/// Throws [ServerException] if the API call fails.
/// Throws [NetworkException] if there's no internet connection.
Future<Either<Failure, List<Lawyer>>> searchLawyers({
  required List<String> specializations,
  String? city,
  Money? maxHourlyRate,
});
```

### Architecture Documentation
- Update ADRs for major decisions
- Keep C4 diagrams up to date
- Document API changes in OpenAPI spec
- Maintain Ubiquitous Language glossary

---

## 10. Review Checklist

Before submitting PR, ensure:

- [ ] Code follows SOLID principles
- [ ] Business logic in Domain Layer
- [ ] Tests written (coverage target met)
- [ ] No console.log / print statements
- [ ] Error handling implemented
- [ ] TypeScript/Dart types are explicit
- [ ] Code is documented (complex logic)
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Database migrations included (if schema changed)
- [ ] API documentation updated (if endpoints changed)

---

## 11. Common Patterns

### Repository Pattern
```typescript
// Interface in Domain Layer
interface ILawyerRepository {
  save(lawyer: Lawyer): Promise<void>;
  findById(id: LawyerId): Promise<Lawyer | null>;
  search(criteria: SearchCriteria): Promise<Lawyer[]>;
}

// Implementation in Infrastructure Layer
class LawyerRepositoryImpl implements ILawyerRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(lawyer: Lawyer): Promise<void> {
    const data = LawyerMapper.toPersistence(lawyer);
    await this.supabase.from('lawyers').upsert(data);
  }
}
```

### Use Case Pattern
```typescript
class BookConsultationUseCase {
  constructor(
    private consultationRepo: IConsultationRepository,
    private lawyerRepo: ILawyerRepository,
    private availabilityService: ConsultationAvailabilityService,
    private eventBus: IEventBus
  ) {}

  async execute(command: BookConsultationCommand): Promise<Result<ConsultationDTO>> {
    // 1. Validate input
    // 2. Check business rules
    // 3. Create domain entity
    // 4. Persist
    // 5. Publish events
    // 6. Return DTO
  }
}
```

### Event-Driven Pattern
```typescript
// Domain Event
class ConsultationBookedEvent extends DomainEvent {
  constructor(
    public readonly consultation: Consultation
  ) {
    super();
  }
}

// Event Handler
class SendBookingNotificationHandler {
  constructor(private notificationService: NotificationService) {}

  async handle(event: ConsultationBookedEvent): Promise<void> {
    await this.notificationService.send({
      to: event.consultation.lawyerId,
      template: 'consultation-booked',
      data: { consultationId: event.consultation.id },
    });
  }
}
```

---

## 12. Anti-Patterns to Avoid

### ❌ Anemic Domain Model
```typescript
// BAD
class User {
  id: string;
  email: string;
  status: string;
}

class UserService {
  verifyUser(user: User) {
    user.status = 'verified'; // Business logic in service
  }
}
```

```typescript
// GOOD
class User extends AggregateRoot {
  verify(): Result<void> {
    if (this.status === UserStatus.Verified) {
      return Result.fail('Already verified');
    }
    this.status = UserStatus.Verified;
    this.addDomainEvent(new UserVerifiedEvent(this));
    return Result.ok();
  }
}
```

### ❌ God Objects
```typescript
// BAD - LawyerService does everything
class LawyerService {
  registerLawyer() {}
  verifyLawyer() {}
  searchLawyers() {}
  updateAvailability() {}
  sendNotification() {}
  processPayment() {}
}
```

```typescript
// GOOD - Separated responsibilities
class RegisterLawyerUseCase { }
class VerifyLawyerUseCase { }
class SearchLawyersQuery { }
class UpdateAvailabilityUseCase { }
```

### ❌ Feature Envy
```typescript
// BAD
class ConsultationService {
  calculatePrice(consultation: Consultation) {
    return consultation.lawyer.hourlyRate * consultation.duration;
  }
}
```

```typescript
// GOOD - Logic belongs to domain entity
class Consultation extends AggregateRoot {
  calculatePrice(): Money {
    return this.lawyer.hourlyRate.multiply(this.duration);
  }
}
```

---

## 13. Environment Configuration

### Required Environment Variables

**Backend:**
```env
NODE_ENV=development|staging|production
PORT=3000

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
SUPABASE_JWT_SECRET=xxx

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Payment
YOOKASSA_SHOP_ID=xxx
YOOKASSA_SECRET_KEY=xxx

# Notifications
SENDGRID_API_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
```

**Mobile:**
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
API_BASE_URL=https://api.advocata.ru
```

---

## 14. Deployment Rules

### Backend
- Use Docker containers
- Zero-downtime deployments
- Health check endpoint required
- Graceful shutdown handling
- Database migrations before deployment
- Rollback plan documented

### Mobile
- Staged rollout (10% → 50% → 100%)
- Monitor crash rate after release
- A/B testing for major features
- Keep previous version available for 48h

---

## 15. Monitoring & Alerting

### Required Metrics
- API response times (p50, p95, p99)
- Error rates (4xx, 5xx)
- Database query performance
- Active users
- Consultations booked/completed
- Payment success rate

### Alerts
- Error rate > 1%
- API response time p95 > 1s
- Database connection pool exhausted
- Disk space < 20%
- Memory usage > 80%

---

## Contact

For questions about these rules:
- Technical Lead: @tech-lead
- Architecture: @architect
- DevOps: @devops

**Last Updated:** November 13, 2025
