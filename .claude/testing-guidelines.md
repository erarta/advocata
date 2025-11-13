# Testing Guidelines

## Test Pyramid

```
                  ▲
                 ╱│╲
                ╱ │ ╲
               ╱  │  ╲
              ╱───┼───╲ E2E Tests (10%)
             ╱    │    ╲ - Critical user flows
            ╱─────┼─────╲ - Full system integration
           ╱      │      ╲
          ╱───────┼───────╲ Integration Tests (30%)
         ╱        │        ╲ - API endpoints
        ╱─────────┼─────────╲ - Database operations
       ╱          │          ╲ - External services
      ╱═══════════╪═══════════╲ Unit Tests (60%)
     ╱════════════╪════════════╲ - Domain logic
    ═══════════════════════════ - Value Objects
                                 - Use Cases
```

---

## Coverage Goals

| Layer | Target Coverage | Notes |
|-------|----------------|-------|
| Domain Layer | 90-100% | Critical business logic |
| Application Layer | 80-90% | Use cases and queries |
| Infrastructure Layer | 70-80% | Repositories, external APIs |
| Presentation Layer | 60-70% | Controllers, screens |
| **Overall** | **75-85%** | Project-wide target |

---

## Backend Testing (TypeScript/Jest)

### Unit Tests - Domain Layer

**File**: `user.entity.spec.ts`

```typescript
import { User } from '../user.entity';
import { Email } from '../value-objects/email.vo';
import { UserStatus } from '../enums/user-status.enum';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a valid user', () => {
      // Arrange
      const email = Email.create('test@example.com').getValue();
      const phone = PhoneNumber.create('79991234567').getValue();

      // Act
      const result = User.create({
        email,
        phone,
        role: UserRole.Client,
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().email).toEqual(email);
      expect(result.getValue().status).toBe(UserStatus.Pending);
    });

    it('should fail with invalid email', () => {
      // Arrange
      const emailResult = Email.create('invalid-email');

      // Assert
      expect(emailResult.isFailure).toBe(true);
      expect(emailResult.error).toContain('Invalid email');
    });

    it('should emit UserCreatedEvent on creation', () => {
      // Arrange
      const props = createValidUserProps();

      // Act
      const result = User.create(props);
      const user = result.getValue();

      // Assert
      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toBeInstanceOf(UserCreatedEvent);
    });
  });

  describe('verifyEmail', () => {
    it('should verify pending user successfully', () => {
      // Arrange
      const user = createPendingUser();

      // Act
      const result = user.verifyEmail();

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(user.status).toBe(UserStatus.Verified);
      expect(user.domainEvents).toContainEqual(
        expect.objectContaining({
          _type: 'UserEmailVerifiedEvent',
        })
      );
    });

    it('should fail to verify already verified user', () => {
      // Arrange
      const user = createVerifiedUser();

      // Act
      const result = user.verifyEmail();

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('already verified');
    });
  });
});

// Test helpers
function createValidUserProps(): CreateUserProps {
  return {
    email: Email.create('test@example.com').getValue(),
    phone: PhoneNumber.create('79991234567').getValue(),
    role: UserRole.Client,
  };
}

function createPendingUser(): User {
  const result = User.create(createValidUserProps());
  return result.getValue();
}

function createVerifiedUser(): User {
  const user = createPendingUser();
  user.verifyEmail();
  return user;
}
```

### Unit Tests - Value Objects

**File**: `email.vo.spec.ts`

```typescript
import { Email } from '../email.vo';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create valid email', () => {
      const result = Email.create('test@example.com');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('test@example.com');
    });

    it.each([
      'invalid',
      'test@',
      '@example.com',
      'test example.com',
      '',
    ])('should fail with invalid email: %s', (invalidEmail) => {
      const result = Email.create(invalidEmail);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Invalid email');
    });
  });

  describe('equals', () => {
    it('should treat emails as equal by value', () => {
      const email1 = Email.create('test@example.com').getValue();
      const email2 = Email.create('test@example.com').getValue();

      expect(email1.equals(email2)).toBe(true);
    });

    it('should treat different emails as not equal', () => {
      const email1 = Email.create('test1@example.com').getValue();
      const email2 = Email.create('test2@example.com').getValue();

      expect(email1.equals(email2)).toBe(false);
    });
  });
});
```

### Unit Tests - Use Cases

**File**: `register-user.use-case.spec.ts`

```typescript
import { RegisterUserUseCase } from '../register-user.use-case';
import { MockUserRepository } from '@/test/mocks/user.repository.mock';
import { MockEmailService } from '@/test/mocks/email.service.mock';
import { MockEventBus } from '@/test/mocks/event-bus.mock';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: MockUserRepository;
  let emailService: MockEmailService;
  let eventBus: MockEventBus;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    emailService = new MockEmailService();
    eventBus = new MockEventBus();

    useCase = new RegisterUserUseCase(
      userRepository,
      emailService,
      eventBus
    );
  });

  it('should register new user successfully', async () => {
    // Arrange
    const command = new RegisterUserCommand({
      email: 'test@example.com',
      phone: '79991234567',
      role: 'client',
    });

    userRepository.findByEmail.mockResolvedValue(null); // No existing user

    // Act
    const result = await useCase.execute(command);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(emailService.sendOTP).toHaveBeenCalledWith('test@example.com');
    expect(eventBus.publishAll).toHaveBeenCalled();
  });

  it('should fail if user already exists', async () => {
    // Arrange
    const command = new RegisterUserCommand({
      email: 'existing@example.com',
      phone: '79991234567',
      role: 'client',
    });

    const existingUser = createMockUser();
    userRepository.findByEmail.mockResolvedValue(existingUser);

    // Act
    const result = await useCase.execute(command);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('already exists');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail with invalid email', async () => {
    // Arrange
    const command = new RegisterUserCommand({
      email: 'invalid-email',
      phone: '79991234567',
      role: 'client',
    });

    // Act
    const result = await useCase.execute(command);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Invalid email');
  });

  it('should publish UserCreatedEvent', async () => {
    // Arrange
    const command = new RegisterUserCommand({
      email: 'test@example.com',
      phone: '79991234567',
      role: 'client',
    });

    userRepository.findByEmail.mockResolvedValue(null);

    // Act
    await useCase.execute(command);

    // Assert
    const publishedEvents = eventBus.publishAll.mock.calls[0][0];
    expect(publishedEvents).toContainEqual(
      expect.objectContaining({
        _type: 'UserCreatedEvent',
      })
    );
  });
});
```

### Integration Tests - Repository

**File**: `user.repository.integration.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserRepositoryImpl } from '../user.repository';
import { User } from '../../domain/entities/user.entity';

describe('UserRepository Integration', () => {
  let repository: UserRepositoryImpl;
  let supabase: SupabaseClient;

  beforeAll(async () => {
    // Setup test database
    supabase = await setupTestDatabase();
    repository = new UserRepositoryImpl(supabase);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  afterEach(async () => {
    // Clean up between tests
    await supabase.from('users').delete().neq('id', '');
  });

  describe('save', () => {
    it('should save new user to database', async () => {
      // Arrange
      const user = createTestUser();

      // Act
      await repository.save(user);

      // Assert
      const saved = await supabase
        .from('users')
        .select()
        .eq('id', user.id.value)
        .single();

      expect(saved.data).toBeDefined();
      expect(saved.data.email).toBe(user.email.value);
    });

    it('should update existing user', async () => {
      // Arrange
      const user = createTestUser();
      await repository.save(user);

      // Act - Modify user
      user.verifyEmail();
      await repository.save(user);

      // Assert
      const updated = await supabase
        .from('users')
        .select()
        .eq('id', user.id.value)
        .single();

      expect(updated.data.status).toBe('verified');
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      // Arrange
      const user = createTestUser();
      await repository.save(user);

      // Act
      const found = await repository.findById(user.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id).toEqual(user.id);
      expect(found?.email).toEqual(user.email);
    });

    it('should return null if user not found', async () => {
      // Act
      const found = await repository.findById(UserId.create());

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const user = createTestUser();
      await repository.save(user);

      // Act
      const found = await repository.findByEmail(user.email);

      // Assert
      expect(found).toBeDefined();
      expect(found?.email).toEqual(user.email);
    });
  });
});

// Test helpers
function createTestUser(): User {
  return User.create({
    email: Email.create('test@example.com').getValue(),
    phone: PhoneNumber.create('79991234567').getValue(),
    role: UserRole.Client,
  }).getValue();
}
```

### Integration Tests - API Endpoints

**File**: `auth.controller.integration.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('Auth Controller (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          phone: '79991234567',
          role: 'client',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.status).toBe('pending');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          phone: '79991234567',
          role: 'client',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should fail if user already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          phone: '79991234567',
          role: 'client',
        });

      // Duplicate registration
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          phone: '79997654321',
          role: 'client',
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should verify OTP and return tokens', async () => {
      // Register user first
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'verify@example.com',
          phone: '79991234567',
          role: 'client',
        });

      // Mock OTP (in test environment, use fixed OTP)
      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          email: 'verify@example.com',
          otp: '123456', // Test OTP
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.status).toBe('verified');
    });

    it('should fail with invalid OTP', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '000000', // Wrong OTP
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid OTP');
    });
  });
});
```

### E2E Tests - Critical Flows

**File**: `consultation-booking.e2e.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';

describe('Consultation Booking Flow (E2E)', () => {
  let app: INestApplication;
  let clientToken: string;
  let lawyerId: string;

  beforeAll(async () => {
    // Setup app
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create test client
    const clientResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'client@example.com',
        phone: '79991234567',
        role: 'client',
      });

    // Get client token
    const tokenResponse = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({
        email: 'client@example.com',
        otp: '123456',
      });

    clientToken = tokenResponse.body.accessToken;

    // Create test lawyer
    const lawyerResponse = await createTestLawyer(app);
    lawyerId = lawyerResponse.body.id;
  });

  afterAll(async () => {
    await cleanupTestData(app);
    await app.close();
  });

  it('should complete full consultation booking flow', async () => {
    // 1. Client searches for lawyers
    const searchResponse = await request(app.getHttpServer())
      .get('/lawyers?specializations=ДТП')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    expect(searchResponse.body.items.length).toBeGreaterThan(0);

    // 2. Client views lawyer details
    const detailResponse = await request(app.getHttpServer())
      .get(`/lawyers/${lawyerId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    expect(detailResponse.body.id).toBe(lawyerId);

    // 3. Client checks availability
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const availabilityResponse = await request(app.getHttpServer())
      .get(`/lawyers/${lawyerId}/availability?date=${tomorrow.toISOString()}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    expect(availabilityResponse.body.slots.length).toBeGreaterThan(0);
    const slot = availabilityResponse.body.slots[0];

    // 4. Client creates payment
    const paymentResponse = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        amount: 2000,
        method: 'card',
      })
      .expect(201);

    // 5. Client books consultation
    const bookingResponse = await request(app.getHttpServer())
      .post('/consultations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        lawyerId,
        type: 'video',
        scheduledStart: slot.start,
        scheduledEnd: slot.end,
        paymentId: paymentResponse.body.id,
      })
      .expect(201);

    const consultationId = bookingResponse.body.id;
    expect(bookingResponse.body.status).toBe('scheduled');

    // 6. Verify consultation in history
    const historyResponse = await request(app.getHttpServer())
      .get('/consultations')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    const consultation = historyResponse.body.items.find(
      (c: any) => c.id === consultationId
    );
    expect(consultation).toBeDefined();
  });

  it('should prevent double booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    // Book first consultation
    const payment1 = await createTestPayment(app, clientToken);
    await request(app.getHttpServer())
      .post('/consultations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        lawyerId,
        type: 'video',
        scheduledStart: tomorrow.toISOString(),
        scheduledEnd: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
        paymentId: payment1.id,
      })
      .expect(201);

    // Try to book overlapping consultation
    const payment2 = await createTestPayment(app, clientToken);
    const response = await request(app.getHttpServer())
      .post('/consultations')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        lawyerId,
        type: 'video',
        scheduledStart: tomorrow.toISOString(),
        scheduledEnd: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
        paymentId: payment2.id,
      })
      .expect(409);

    expect(response.body.message).toContain('not available');
  });
});
```

---

## Mobile Testing (Flutter/Dart)

### Unit Tests

**File**: `lawyer_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:advocata/features/lawyer/domain/entities/lawyer.dart';

void main() {
  group('Lawyer', () => {
    test('should create lawyer with valid data', () {
      final lawyer = Lawyer(
        id: LawyerId('123'),
        name: 'Иван Иванов',
        specializations: ['ДТП'],
        experienceYears: 5,
        hourlyRate: Money(2000, 'RUB'),
        city: 'Санкт-Петербург',
        rating: 4.8,
        reviewCount: 42,
        isOnline: true,
      );

      expect(lawyer.name, 'Иван Иванов');
      expect(lawyer.experienceYears, 5);
    });

    test('should calculate experience level correctly', () {
      final juniorLawyer = Lawyer(
        /* ... */
        experienceYears: 2,
      );
      expect(juniorLawyer.experienceLevel, ExperienceLevel.junior);

      final seniorLawyer = Lawyer(
        /* ... */
        experienceYears: 10,
      );
      expect(seniorLawyer.experienceLevel, ExperienceLevel.senior);
    });
  });
}
```

### Widget Tests

**File**: `lawyer_card_test.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:advocata/features/lawyer/presentation/widgets/lawyer_card.dart';

void main() {
  group('LawyerCard', () {
    testWidgets('should display lawyer information', (tester) async {
      final lawyer = createTestLawyer();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LawyerCard(
              lawyer: lawyer,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text(lawyer.name), findsOneWidget);
      expect(find.text(lawyer.specializations.first), findsOneWidget);
      expect(find.text('${lawyer.rating}'), findsOneWidget);
      expect(find.byIcon(Icons.star), findsOneWidget);
    });

    testWidgets('should show online indicator when lawyer is online', (tester) async {
      final onlineLawyer = createTestLawyer(isOnline: true);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LawyerCard(
              lawyer: onlineLawyer,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.byType(OnlineIndicator), findsOneWidget);
    });

    testWidgets('should call onTap when tapped', (tester) async {
      final lawyer = createTestLawyer();
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: LawyerCard(
              lawyer: lawyer,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(LawyerCard));
      expect(tapped, true);
    });
  });
}
```

### Integration Tests

**File**: `consultation_booking_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:advocata/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Consultation Booking Flow', () {
    testWidgets('should complete full booking flow', (tester) async {
      // Launch app
      app.main();
      await tester.pumpAndSettle();

      // 1. Login
      await tester.tap(find.byKey(Key('login_button')));
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(Key('email_field')),
        'test@example.com',
      );
      await tester.tap(find.byKey(Key('send_otp_button')));
      await tester.pumpAndSettle();

      await tester.enterText(find.byKey(Key('otp_field')), '123456');
      await tester.pumpAndSettle();

      // 2. Navigate to lawyers list
      await tester.tap(find.byIcon(Icons.search));
      await tester.pumpAndSettle();

      // 3. Search for lawyers
      await tester.enterText(find.byKey(Key('search_field')), 'ДТП');
      await tester.pumpAndSettle();

      expect(find.byType(LawyerCard), findsWidgets);

      // 4. Tap first lawyer
      await tester.tap(find.byType(LawyerCard).first);
      await tester.pumpAndSettle();

      // 5. Tap book button
      await tester.tap(find.byKey(Key('book_button')));
      await tester.pumpAndSettle();

      // 6. Select time slot
      await tester.tap(find.byType(TimeSlotCard).first);
      await tester.pumpAndSettle();

      // 7. Confirm booking
      await tester.tap(find.byKey(Key('confirm_booking_button')));
      await tester.pumpAndSettle();

      // 8. Verify success
      expect(find.text('Консультация забронирована'), findsOneWidget);
    });
  });
}
```

---

## Test Helpers & Mocks

### Creating Test Data

```typescript
// test/helpers/create-test-user.ts
export function createTestUser(overrides?: Partial<CreateUserProps>): User {
  const defaults: CreateUserProps = {
    email: Email.create('test@example.com').getValue(),
    phone: PhoneNumber.create('79991234567').getValue(),
    role: UserRole.Client,
  };

  return User.create({ ...defaults, ...overrides }).getValue();
}
```

### Mock Repositories

```typescript
// test/mocks/user.repository.mock.ts
export class MockUserRepository implements IUserRepository {
  findById = jest.fn();
  findByEmail = jest.fn();
  save = jest.fn();
}
```

---

## Running Tests

### Backend

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Mobile

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Run integration tests
flutter drive --target=integration_test/app_test.dart

# Generate coverage report
genhtml coverage/lcov.info -o coverage/html
```

---

**Last Updated:** November 13, 2025
