# ADVOCATA - Всеобъемлющий План Разработки
## Платформа для экстренного вызова юристов

**Дата создания:** 13 ноября 2025
**Версия:** 1.0
**Архитектурный подход:** Domain-Driven Design + SOLID Principles

---

## СОДЕРЖАНИЕ

1. [Обзор проекта](#1-обзор-проекта)
2. [Архитектура системы (DDD)](#2-архитектура-системы-ddd)
3. [Bounded Contexts](#3-bounded-contexts)
4. [Backend архитектура](#4-backend-архитектура)
5. [Frontend архитектура](#5-frontend-архитектура)
6. [Админ панель](#6-админ-панель)
7. [Лендинг для инвесторов](#7-лендинг-для-инвесторов)
8. [Стратегия тестирования](#8-стратегия-тестирования)
9. [Документация](#9-документация)
10. [План разработки по фазам](#10-план-разработки-по-фазам)
11. [Команда и роли](#11-команда-и-роли)

---

## 1. ОБЗОР ПРОЕКТА

### 1.1 Цель проекта

Создание **"Uber для юристов"** - платформы для мгновенного вызова квалифицированных юристов в экстренных ситуациях (ДТП, задержания, трудовые споры).

### 1.2 Ключевые цифры

- **Рынок**: 40-54 млрд рублей (РФ)
- **Целевая аудитория**: 23,000 активных подписчиков для break-even
- **Timeline до MVP**: 8-13 недель
- **Инвестиции**: 110-170 млн рублей

### 1.3 Tech Stack

#### Backend
- **Runtime**: Node.js/Bun или Go
- **Framework**: NestJS или Fastify
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis
- **Queue**: BullMQ
- **Storage**: S3-compatible (российские серверы)
- **Real-time**: WebSockets/Server-Sent Events

#### Mobile App (Flutter)
- **Framework**: Flutter 3.x
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **Backend**: Supabase Client
- **Video Calls**: Agora/Twilio/Jitsi

#### Admin Panel
- **Framework**: Next.js 14 (App Router)
- **UI**: Shadcn/ui + Tailwind CSS
- **State**: React Query + Zustand
- **Charts**: Recharts

#### Landing
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS + Framer Motion
- **Deployment**: Vercel/Cloudflare Pages

---

## 2. АРХИТЕКТУРА СИСТЕМЫ (DDD)

### 2.1 Принципы Domain-Driven Design

```
┌────────────────────────────────────────────────────────────┐
│                   STRATEGIC DESIGN                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Identity &  │  │ Consultation │  │   Lawyer     │    │
│  │     Auth     │  │  Management  │  │  Management  │    │
│  │   Context    │  │   Context    │  │   Context    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Payment    │  │ Notification │  │   Document   │    │
│  │   Context    │  │   Context    │  │   Context    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    TACTICAL DESIGN                          │
│                                                             │
│  Each Context Contains:                                     │
│  ├─ Domain Layer                                           │
│  │  ├─ Entities (Identity + Behavior)                     │
│  │  ├─ Value Objects (Immutable values)                   │
│  │  ├─ Aggregates (Consistency boundaries)                │
│  │  ├─ Domain Events (State changes)                      │
│  │  └─ Domain Services (Cross-entity operations)          │
│  │                                                          │
│  ├─ Application Layer                                      │
│  │  ├─ Use Cases / Commands                               │
│  │  ├─ Queries (CQRS)                                     │
│  │  ├─ DTOs                                                │
│  │  └─ Application Services                               │
│  │                                                          │
│  ├─ Infrastructure Layer                                   │
│  │  ├─ Repositories (Data access)                         │
│  │  ├─ External Services                                  │
│  │  └─ Persistence                                        │
│  │                                                          │
│  └─ Presentation Layer                                     │
│     ├─ Controllers / GraphQL Resolvers                    │
│     ├─ API Routes                                         │
│     └─ Validation                                         │
└────────────────────────────────────────────────────────────┘
```

### 2.2 SOLID Principles

#### Single Responsibility Principle (SRP)
- Каждый класс/модуль отвечает за одну задачу
- Пример: `LawyerVerificationService` только проверяет юристов

#### Open/Closed Principle (OCP)
- Открыт для расширения, закрыт для модификации
- Пример: `NotificationStrategy` с разными реализациями (SMS, Email, Push)

#### Liskov Substitution Principle (LSP)
- Подклассы должны заменять родительские классы
- Пример: `VideoConsultation`, `PhoneConsultation` наследуют `Consultation`

#### Interface Segregation Principle (ISP)
- Много специфичных интерфейсов лучше одного общего
- Пример: `ILawyerRepository`, `IClientRepository` вместо одного `IUserRepository`

#### Dependency Inversion Principle (DIP)
- Зависимость от абстракций, не от конкретики
- Пример: `IPaymentGateway` интерфейс для разных платежных систем

---

## 3. BOUNDED CONTEXTS

### 3.1 Identity & Access Context

**Ответственность**: Управление пользователями и аутентификацией

#### Entities
```typescript
// Domain Layer
class User extends AggregateRoot {
  private constructor(
    public readonly id: UserId,
    public email: Email,
    public phone: PhoneNumber,
    public role: UserRole,
    public status: UserStatus,
    private createdAt: Date
  ) {}

  static create(props: CreateUserProps): Result<User> {
    // Бизнес-правила валидации
    const emailOrError = Email.create(props.email);
    if (emailOrError.isFailure) {
      return Result.fail(emailOrError.error);
    }

    const user = new User(
      UserId.generate(),
      emailOrError.getValue(),
      // ... other props
    );

    user.addDomainEvent(new UserCreatedEvent(user));
    return Result.ok(user);
  }

  verifyEmail(): Result<void> {
    if (this.status === UserStatus.Verified) {
      return Result.fail('User already verified');
    }
    this.status = UserStatus.Verified;
    this.addDomainEvent(new UserEmailVerifiedEvent(this));
    return Result.ok();
  }
}
```

#### Value Objects
```typescript
class Email extends ValueObject {
  private constructor(public readonly value: string) {
    super();
  }

  static create(email: string): Result<Email> {
    if (!this.isValid(email)) {
      return Result.fail('Invalid email format');
    }
    return Result.ok(new Email(email));
  }

  private static isValid(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

class PhoneNumber extends ValueObject {
  private constructor(public readonly value: string) {
    super();
  }

  static create(phone: string): Result<PhoneNumber> {
    const normalized = phone.replace(/\D/g, '');
    if (normalized.length !== 11 || !normalized.startsWith('7')) {
      return Result.fail('Invalid Russian phone number');
    }
    return Result.ok(new PhoneNumber(normalized));
  }
}
```

#### Domain Events
```typescript
class UserCreatedEvent extends DomainEvent {
  constructor(public readonly user: User) {
    super();
  }
}

class UserEmailVerifiedEvent extends DomainEvent {
  constructor(public readonly user: User) {
    super();
  }
}
```

#### Use Cases
```typescript
// Application Layer
class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
    private eventBus: IEventBus
  ) {}

  async execute(command: RegisterUserCommand): Promise<Result<UserDTO>> {
    // 1. Проверить существование пользователя
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      return Result.fail('User with this email already exists');
    }

    // 2. Создать пользователя
    const userOrError = User.create({
      email: command.email,
      phone: command.phone,
      role: command.role,
    });

    if (userOrError.isFailure) {
      return Result.fail(userOrError.error);
    }

    const user = userOrError.getValue();

    // 3. Сохранить
    await this.userRepository.save(user);

    // 4. Отправить события
    await this.eventBus.publishAll(user.domainEvents);

    // 5. Отправить OTP
    await this.emailService.sendOTP(user.email);

    return Result.ok(UserMapper.toDTO(user));
  }
}
```

### 3.2 Lawyer Management Context

**Ответственность**: Управление профилями юристов, верификация, доступность

#### Aggregates
```typescript
class Lawyer extends AggregateRoot {
  private constructor(
    public readonly id: LawyerId,
    public userId: UserId,
    public profile: LawyerProfile,
    public verification: LawyerVerification,
    public availability: LawyerAvailability,
    public statistics: LawyerStatistics,
    public status: LawyerStatus
  ) {}

  static create(props: CreateLawyerProps): Result<Lawyer> {
    // Валидация
    const profileOrError = LawyerProfile.create(props.profile);
    if (profileOrError.isFailure) {
      return Result.fail(profileOrError.error);
    }

    const lawyer = new Lawyer(
      LawyerId.generate(),
      props.userId,
      profileOrError.getValue(),
      LawyerVerification.createPending(),
      LawyerAvailability.createDefault(),
      LawyerStatistics.createEmpty(),
      LawyerStatus.Pending
    );

    lawyer.addDomainEvent(new LawyerRegisteredEvent(lawyer));
    return Result.ok(lawyer);
  }

  verify(verificationResult: VerificationResult): Result<void> {
    if (this.status !== LawyerStatus.Pending) {
      return Result.fail('Lawyer is not pending verification');
    }

    if (!verificationResult.isValid) {
      this.status = LawyerStatus.Rejected;
      this.addDomainEvent(new LawyerVerificationRejectedEvent(this, verificationResult.reason));
      return Result.fail('Verification failed');
    }

    this.verification = this.verification.approve(verificationResult);
    this.status = LawyerStatus.Active;
    this.addDomainEvent(new LawyerVerifiedEvent(this));
    return Result.ok();
  }

  updateAvailability(timeSlots: TimeSlot[]): Result<void> {
    const availabilityOrError = LawyerAvailability.create(timeSlots);
    if (availabilityOrError.isFailure) {
      return Result.fail(availabilityOrError.error);
    }

    this.availability = availabilityOrError.getValue();
    this.addDomainEvent(new LawyerAvailabilityUpdatedEvent(this));
    return Result.ok();
  }

  setOnline(isOnline: boolean): void {
    this.availability.setOnline(isOnline);
    this.addDomainEvent(new LawyerOnlineStatusChangedEvent(this, isOnline));
  }
}
```

#### Value Objects
```typescript
class LawyerProfile extends ValueObject {
  constructor(
    public readonly name: PersonName,
    public readonly specializations: Specialization[],
    public readonly experience: Experience,
    public readonly education: Education,
    public readonly hourlyRate: Money,
    public readonly city: City,
    public readonly bio: string
  ) {
    super();
  }

  static create(props: LawyerProfileProps): Result<LawyerProfile> {
    // Валидация всех полей
    if (props.specializations.length === 0) {
      return Result.fail('At least one specialization required');
    }

    const hourlyRateOrError = Money.create(props.hourlyRate, 'RUB');
    if (hourlyRateOrError.isFailure) {
      return Result.fail(hourlyRateOrError.error);
    }

    // ... другие валидации

    return Result.ok(new LawyerProfile(/* ... */));
  }
}

class Specialization extends ValueObject {
  private static readonly VALID_SPECIALIZATIONS = [
    'ДТП',
    'Уголовное право',
    'Трудовое право',
    'Семейное право',
    'Налоговое право',
    'Корпоративное право',
    'Арбитраж',
  ];

  constructor(public readonly value: string) {
    super();
  }

  static create(value: string): Result<Specialization> {
    if (!this.VALID_SPECIALIZATIONS.includes(value)) {
      return Result.fail(`Invalid specialization: ${value}`);
    }
    return Result.ok(new Specialization(value));
  }
}

class Experience extends ValueObject {
  constructor(public readonly years: number) {
    super();
  }

  static create(years: number): Result<Experience> {
    if (years < 0) {
      return Result.fail('Experience cannot be negative');
    }
    if (years > 60) {
      return Result.fail('Experience seems unrealistic');
    }
    return Result.ok(new Experience(years));
  }

  get level(): 'Junior' | 'Middle' | 'Senior' | 'Expert' {
    if (this.years < 3) return 'Junior';
    if (this.years < 7) return 'Middle';
    if (this.years < 15) return 'Senior';
    return 'Expert';
  }
}
```

#### Use Cases
```typescript
class VerifyLawyerUseCase {
  constructor(
    private lawyerRepository: ILawyerRepository,
    private barRegistryService: IBarRegistryService,
    private educationVerificationService: IEducationVerificationService,
    private eventBus: IEventBus
  ) {}

  async execute(command: VerifyLawyerCommand): Promise<Result<void>> {
    // 1. Получить юриста
    const lawyer = await this.lawyerRepository.findById(command.lawyerId);
    if (!lawyer) {
      return Result.fail('Lawyer not found');
    }

    // 2. Проверить лицензию адвоката (если есть)
    if (command.barLicenseNumber) {
      const isValid = await this.barRegistryService.verify(
        command.barLicenseNumber
      );
      if (!isValid) {
        return Result.fail('Bar license not found in registry');
      }
    }

    // 3. Проверить диплом
    const educationValid = await this.educationVerificationService.verify(
      command.diplomaDocument
    );
    if (!educationValid) {
      return Result.fail('Education verification failed');
    }

    // 4. Верифицировать юриста
    const verificationResult = new VerificationResult({
      isValid: true,
      verifiedBy: command.adminId,
      verifiedAt: new Date(),
    });

    const result = lawyer.verify(verificationResult);
    if (result.isFailure) {
      return result;
    }

    // 5. Сохранить
    await this.lawyerRepository.save(lawyer);

    // 6. Опубликовать события
    await this.eventBus.publishAll(lawyer.domainEvents);

    return Result.ok();
  }
}

class SearchLawyersQuery {
  constructor(private lawyerRepository: ILawyerRepository) {}

  async execute(query: SearchLawyersQueryParams): Promise<LawyerListDTO> {
    const lawyers = await this.lawyerRepository.search({
      specializations: query.specializations,
      city: query.city,
      minRating: query.minRating,
      maxHourlyRate: query.maxHourlyRate,
      isOnline: query.isOnline,
      pagination: query.pagination,
    });

    return {
      items: lawyers.map(LawyerMapper.toDTO),
      total: lawyers.length,
      page: query.pagination.page,
      pageSize: query.pagination.pageSize,
    };
  }
}
```

### 3.3 Consultation Management Context

**Ответственность**: Бронирование, проведение и история консультаций

#### Aggregates
```typescript
class Consultation extends AggregateRoot {
  private constructor(
    public readonly id: ConsultationId,
    public clientId: UserId,
    public lawyerId: LawyerId,
    public type: ConsultationType,
    public scheduledTime: DateRange,
    public status: ConsultationStatus,
    public payment: ConsultationPayment,
    public session: ConsultationSession | null,
    private messages: ConsultationMessage[]
  ) {}

  static create(props: CreateConsultationProps): Result<Consultation> {
    // Валидация времени
    if (props.scheduledTime.start < new Date()) {
      return Result.fail('Cannot schedule consultation in the past');
    }

    const consultation = new Consultation(
      ConsultationId.generate(),
      props.clientId,
      props.lawyerId,
      props.type,
      props.scheduledTime,
      ConsultationStatus.Scheduled,
      ConsultationPayment.createPending(props.price),
      null,
      []
    );

    consultation.addDomainEvent(new ConsultationScheduledEvent(consultation));
    return Result.ok(consultation);
  }

  start(): Result<void> {
    if (this.status !== ConsultationStatus.Scheduled) {
      return Result.fail('Consultation is not scheduled');
    }

    if (!this.payment.isPaid) {
      return Result.fail('Consultation is not paid');
    }

    const now = new Date();
    if (now < this.scheduledTime.start) {
      return Result.fail('Consultation time has not arrived yet');
    }

    this.status = ConsultationStatus.InProgress;
    this.session = ConsultationSession.create(now);
    this.addDomainEvent(new ConsultationStartedEvent(this));
    return Result.ok();
  }

  complete(completionNotes?: string): Result<void> {
    if (this.status !== ConsultationStatus.InProgress) {
      return Result.fail('Consultation is not in progress');
    }

    this.status = ConsultationStatus.Completed;
    this.session?.complete(completionNotes);
    this.addDomainEvent(new ConsultationCompletedEvent(this));
    return Result.ok();
  }

  cancel(reason: string, cancelledBy: UserId): Result<void> {
    if (this.status === ConsultationStatus.Completed) {
      return Result.fail('Cannot cancel completed consultation');
    }

    if (this.status === ConsultationStatus.Cancelled) {
      return Result.fail('Consultation is already cancelled');
    }

    this.status = ConsultationStatus.Cancelled;
    this.addDomainEvent(
      new ConsultationCancelledEvent(this, reason, cancelledBy)
    );

    // Если уже оплачено, нужно вернуть деньги
    if (this.payment.isPaid) {
      this.payment.refund();
      this.addDomainEvent(new ConsultationRefundInitiatedEvent(this));
    }

    return Result.ok();
  }

  addMessage(message: ConsultationMessage): Result<void> {
    if (this.status !== ConsultationStatus.InProgress) {
      return Result.fail('Can only send messages during active consultation');
    }

    this.messages.push(message);
    this.addDomainEvent(new MessageSentEvent(this, message));
    return Result.ok();
  }
}
```

#### Domain Services
```typescript
class ConsultationAvailabilityService {
  constructor(
    private lawyerRepository: ILawyerRepository,
    private consultationRepository: IConsultationRepository
  ) {}

  async checkAvailability(
    lawyerId: LawyerId,
    requestedTime: DateRange
  ): Promise<Result<boolean>> {
    // 1. Получить юриста
    const lawyer = await this.lawyerRepository.findById(lawyerId);
    if (!lawyer) {
      return Result.fail('Lawyer not found');
    }

    // 2. Проверить рабочие часы
    if (!lawyer.availability.isAvailableAt(requestedTime)) {
      return Result.fail('Lawyer is not available at this time');
    }

    // 3. Проверить существующие консультации
    const conflicts = await this.consultationRepository.findConflicting(
      lawyerId,
      requestedTime
    );

    if (conflicts.length > 0) {
      return Result.fail('Lawyer has conflicting consultation');
    }

    return Result.ok(true);
  }

  async findAvailableSlots(
    lawyerId: LawyerId,
    date: Date,
    duration: Duration
  ): Promise<TimeSlot[]> {
    const lawyer = await this.lawyerRepository.findById(lawyerId);
    if (!lawyer) return [];

    const dayAvailability = lawyer.availability.getForDate(date);
    const existingConsultations = await this.consultationRepository.findByLawyerAndDate(
      lawyerId,
      date
    );

    return this.calculateFreeSlots(
      dayAvailability,
      existingConsultations,
      duration
    );
  }

  private calculateFreeSlots(
    availability: TimeSlot[],
    existingConsultations: Consultation[],
    duration: Duration
  ): TimeSlot[] {
    // Алгоритм поиска свободных слотов
    // ...
    return [];
  }
}
```

### 3.4 Payment Context

**Ответственность**: Обработка платежей, подписки, возвраты

#### Aggregates
```typescript
class Payment extends AggregateRoot {
  private constructor(
    public readonly id: PaymentId,
    public userId: UserId,
    public amount: Money,
    public method: PaymentMethod,
    public status: PaymentStatus,
    public provider: PaymentProvider,
    public providerTransactionId: string | null,
    private metadata: Record<string, any>
  ) {}

  static create(props: CreatePaymentProps): Result<Payment> {
    const amountOrError = Money.create(props.amount, props.currency);
    if (amountOrError.isFailure) {
      return Result.fail(amountOrError.error);
    }

    const payment = new Payment(
      PaymentId.generate(),
      props.userId,
      amountOrError.getValue(),
      props.method,
      PaymentStatus.Pending,
      props.provider,
      null,
      props.metadata || {}
    );

    payment.addDomainEvent(new PaymentCreatedEvent(payment));
    return Result.ok(payment);
  }

  markAsProcessing(providerTransactionId: string): Result<void> {
    if (this.status !== PaymentStatus.Pending) {
      return Result.fail('Payment is not pending');
    }

    this.status = PaymentStatus.Processing;
    this.providerTransactionId = providerTransactionId;
    this.addDomainEvent(new PaymentProcessingEvent(this));
    return Result.ok();
  }

  markAsSucceeded(): Result<void> {
    if (this.status !== PaymentStatus.Processing) {
      return Result.fail('Payment is not processing');
    }

    this.status = PaymentStatus.Succeeded;
    this.addDomainEvent(new PaymentSucceededEvent(this));
    return Result.ok();
  }

  markAsFailed(reason: string): Result<void> {
    if (this.status === PaymentStatus.Succeeded) {
      return Result.fail('Cannot fail succeeded payment');
    }

    this.status = PaymentStatus.Failed;
    this.metadata.failureReason = reason;
    this.addDomainEvent(new PaymentFailedEvent(this, reason));
    return Result.ok();
  }

  refund(): Result<void> {
    if (this.status !== PaymentStatus.Succeeded) {
      return Result.fail('Can only refund succeeded payments');
    }

    this.status = PaymentStatus.Refunded;
    this.addDomainEvent(new PaymentRefundedEvent(this));
    return Result.ok();
  }
}

class Subscription extends AggregateRoot {
  private constructor(
    public readonly id: SubscriptionId,
    public userId: UserId,
    public plan: SubscriptionPlan,
    public status: SubscriptionStatus,
    public currentPeriod: DateRange,
    public remainingConsultations: number,
    public autoRenew: boolean
  ) {}

  static create(props: CreateSubscriptionProps): Result<Subscription> {
    const subscription = new Subscription(
      SubscriptionId.generate(),
      props.userId,
      props.plan,
      SubscriptionStatus.Active,
      DateRange.fromNow(props.plan.duration),
      props.plan.includedConsultations,
      true
    );

    subscription.addDomainEvent(new SubscriptionCreatedEvent(subscription));
    return Result.ok(subscription);
  }

  useConsultation(): Result<void> {
    if (this.status !== SubscriptionStatus.Active) {
      return Result.fail('Subscription is not active');
    }

    if (this.remainingConsultations <= 0) {
      return Result.fail('No consultations remaining');
    }

    this.remainingConsultations--;
    this.addDomainEvent(new ConsultationUsedEvent(this));
    return Result.ok();
  }

  renew(): Result<void> {
    if (!this.autoRenew) {
      return Result.fail('Auto-renew is disabled');
    }

    this.currentPeriod = DateRange.fromDate(
      this.currentPeriod.end,
      this.plan.duration
    );
    this.remainingConsultations = this.plan.includedConsultations;
    this.addDomainEvent(new SubscriptionRenewedEvent(this));
    return Result.ok();
  }

  cancel(): Result<void> {
    if (this.status === SubscriptionStatus.Cancelled) {
      return Result.fail('Subscription is already cancelled');
    }

    this.status = SubscriptionStatus.Cancelled;
    this.autoRenew = false;
    this.addDomainEvent(new SubscriptionCancelledEvent(this));
    return Result.ok();
  }
}
```

### 3.5 Notification Context

**Ответственность**: Отправка уведомлений (Email, SMS, Push)

#### Domain Services
```typescript
interface INotificationStrategy {
  send(notification: Notification): Promise<Result<void>>;
}

class EmailNotificationStrategy implements INotificationStrategy {
  constructor(private emailService: IEmailService) {}

  async send(notification: Notification): Promise<Result<void>> {
    try {
      await this.emailService.send({
        to: notification.recipient,
        subject: notification.title,
        body: notification.body,
        template: notification.template,
      });
      return Result.ok();
    } catch (error) {
      return Result.fail(error.message);
    }
  }
}

class SMSNotificationStrategy implements INotificationStrategy {
  constructor(private smsService: ISMSService) {}

  async send(notification: Notification): Promise<Result<void>> {
    try {
      await this.smsService.send({
        to: notification.recipient,
        message: notification.body,
      });
      return Result.ok();
    } catch (error) {
      return Result.fail(error.message);
    }
  }
}

class PushNotificationStrategy implements INotificationStrategy {
  constructor(private pushService: IPushService) {}

  async send(notification: Notification): Promise<Result<void>> {
    try {
      await this.pushService.send({
        userId: notification.recipient,
        title: notification.title,
        body: notification.body,
        data: notification.metadata,
      });
      return Result.ok();
    } catch (error) {
      return Result.fail(error.message);
    }
  }
}

class NotificationService {
  private strategies: Map<NotificationType, INotificationStrategy>;

  constructor(
    emailStrategy: EmailNotificationStrategy,
    smsStrategy: SMSNotificationStrategy,
    pushStrategy: PushNotificationStrategy
  ) {
    this.strategies = new Map([
      [NotificationType.Email, emailStrategy],
      [NotificationType.SMS, smsStrategy],
      [NotificationType.Push, pushStrategy],
    ]);
  }

  async send(notification: Notification): Promise<Result<void>> {
    const strategy = this.strategies.get(notification.type);
    if (!strategy) {
      return Result.fail(`No strategy for notification type: ${notification.type}`);
    }

    return await strategy.send(notification);
  }

  async sendMultiple(
    notification: Notification,
    types: NotificationType[]
  ): Promise<void> {
    await Promise.all(
      types.map(type =>
        this.send({ ...notification, type })
      )
    );
  }
}
```

### 3.6 Document Context

**Ответственность**: Управление юридическими документами, шаблоны

#### Aggregates
```typescript
class Document extends AggregateRoot {
  private constructor(
    public readonly id: DocumentId,
    public ownerId: UserId,
    public type: DocumentType,
    public name: string,
    public content: DocumentContent,
    public status: DocumentStatus,
    public version: number,
    private metadata: DocumentMetadata
  ) {}

  static create(props: CreateDocumentProps): Result<Document> {
    const contentOrError = DocumentContent.create(props.content);
    if (contentOrError.isFailure) {
      return Result.fail(contentOrError.error);
    }

    const document = new Document(
      DocumentId.generate(),
      props.ownerId,
      props.type,
      props.name,
      contentOrError.getValue(),
      DocumentStatus.Draft,
      1,
      DocumentMetadata.create(props.metadata)
    );

    document.addDomainEvent(new DocumentCreatedEvent(document));
    return Result.ok(document);
  }

  update(newContent: string): Result<void> {
    if (this.status === DocumentStatus.Finalized) {
      return Result.fail('Cannot update finalized document');
    }

    const contentOrError = DocumentContent.create(newContent);
    if (contentOrError.isFailure) {
      return Result.fail(contentOrError.error);
    }

    this.content = contentOrError.getValue();
    this.version++;
    this.addDomainEvent(new DocumentUpdatedEvent(this));
    return Result.ok();
  }

  finalize(): Result<void> {
    if (this.status === DocumentStatus.Finalized) {
      return Result.fail('Document is already finalized');
    }

    this.status = DocumentStatus.Finalized;
    this.addDomainEvent(new DocumentFinalizedEvent(this));
    return Result.ok();
  }
}

class DocumentTemplate extends AggregateRoot {
  private constructor(
    public readonly id: DocumentTemplateId,
    public name: string,
    public category: DocumentCategory,
    public template: string,
    public variables: TemplateVariable[],
    public isActive: boolean
  ) {}

  static create(props: CreateDocumentTemplateProps): Result<DocumentTemplate> {
    const template = new DocumentTemplate(
      DocumentTemplateId.generate(),
      props.name,
      props.category,
      props.template,
      props.variables,
      true
    );

    template.addDomainEvent(new DocumentTemplateCreatedEvent(template));
    return Result.ok(template);
  }

  fill(values: Record<string, any>): Result<string> {
    // Проверить, что все обязательные переменные заполнены
    const missingVars = this.variables
      .filter(v => v.isRequired && !values[v.name])
      .map(v => v.name);

    if (missingVars.length > 0) {
      return Result.fail(`Missing required variables: ${missingVars.join(', ')}`);
    }

    // Заполнить шаблон
    let filled = this.template;
    for (const [key, value] of Object.entries(values)) {
      filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return Result.ok(filled);
  }
}
```

---

## 4. BACKEND АРХИТЕКТУРА

### 4.1 Структура проекта (NestJS)

```
backend/
├── src/
│   ├── modules/                    # Bounded Contexts
│   │   ├── identity/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── user.entity.ts
│   │   │   │   │   └── user-id.vo.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── email.vo.ts
│   │   │   │   │   └── phone-number.vo.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── user-created.event.ts
│   │   │   │   │   └── user-verified.event.ts
│   │   │   │   └── repositories/
│   │   │   │       └── user.repository.interface.ts
│   │   │   │
│   │   │   ├── application/
│   │   │   │   ├── commands/
│   │   │   │   │   ├── register-user/
│   │   │   │   │   │   ├── register-user.command.ts
│   │   │   │   │   │   ├── register-user.handler.ts
│   │   │   │   │   │   └── register-user.dto.ts
│   │   │   │   │   └── verify-otp/
│   │   │   │   │
│   │   │   │   ├── queries/
│   │   │   │   │   ├── get-user/
│   │   │   │   │   └── get-user-profile/
│   │   │   │   │
│   │   │   │   └── services/
│   │   │   │       └── auth.service.ts
│   │   │   │
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── user.repository.ts
│   │   │   │   │   └── user.schema.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── jwt.service.ts
│   │   │   │   │   └── otp.service.ts
│   │   │   │   └── adapters/
│   │   │   │       └── supabase.adapter.ts
│   │   │   │
│   │   │   └── presentation/
│   │   │       ├── controllers/
│   │   │       │   └── auth.controller.ts
│   │   │       └── guards/
│   │   │           └── jwt-auth.guard.ts
│   │   │
│   │   ├── lawyer/                 # Lawyer Management Context
│   │   ├── consultation/           # Consultation Context
│   │   ├── payment/                # Payment Context
│   │   ├── notification/           # Notification Context
│   │   └── document/               # Document Context
│   │
│   ├── shared/                     # Shared Kernel
│   │   ├── domain/
│   │   │   ├── aggregate-root.ts
│   │   │   ├── entity.ts
│   │   │   ├── value-object.ts
│   │   │   ├── domain-event.ts
│   │   │   └── result.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   │   └── database.module.ts
│   │   │   ├── cache/
│   │   │   │   └── redis.module.ts
│   │   │   └── event-bus/
│   │   │       └── event-bus.module.ts
│   │   │
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── validators.ts
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── api/
│   │   └── openapi.yaml
│   ├── architecture/
│   │   └── c4-diagrams.md
│   └── domain/
│       └── ubiquitous-language.md
│
├── .env.example
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

### 4.2 Слои архитектуры

#### Domain Layer (Ядро бизнес-логики)
- **Entities**: Объекты с идентичностью и жизненным циклом
- **Value Objects**: Неизменяемые объекты-значения
- **Aggregates**: Границы консистентности
- **Domain Events**: События изменения состояния
- **Domain Services**: Операции, не принадлежащие одной Entity

#### Application Layer (Use Cases)
- **Commands**: Изменение состояния (CQRS Write)
- **Queries**: Чтение данных (CQRS Read)
- **DTOs**: Data Transfer Objects
- **Application Services**: Оркестрация use cases

#### Infrastructure Layer (Техническая реализация)
- **Repositories**: Реализация доступа к данным
- **External Services**: API третьих сторон
- **Adapters**: Адаптеры к внешним системам
- **ORM/Database**: Supabase, PostgreSQL

#### Presentation Layer (API)
- **Controllers**: REST endpoints
- **GraphQL Resolvers**: (опционально)
- **Validation**: DTO валидация
- **Middleware**: Auth, Logging, Error Handling

### 4.3 Database Schema (PostgreSQL)

```sql
-- ============================================
-- IDENTITY CONTEXT
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'lawyer', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  date_of_birth DATE,
  gender VARCHAR(10),
  city VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- LAWYER CONTEXT
-- ============================================

CREATE TABLE lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bar_license_number VARCHAR(50) UNIQUE,
  specializations TEXT[] NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  education JSONB NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
  city VARCHAR(100) NOT NULL,
  bio TEXT,
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  consultation_count INTEGER DEFAULT 0 CHECK (consultation_count >= 0),
  is_online BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'suspended', 'rejected')
  ),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lawyers_specializations ON lawyers USING GIN(specializations);
CREATE INDEX idx_lawyers_city ON lawyers(city);
CREATE INDEX idx_lawyers_rating ON lawyers(rating DESC);
CREATE INDEX idx_lawyers_status ON lawyers(status) WHERE status = 'active';

CREATE TABLE lawyer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_url TEXT NOT NULL,
  verified_by UUID REFERENCES users(id),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'approved', 'rejected')
  ),
  rejection_reason TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE lawyer_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT check_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_lawyer_availability_lawyer ON lawyer_availability(lawyer_id);

CREATE TABLE lawyer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id),
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(consultation_id)
);

-- ============================================
-- CONSULTATION CONTEXT
-- ============================================

CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id),
  lawyer_id UUID NOT NULL REFERENCES lawyers(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'phone', 'in_person', 'chat')),
  scheduled_start TIMESTAMP NOT NULL,
  scheduled_end TIMESTAMP NOT NULL,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')
  ),
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT check_scheduled_time CHECK (scheduled_end > scheduled_start),
  CONSTRAINT check_actual_time CHECK (actual_end > actual_start OR actual_end IS NULL)
);

CREATE INDEX idx_consultations_client ON consultations(client_id);
CREATE INDEX idx_consultations_lawyer ON consultations(lawyer_id);
CREATE INDEX idx_consultations_scheduled_start ON consultations(scheduled_start);
CREATE INDEX idx_consultations_status ON consultations(status);

CREATE TABLE consultation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message_type VARCHAR(20) NOT NULL CHECK (
    message_type IN ('text', 'image', 'document', 'voice')
  ),
  content TEXT NOT NULL,
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultation_messages_consultation ON consultation_messages(consultation_id);

-- ============================================
-- PAYMENT CONTEXT
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  consultation_id UUID REFERENCES consultations(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
  method VARCHAR(20) NOT NULL CHECK (
    method IN ('card', 'yookassa', 'sberpay', 'wallet')
  ),
  provider VARCHAR(50) NOT NULL,
  provider_transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')
  ),
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan VARCHAR(20) NOT NULL CHECK (
    plan IN ('basic', 'premium', 'family')
  ),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'cancelled', 'expired')
  ),
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  remaining_consultations INTEGER NOT NULL DEFAULT 0 CHECK (remaining_consultations >= 0),
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';

-- ============================================
-- NOTIFICATION CONTEXT
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL CHECK (
    type IN ('email', 'sms', 'push')
  ),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  template VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'failed')
  ),
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status) WHERE status = 'pending';

-- ============================================
-- DOCUMENT CONTEXT
-- ============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  consultation_id UUID REFERENCES consultations(id),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'finalized', 'archived')
  ),
  version INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_consultation ON documents(consultation_id);

CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  template TEXT NOT NULL,
  variables JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Автоматическое обновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lawyers_updated_at BEFORE UPDATE ON lawyers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Автоматическое обновление рейтинга юриста
CREATE OR REPLACE FUNCTION update_lawyer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lawyers
  SET
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM lawyer_reviews
      WHERE lawyer_id = NEW.lawyer_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM lawyer_reviews
      WHERE lawyer_id = NEW.lawyer_id
    )
  WHERE id = NEW.lawyer_id;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lawyer_rating_trigger AFTER INSERT OR UPDATE ON lawyer_reviews
  FOR EACH ROW EXECUTE FUNCTION update_lawyer_rating();
```

### 4.4 API Endpoints

#### Authentication
```
POST   /api/v1/auth/register           # Регистрация пользователя
POST   /api/v1/auth/send-otp           # Отправка OTP кода
POST   /api/v1/auth/verify-otp         # Верификация OTP
POST   /api/v1/auth/refresh-token      # Обновление токена
POST   /api/v1/auth/logout             # Выход
```

#### Users
```
GET    /api/v1/users/me                # Текущий пользователь
PUT    /api/v1/users/me                # Обновить профиль
GET    /api/v1/users/:id               # Получить пользователя по ID
DELETE /api/v1/users/me                # Удалить аккаунт
```

#### Lawyers
```
GET    /api/v1/lawyers                 # Список юристов (с фильтрами)
GET    /api/v1/lawyers/:id             # Детали юриста
POST   /api/v1/lawyers                 # Регистрация юриста
PUT    /api/v1/lawyers/:id             # Обновить профиль
GET    /api/v1/lawyers/:id/availability # Доступные слоты
PUT    /api/v1/lawyers/:id/availability # Обновить график
GET    /api/v1/lawyers/:id/reviews     # Отзывы о юристе
```

#### Consultations
```
GET    /api/v1/consultations           # История консультаций
GET    /api/v1/consultations/:id       # Детали консультации
POST   /api/v1/consultations           # Забронировать консультацию
PATCH  /api/v1/consultations/:id       # Обновить (отменить, завершить)
GET    /api/v1/consultations/:id/messages # Сообщения консультации
POST   /api/v1/consultations/:id/messages # Отправить сообщение
POST   /api/v1/consultations/:id/start # Начать консультацию
POST   /api/v1/consultations/:id/complete # Завершить консультацию
```

#### Payments
```
GET    /api/v1/payments                # История платежей
POST   /api/v1/payments                # Создать платеж
GET    /api/v1/payments/:id            # Детали платежа
POST   /api/v1/payments/:id/refund     # Возврат средств
```

#### Subscriptions
```
GET    /api/v1/subscriptions           # Текущая подписка
POST   /api/v1/subscriptions           # Купить подписку
PUT    /api/v1/subscriptions/:id       # Обновить подписку
DELETE /api/v1/subscriptions/:id       # Отменить подписку
```

#### Documents
```
GET    /api/v1/documents               # Список документов
POST   /api/v1/documents               # Загрузить документ
GET    /api/v1/documents/:id           # Скачать документ
DELETE /api/v1/documents/:id           # Удалить документ
GET    /api/v1/document-templates      # Шаблоны документов
POST   /api/v1/document-templates/:id/fill # Заполнить шаблон
```

#### Admin
```
GET    /api/v1/admin/lawyers/pending   # Юристы на верификации
POST   /api/v1/admin/lawyers/:id/verify # Верифицировать юриста
POST   /api/v1/admin/lawyers/:id/reject # Отклонить юриста
GET    /api/v1/admin/analytics         # Аналитика платформы
GET    /api/v1/admin/users             # Список всех пользователей
PATCH  /api/v1/admin/users/:id         # Модерация пользователя
```

---

## 5. FRONTEND АРХИТЕКТУРА

### 5.1 Мобильное приложение (Flutter)

#### Структура проекта
```
mobile/
├── lib/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value_objects/
│   │   │   └── failures/
│   │   ├── infrastructure/
│   │   │   ├── supabase/
│   │   │   ├── storage/
│   │   │   └── network/
│   │   └── presentation/
│   │       ├── theme/
│   │       ├── widgets/
│   │       └── utils/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository.dart
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   └── user_model.dart
│   │   │   │   ├── datasources/
│   │   │   │   │   └── auth_remote_datasource.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── auth_provider.dart
│   │   │       ├── screens/
│   │   │       │   ├── login_screen.dart
│   │   │       │   └── otp_verification_screen.dart
│   │   │       └── widgets/
│   │   │           └── otp_input_field.dart
│   │   │
│   │   ├── lawyer/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   └── presentation/
│   │   │
│   │   ├── consultation/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   └── presentation/
│   │   │
│   │   ├── payment/
│   │   └── profile/
│   │
│   ├── config/
│   │   ├── router.dart
│   │   └── supabase_config.dart
│   │
│   └── main.dart
│
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
│
└── pubspec.yaml
```

#### Clean Architecture слои

**Domain Layer**
```dart
// features/lawyer/domain/entities/lawyer.dart
@freezed
class Lawyer with _$Lawyer {
  const factory Lawyer({
    required LawyerId id,
    required String name,
    required List<String> specializations,
    required int experienceYears,
    required Money hourlyRate,
    required String city,
    required double rating,
    required int reviewCount,
    required bool isOnline,
    String? bio,
  }) = _Lawyer;
}

// features/lawyer/domain/repositories/lawyer_repository.dart
abstract class LawyerRepository {
  Future<Either<Failure, List<Lawyer>>> searchLawyers({
    required List<String> specializations,
    String? city,
    Money? maxHourlyRate,
  });

  Future<Either<Failure, Lawyer>> getLawyer(LawyerId id);

  Future<Either<Failure, List<TimeSlot>>> getAvailability(
    LawyerId id,
    DateTime date,
  );
}
```

**Data Layer**
```dart
// features/lawyer/data/models/lawyer_model.dart
@freezed
class LawyerModel with _$LawyerModel {
  const factory LawyerModel({
    required String id,
    required String name,
    required List<String> specializations,
    required int experienceYears,
    required double hourlyRate,
    required String currency,
    required String city,
    required double rating,
    required int reviewCount,
    required bool isOnline,
    String? bio,
  }) = _LawyerModel;

  factory LawyerModel.fromJson(Map<String, dynamic> json) =>
      _$LawyerModelFromJson(json);

  // Mapper to domain entity
  Lawyer toDomain() {
    return Lawyer(
      id: LawyerId(id),
      name: name,
      specializations: specializations,
      experienceYears: experienceYears,
      hourlyRate: Money(hourlyRate, currency),
      city: city,
      rating: rating,
      reviewCount: reviewCount,
      isOnline: isOnline,
      bio: bio,
    );
  }
}

// features/lawyer/data/repositories/lawyer_repository_impl.dart
class LawyerRepositoryImpl implements LawyerRepository {
  final LawyerRemoteDataSource remoteDataSource;
  final LawyerLocalDataSource localDataSource;

  LawyerRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<Either<Failure, List<Lawyer>>> searchLawyers({
    required List<String> specializations,
    String? city,
    Money? maxHourlyRate,
  }) async {
    try {
      final models = await remoteDataSource.searchLawyers(
        specializations: specializations,
        city: city,
        maxHourlyRate: maxHourlyRate?.amount,
      );

      final lawyers = models.map((m) => m.toDomain()).toList();

      // Cache locally
      await localDataSource.cacheLawyers(lawyers);

      return Right(lawyers);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on NetworkException {
      // Попробовать получить из кеша
      try {
        final cached = await localDataSource.getCachedLawyers();
        return Right(cached);
      } catch (_) {
        return Left(NetworkFailure('No internet connection'));
      }
    }
  }
}
```

**Presentation Layer (Riverpod)**
```dart
// features/lawyer/presentation/providers/lawyer_provider.dart
@riverpod
class LawyerSearch extends _$LawyerSearch {
  @override
  Future<List<Lawyer>> build({
    required List<String> specializations,
    String? city,
    Money? maxHourlyRate,
  }) async {
    final repository = ref.watch(lawyerRepositoryProvider);

    final result = await repository.searchLawyers(
      specializations: specializations,
      city: city,
      maxHourlyRate: maxHourlyRate,
    );

    return result.fold(
      (failure) => throw Exception(failure.message),
      (lawyers) => lawyers,
    );
  }
}

@riverpod
Future<Lawyer> lawyerDetail(LawyerDetailRef ref, LawyerId id) async {
  final repository = ref.watch(lawyerRepositoryProvider);

  final result = await repository.getLawyer(id);

  return result.fold(
    (failure) => throw Exception(failure.message),
    (lawyer) => lawyer,
  );
}

// features/lawyer/presentation/screens/lawyers_list_screen.dart
class LawyersListScreen extends ConsumerWidget {
  const LawyersListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filters = ref.watch(lawyerFiltersProvider);
    final lawyersAsync = ref.watch(
      lawyerSearchProvider(
        specializations: filters.specializations,
        city: filters.city,
        maxHourlyRate: filters.maxHourlyRate,
      ),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Найти юриста'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilters(context, ref),
          ),
        ],
      ),
      body: lawyersAsync.when(
        data: (lawyers) {
          if (lawyers.isEmpty) {
            return const EmptyState(
              message: 'Юристы не найдены. Попробуйте изменить фильтры.',
            );
          }

          return ListView.builder(
            itemCount: lawyers.length,
            itemBuilder: (context, index) {
              return LawyerCard(
                lawyer: lawyers[index],
                onTap: () => context.push('/lawyers/${lawyers[index].id.value}'),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => ErrorState(
          message: error.toString(),
          onRetry: () => ref.invalidate(lawyerSearchProvider),
        ),
      ),
    );
  }
}
```

#### Реиспользуемые компоненты

**Buttons**
```dart
// core/presentation/widgets/buttons/primary_button.dart
class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;

  const PrimaryButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 20),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: AppTextStyles.button,
                  ),
                ],
              ),
      ),
    );
  }
}
```

**Cards**
```dart
// features/lawyer/presentation/widgets/lawyer_card.dart
class LawyerCard extends StatelessWidget {
  final Lawyer lawyer;
  final VoidCallback onTap;

  const LawyerCard({
    Key? key,
    required this.lawyer,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Avatar
              CircleAvatar(
                radius: 32,
                backgroundColor: AppColors.primaryLight,
                child: Text(
                  lawyer.name.substring(0, 1),
                  style: AppTextStyles.heading2.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ),

              const SizedBox(width: 16),

              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name
                    Text(
                      lawyer.name,
                      style: AppTextStyles.heading3,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const SizedBox(height: 4),

                    // Specializations
                    Text(
                      lawyer.specializations.join(', '),
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const SizedBox(height: 8),

                    // Rating & Price
                    Row(
                      children: [
                        const Icon(
                          Icons.star,
                          size: 16,
                          color: AppColors.warning,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${lawyer.rating.toStringAsFixed(1)} (${lawyer.reviewCount})',
                          style: AppTextStyles.caption,
                        ),

                        const SizedBox(width: 16),

                        Text(
                          '${lawyer.hourlyRate.format()}/час',
                          style: AppTextStyles.caption.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Online indicator
              if (lawyer.isOnline)
                Container(
                  width: 12,
                  height: 12,
                  decoration: const BoxDecoration(
                    color: AppColors.secondary,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 5.2 Навигация (GoRouter)

```dart
// config/router.dart
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/onboarding',
    redirect: (context, state) {
      final isLoggedIn = authState.valueOrNull != null;
      final isOnboarding = state.location == '/onboarding';
      final isAuth = state.location.startsWith('/auth');

      if (!isLoggedIn && !isOnboarding && !isAuth) {
        return '/onboarding';
      }

      if (isLoggedIn && (isOnboarding || isAuth)) {
        return '/home';
      }

      return null;
    },
    routes: [
      // Onboarding
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // Auth
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/otp',
        builder: (context, state) {
          final email = state.extra as String;
          return OTPVerificationScreen(email: email);
        },
      ),

      // Main app (with bottom navigation)
      ShellRoute(
        builder: (context, state, child) {
          return MainLayout(child: child);
        },
        routes: [
          GoRoute(
            path: '/home',
            pageBuilder: (context, state) => NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: '/lawyers',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const LawyersListScreen(),
            ),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return LawyerDetailScreen(lawyerId: LawyerId(id));
                },
              ),
            ],
          ),
          GoRoute(
            path: '/consultations',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const ConsultationsScreen(),
            ),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) => NoTransitionPage(
              child: const ProfileScreen(),
            ),
          ),
        ],
      ),

      // Consultation booking
      GoRoute(
        path: '/booking/:lawyerId',
        builder: (context, state) {
          final lawyerId = state.pathParameters['lawyerId']!;
          return ConsultationBookingScreen(lawyerId: LawyerId(lawyerId));
        },
      ),

      // Active consultation
      GoRoute(
        path: '/consultation/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return ActiveConsultationScreen(consultationId: ConsultationId(id));
        },
      ),
    ],
  );
});
```

---

## 6. АДМИН ПАНЕЛЬ

### 6.1 Технологии

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Tables**: TanStack Table

### 6.2 Структура проекта

```
admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx                    # Dashboard overview
│   │   │   ├── lawyers/
│   │   │   │   ├── page.tsx                # Список юристов
│   │   │   │   ├── pending/
│   │   │   │   │   └── page.tsx            # Юристы на верификации
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx            # Детали юриста
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── page.tsx                # Список пользователей
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx            # Детали пользователя
│   │   │   │
│   │   │   ├── consultations/
│   │   │   │   ├── page.tsx                # Все консультации
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx            # Детали консультации
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   └── page.tsx                # Транзакции
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx                # Аналитика
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── templates/
│   │   │   │   │   └── page.tsx            # Управление шаблонами
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                             # Shadcn компоненты
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layouts/
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   │
│   │   ├── lawyers/
│   │   │   ├── lawyer-table.tsx
│   │   │   ├── verification-form.tsx
│   │   │   └── document-viewer.tsx
│   │   │
│   │   └── analytics/
│   │       ├── revenue-chart.tsx
│   │       ├── users-chart.tsx
│   │       └── consultations-chart.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                   # API client
│   │   │   └── endpoints/
│   │   │       ├── lawyers.ts
│   │   │       ├── users.ts
│   │   │       └── analytics.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-lawyers.ts
│   │   │   ├── use-users.ts
│   │   │   └── use-analytics.ts
│   │   │
│   │   └── utils.ts
│   │
│   └── types/
│       └── api.ts
│
├── public/
├── .env.local
└── package.json
```

### 6.3 Ключевые функции

#### Dashboard Overview
- **KPIs**: Активные пользователи, консультации сегодня, выручка
- **Графики**: Динамика регистраций, консультаций, выручки
- **Активность**: Последние действия юристов и клиентов

#### Lawyer Verification
```tsx
// components/lawyers/verification-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useVerifyLawyer } from '@/lib/hooks/use-lawyers';

const verificationSchema = z.object({
  isApproved: z.boolean(),
  rejectionReason: z.string().optional(),
});

export function LawyerVerificationForm({ lawyer }: { lawyer: Lawyer }) {
  const { mutate: verify, isLoading } = useVerifyLawyer();

  const form = useForm({
    resolver: zodResolver(verificationSchema),
  });

  const onApprove = () => {
    verify({
      lawyerId: lawyer.id,
      isApproved: true,
    });
  };

  const onReject = (data: { rejectionReason: string }) => {
    verify({
      lawyerId: lawyer.id,
      isApproved: false,
      rejectionReason: data.rejectionReason,
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Верификация юриста</h3>

      <div className="space-y-4">
        {/* Display lawyer info */}
        <div>
          <h4 className="font-medium">Информация</h4>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="text-sm text-gray-500">ФИО</dt>
              <dd>{lawyer.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Номер лицензии</dt>
              <dd>{lawyer.barLicenseNumber || 'Не указан'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Опыт</dt>
              <dd>{lawyer.experienceYears} лет</dd>
            </div>
          </dl>
        </div>

        {/* Documents */}
        <div>
          <h4 className="font-medium mb-2">Документы</h4>
          <div className="grid grid-cols-2 gap-4">
            {lawyer.verificationDocuments.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border rounded p-4 hover:bg-gray-50"
              >
                {doc.type}
              </a>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1"
          >
            Одобрить
          </Button>

          <Button
            onClick={() => {
              const reason = prompt('Причина отклонения:');
              if (reason) {
                onReject({ rejectionReason: reason });
              }
            }}
            disabled={isLoading}
            variant="destructive"
            className="flex-1"
          >
            Отклонить
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

#### Analytics Dashboard
```tsx
// app/(dashboard)/analytics/page.tsx
'use client';

import { Card } from '@/components/ui/card';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import { RevenueChart } from '@/components/analytics/revenue-chart';
import { UsersChart } from '@/components/analytics/users-chart';
import { ConsultationsChart } from '@/components/analytics/consultations-chart';

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics({
    startDate: new Date('2025-01-01'),
    endDate: new Date(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Аналитика</h1>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-500">Всего пользователей</div>
          <div className="text-3xl font-bold mt-2">
            {analytics.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 mt-1">
            +{analytics.newUsersThisMonth} за месяц
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-500">Консультаций</div>
          <div className="text-3xl font-bold mt-2">
            {analytics.totalConsultations.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 mt-1">
            +{analytics.consultationsThisMonth} за месяц
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-500">Выручка</div>
          <div className="text-3xl font-bold mt-2">
            ₽{analytics.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 mt-1">
            +₽{analytics.revenueThisMonth.toLocaleString()} за месяц
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-500">Средний чек</div>
          <div className="text-3xl font-bold mt-2">
            ₽{analytics.averageConsultationPrice.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Выручка по месяцам</h3>
          <RevenueChart data={analytics.revenueByMonth} />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Новые пользователи</h3>
          <UsersChart data={analytics.usersByMonth} />
        </Card>

        <Card className="p-6 col-span-2">
          <h3 className="text-lg font-semibold mb-4">Консультации</h3>
          <ConsultationsChart data={analytics.consultationsByDay} />
        </Card>
      </div>
    </div>
  );
}
```

---

## 7. ЛЕНДИНГ ДЛЯ ИНВЕСТОРОВ

### 7.1 Технологии

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Deployment**: Vercel

### 7.2 Структура лендинга

```
Sections:
1. Hero - "Uber для юристов"
2. Problem - Болевые точки клиентов
3. Solution - Наше решение
4. Market - Размер рынка и возможности
5. Business Model - Монетизация
6. Traction - Метрики роста (если есть)
7. Team - Команда
8. Ask - Инвестиционный запрос
9. Contact - Форма связи
```

### 7.3 Примеры секций

#### Hero Section
```tsx
// app/page.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-6xl font-bold mb-6">
              Мгновенный доступ к юристу
              <br />
              <span className="text-blue-200">когда это действительно важно</span>
            </h1>

            <p className="text-xl mb-8 text-blue-100">
              Платформа для вызова квалифицированных юристов в экстренных ситуациях.
              ДТП, задержания, трудовые споры — помощь юриста за 20 минут.
            </p>

            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Презентация для инвесторов
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Связаться с нами
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold">40-54 млрд ₽</div>
                <div className="text-blue-200 mt-2">Размер рынка РФ</div>
              </div>
              <div>
                <div className="text-4xl font-bold">28 мес.</div>
                <div className="text-blue-200 mt-2">До точки безубыточности</div>
              </div>
              <div>
                <div className="text-4xl font-bold">3-6.7x</div>
                <div className="text-blue-200 mt-2">LTV/CAC ratio</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Market Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-center mb-12">
              Огромный рынок с минимальной конкуренцией
            </h2>

            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-bold mb-4">Рынок</h3>
                <ul className="space-y-3">
                  <li>• 40-54 млрд ₽ (юруслуги для физлиц)</li>
                  <li>• 6-8 млрд ₽ (on-demand сегмент)</li>
                  <li>• Рост 10-15% ежегодно</li>
                  <li>• 79% готовы работать с юристами онлайн</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-4">Конкуренция</h3>
                <ul className="space-y-3">
                  <li>• AdvoCall: 28,000 пользователей (вся РФ)</li>
                  <li>• Рейтинг 3.2/5 в RuStore</li>
                  <li>• Время прибытия 30-40 минут</li>
                  <li>• Низкое качество услуг</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Business Model */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Модель монетизации
          </h2>

          <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4">Базовая</h3>
              <div className="text-3xl font-bold mb-2">599-899 ₽</div>
              <div className="text-gray-500 mb-4">в месяц</div>
              <ul className="space-y-2 text-sm">
                <li>✓ 1-2 консультации</li>
                <li>✓ До 20 минут</li>
                <li>✓ Проверка документов</li>
                <li>✓ Доступ к шаблонам</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg transform scale-105">
              <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs mb-2">
                Популярный
              </div>
              <h3 className="text-xl font-bold mb-4">Премиум</h3>
              <div className="text-3xl font-bold mb-2">1,499-2,499 ₽</div>
              <div className="text-blue-200 mb-4">в месяц</div>
              <ul className="space-y-2 text-sm">
                <li>✓ 3-5 консультаций</li>
                <li>✓ По 30 минут</li>
                <li>✓ Приоритетная поддержка</li>
                <li>✓ 1 выезд в квартал</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4">Семейная</h3>
              <div className="text-3xl font-bold mb-2">2,999-3,999 ₽</div>
              <div className="text-gray-500 mb-4">в месяц</div>
              <ul className="space-y-2 text-sm">
                <li>✓ До 4 человек</li>
                <li>✓ Все функции Премиум</li>
                <li>✓ 10 консультаций</li>
                <li>✓ 2 выезда в квартал</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Ask */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">
            Мы ищем инвестиции
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-sm text-blue-200 mb-2">Seed раунд</div>
                  <div className="text-4xl font-bold">30-50 млн ₽</div>
                  <div className="text-sm text-blue-200 mt-2">6 месяцев runway</div>
                </div>
                <div>
                  <div className="text-sm text-blue-200 mb-2">Series A</div>
                  <div className="text-4xl font-bold">80-120 млн ₽</div>
                  <div className="text-sm text-blue-200 mt-2">Масштабирование</div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-lg mb-6">
                  Средства пойдут на разработку MVP, маркетинг, набор команды
                  и запуск в Санкт-Петербурге с последующей экспансией.
                </p>

                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Скачать презентацию
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

*Продолжение следует в следующем сообщении...*

---

**Прогресс документа**: 50% завершено
**Следующие разделы**:
- 8. Стратегия тестирования
- 9. Документация
- 10. План разработки по фазам
- 11. Команда и роли
# ADVOCATA - План Разработки (Часть 2)

## 8. СТРАТЕГИЯ ТЕСТИРОВАНИЯ

### 8.1 Test Pyramid

```
                  ▲
                 ╱│╲
                ╱ │ ╲
               ╱  │  ╲
              ╱   │   ╲  E2E Tests (10%)
             ╱────┼────╲ - Critical user flows
            ╱     │     ╲ - Playwright/Cypress
           ╱──────┼──────╲
          ╱       │       ╲ Integration Tests (30%)
         ╱────────┼────────╲ - API tests
        ╱         │         ╲ - Database tests
       ╱──────────┼──────────╲
      ╱═══════════╪═══════════╲ Unit Tests (60%)
     ╱════════════╪════════════╲ - Domain logic
    ════════════════════════════ - Value Objects
                                 - Use Cases
```

### 8.2 Backend Testing

#### Unit Tests (60%)

**Domain Layer Tests**
```typescript
// modules/lawyer/domain/entities/__tests__/lawyer.spec.ts
describe('Lawyer Entity', () => {
  describe('create', () => {
    it('should create a valid lawyer', () => {
      const result = Lawyer.create({
        userId: UserId.create(),
        profile: validLawyerProfile,
        verification: LawyerVerification.createPending(),
        availability: LawyerAvailability.createDefault(),
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().status).toBe(LawyerStatus.Pending);
    });

    it('should fail with invalid hourly rate', () => {
      const result = Lawyer.create({
        ...validProps,
        profile: {
          ...validProfile,
          hourlyRate: Money.create(-100, 'RUB'), // Invalid
        },
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('hourly rate');
    });

    it('should emit LawyerRegisteredEvent on creation', () => {
      const result = Lawyer.create(validProps);
      const lawyer = result.getValue();

      expect(lawyer.domainEvents).toHaveLength(1);
      expect(lawyer.domainEvents[0]).toBeInstanceOf(LawyerRegisteredEvent);
    });
  });

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

    it('should fail to verify non-pending lawyer', () => {
      const lawyer = createActiveLawyer();
      const verificationResult = VerificationResult.approved();

      const result = lawyer.verify(verificationResult);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('not pending');
    });
  });

  describe('updateAvailability', () => {
    it('should update availability with valid time slots', () => {
      const lawyer = createActiveLawyer();
      const timeSlots = [
        TimeSlot.create({ start: '09:00', end: '17:00', dayOfWeek: 1 }),
        TimeSlot.create({ start: '09:00', end: '17:00', dayOfWeek: 2 }),
      ];

      const result = lawyer.updateAvailability(timeSlots);

      expect(result.isSuccess).toBe(true);
      expect(lawyer.availability.getSlots()).toEqual(timeSlots);
    });

    it('should fail with overlapping time slots', () => {
      const lawyer = createActiveLawyer();
      const timeSlots = [
        TimeSlot.create({ start: '09:00', end: '17:00', dayOfWeek: 1 }),
        TimeSlot.create({ start: '15:00', end: '20:00', dayOfWeek: 1 }), // Overlaps
      ];

      const result = lawyer.updateAvailability(timeSlots);

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('overlap');
    });
  });
});
```

**Value Object Tests**
```typescript
// modules/lawyer/domain/value-objects/__tests__/specialization.spec.ts
describe('Specialization', () => {
  it('should create valid specialization', () => {
    const result = Specialization.create('ДТП');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().value).toBe('ДТП');
  });

  it('should fail with invalid specialization', () => {
    const result = Specialization.create('Invalid Specialization');

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Invalid specialization');
  });

  it('should treat specializations as equal by value', () => {
    const spec1 = Specialization.create('ДТП').getValue();
    const spec2 = Specialization.create('ДТП').getValue();

    expect(spec1.equals(spec2)).toBe(true);
  });
});
```

**Use Case Tests**
```typescript
// modules/lawyer/application/commands/__tests__/verify-lawyer.spec.ts
describe('VerifyLawyerUseCase', () => {
  let useCase: VerifyLawyerUseCase;
  let lawyerRepository: MockLawyerRepository;
  let barRegistryService: MockBarRegistryService;
  let eventBus: MockEventBus;

  beforeEach(() => {
    lawyerRepository = new MockLawyerRepository();
    barRegistryService = new MockBarRegistryService();
    eventBus = new MockEventBus();

    useCase = new VerifyLawyerUseCase(
      lawyerRepository,
      barRegistryService,
      eventBus
    );
  });

  it('should verify lawyer with valid bar license', async () => {
    const lawyer = createPendingLawyer();
    lawyerRepository.findById.mockResolvedValue(lawyer);
    barRegistryService.verify.mockResolvedValue(true);

    const command = new VerifyLawyerCommand({
      lawyerId: lawyer.id,
      barLicenseNumber: '123456',
      adminId: 'admin-123',
    });

    const result = await useCase.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(lawyer.status).toBe(LawyerStatus.Active);
    expect(lawyerRepository.save).toHaveBeenCalledWith(lawyer);
    expect(eventBus.publishAll).toHaveBeenCalled();
  });

  it('should fail verification with invalid bar license', async () => {
    const lawyer = createPendingLawyer();
    lawyerRepository.findById.mockResolvedValue(lawyer);
    barRegistryService.verify.mockResolvedValue(false);

    const command = new VerifyLawyerCommand({
      lawyerId: lawyer.id,
      barLicenseNumber: 'invalid',
      adminId: 'admin-123',
    });

    const result = await useCase.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Bar license not found');
    expect(lawyer.status).toBe(LawyerStatus.Pending);
  });

  it('should fail if lawyer not found', async () => {
    lawyerRepository.findById.mockResolvedValue(null);

    const command = new VerifyLawyerCommand({
      lawyerId: LawyerId.create(),
      barLicenseNumber: '123456',
      adminId: 'admin-123',
    });

    const result = await useCase.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Lawyer not found');
  });
});
```

#### Integration Tests (30%)

**Repository Tests**
```typescript
// modules/lawyer/infrastructure/__tests__/lawyer.repository.integration.spec.ts
describe('LawyerRepository Integration', () => {
  let repository: LawyerRepositoryImpl;
  let db: SupabaseClient;

  beforeAll(async () => {
    db = await setupTestDatabase();
    repository = new LawyerRepositoryImpl(db);
  });

  afterAll(async () => {
    await teardownTestDatabase(db);
  });

  afterEach(async () => {
    await db.from('lawyers').delete();
  });

  describe('save', () => {
    it('should save new lawyer to database', async () => {
      const lawyer = createValidLawyer();

      await repository.save(lawyer);

      const saved = await db
        .from('lawyers')
        .select()
        .eq('id', lawyer.id.value)
        .single();

      expect(saved).toBeDefined();
      expect(saved.data.name).toBe(lawyer.profile.name.value);
      expect(saved.data.specializations).toEqual(
        lawyer.profile.specializations.map(s => s.value)
      );
    });

    it('should update existing lawyer', async () => {
      const lawyer = createValidLawyer();
      await repository.save(lawyer);

      lawyer.profile.updateBio('New bio');
      await repository.save(lawyer);

      const updated = await db
        .from('lawyers')
        .select()
        .eq('id', lawyer.id.value)
        .single();

      expect(updated.data.bio).toBe('New bio');
    });
  });

  describe('search', () => {
    it('should search lawyers by specialization', async () => {
      await seedLawyers([
        createLawyer({ specializations: ['ДТП'] }),
        createLawyer({ specializations: ['Уголовное право'] }),
        createLawyer({ specializations: ['ДТП', 'Трудовое право'] }),
      ]);

      const results = await repository.search({
        specializations: ['ДТП'],
      });

      expect(results).toHaveLength(2);
      expect(results.every(l =>
        l.profile.specializations.some(s => s.value === 'ДТП')
      )).toBe(true);
    });

    it('should filter by city', async () => {
      await seedLawyers([
        createLawyer({ city: 'Санкт-Петербург' }),
        createLawyer({ city: 'Москва' }),
        createLawyer({ city: 'Санкт-Петербург' }),
      ]);

      const results = await repository.search({
        city: 'Санкт-Петербург',
      });

      expect(results).toHaveLength(2);
      expect(results.every(l => l.profile.city === 'Санкт-Петербург')).toBe(true);
    });

    it('should sort by rating descending', async () => {
      await seedLawyers([
        createLawyer({ rating: 3.5 }),
        createLawyer({ rating: 4.8 }),
        createLawyer({ rating: 4.2 }),
      ]);

      const results = await repository.search({});

      expect(results[0].statistics.rating).toBe(4.8);
      expect(results[1].statistics.rating).toBe(4.2);
      expect(results[2].statistics.rating).toBe(3.5);
    });
  });
});
```

**API Tests**
```typescript
// modules/lawyer/presentation/__tests__/lawyer.controller.integration.spec.ts
describe('Lawyer Controller Integration', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as test user
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /lawyers', () => {
    it('should return list of lawyers', async () => {
      const response = await request(app.getHttpServer())
        .get('/lawyers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should filter by specialization', async () => {
      const response = await request(app.getHttpServer())
        .get('/lawyers?specializations=ДТП')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.every(
        (lawyer: any) => lawyer.specializations.includes('ДТП')
      )).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/lawyers')
        .expect(401);
    });
  });

  describe('POST /lawyers', () => {
    it('should create new lawyer', async () => {
      const response = await request(app.getHttpServer())
        .post('/lawyers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Иван Иванов',
          specializations: ['ДТП', 'Уголовное право'],
          experienceYears: 5,
          hourlyRate: 2000,
          city: 'Санкт-Петербург',
          bio: 'Опытный юрист',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Иван Иванов');
      expect(response.body.status).toBe('pending');
    });

    it('should fail with invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/lawyers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '',
          specializations: [],
          experienceYears: -1,
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });
});
```

#### E2E Tests (10%)

**Critical User Flows**
```typescript
// test/e2e/consultation-booking.e2e-spec.ts
describe('Consultation Booking Flow (E2E)', () => {
  let app: INestApplication;
  let client: any;
  let lawyer: any;

  beforeAll(async () => {
    app = await setupTestApp();

    // Create test client
    client = await createTestUser({ role: 'client' });

    // Create test lawyer
    lawyer = await createTestLawyer({
      specializations: ['ДТП'],
      status: 'active',
    });
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  it('should complete full consultation booking flow', async () => {
    // 1. Client searches for lawyers
    const searchResponse = await request(app.getHttpServer())
      .get('/lawyers?specializations=ДТП')
      .set('Authorization', `Bearer ${client.token}`)
      .expect(200);

    expect(searchResponse.body.items.length).toBeGreaterThan(0);
    const foundLawyer = searchResponse.body.items[0];

    // 2. Client views lawyer details
    const detailResponse = await request(app.getHttpServer())
      .get(`/lawyers/${foundLawyer.id}`)
      .set('Authorization', `Bearer ${client.token}`)
      .expect(200);

    expect(detailResponse.body.id).toBe(foundLawyer.id);

    // 3. Client checks lawyer availability
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const availabilityResponse = await request(app.getHttpServer())
      .get(`/lawyers/${foundLawyer.id}/availability?date=${tomorrow.toISOString()}`)
      .set('Authorization', `Bearer ${client.token}`)
      .expect(200);

    expect(availabilityResponse.body.slots.length).toBeGreaterThan(0);
    const firstSlot = availabilityResponse.body.slots[0];

    // 4. Client creates payment
    const paymentResponse = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${client.token}`)
      .send({
        amount: foundLawyer.hourlyRate,
        method: 'card',
      })
      .expect(201);

    const paymentId = paymentResponse.body.id;

    // 5. Client books consultation
    const bookingResponse = await request(app.getHttpServer())
      .post('/consultations')
      .set('Authorization', `Bearer ${client.token}`)
      .send({
        lawyerId: foundLawyer.id,
        type: 'video',
        scheduledStart: firstSlot.start,
        scheduledEnd: firstSlot.end,
        paymentId,
      })
      .expect(201);

    const consultationId = bookingResponse.body.id;
    expect(bookingResponse.body.status).toBe('scheduled');

    // 6. Verify consultation in client's history
    const historyResponse = await request(app.getHttpServer())
      .get('/consultations')
      .set('Authorization', `Bearer ${client.token}`)
      .expect(200);

    const consultation = historyResponse.body.items.find(
      (c: any) => c.id === consultationId
    );
    expect(consultation).toBeDefined();
    expect(consultation.lawyerId).toBe(foundLawyer.id);

    // 7. Verify lawyer received notification
    const lawyerNotifications = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${lawyer.token}`)
      .expect(200);

    const bookingNotification = lawyerNotifications.body.items.find(
      (n: any) => n.metadata?.consultationId === consultationId
    );
    expect(bookingNotification).toBeDefined();
  });

  it('should prevent double booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    // Book first consultation
    await bookConsultation({
      client,
      lawyer,
      scheduledStart: tomorrow,
      duration: 60,
    });

    // Try to book overlapping consultation
    const response = await request(app.getHttpServer())
      .post('/consultations')
      .set('Authorization', `Bearer ${client.token}`)
      .send({
        lawyerId: lawyer.id,
        type: 'video',
        scheduledStart: tomorrow.toISOString(),
        scheduledEnd: new Date(tomorrow.getTime() + 60 * 60 * 1000).toISOString(),
      })
      .expect(409);

    expect(response.body.error).toContain('not available');
  });
});
```

### 8.3 Frontend Testing (Flutter)

#### Unit Tests
```dart
// test/features/lawyer/domain/entities/lawyer_test.dart
void main() {
  group('Lawyer', () {
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

#### Widget Tests
```dart
// test/features/lawyer/presentation/widgets/lawyer_card_test.dart
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

#### Integration Tests
```dart
// integration_test/consultation_booking_test.dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Consultation Booking Flow', () {
    testWidgets('should complete full booking flow', (tester) async {
      // Setup
      await setupTestEnvironment();

      // Launch app
      await tester.pumpWidget(const MyApp());
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

      // Enter OTP (mock)
      await tester.enterText(find.byKey(Key('otp_field')), '123456');
      await tester.pumpAndSettle();

      // 2. Navigate to lawyers list
      await tester.tap(find.byIcon(Icons.search));
      await tester.pumpAndSettle();

      // 3. Search for lawyers
      await tester.enterText(
        find.byKey(Key('search_field')),
        'ДТП',
      );
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

### 8.4 Test Coverage Goals

| Layer | Target Coverage |
|-------|----------------|
| Domain Layer | 90-100% |
| Application Layer | 80-90% |
| Infrastructure Layer | 70-80% |
| Presentation Layer | 60-70% |
| Overall | 75-85% |

### 8.5 Testing Tools

**Backend:**
- **Unit/Integration**: Jest
- **E2E**: Supertest + Playwright
- **Mocking**: jest-mock-extended
- **Database**: Supabase test instance

**Frontend (Flutter):**
- **Unit**: flutter_test
- **Widget**: flutter_test
- **Integration**: integration_test
- **Mocking**: mockito / mocktail
- **Golden Tests**: golden_toolkit

### 8.6 CI/CD Pipeline Tests

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci
        working-directory: ./backend

      - name: Run unit tests
        run: npm run test:unit
        working-directory: ./backend

      - name: Run integration tests
        run: npm run test:integration
        working-directory: ./backend
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: ./backend

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  mobile-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.0'

      - name: Install dependencies
        run: flutter pub get
        working-directory: ./mobile

      - name: Run tests
        run: flutter test --coverage
        working-directory: ./mobile

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./mobile/coverage/lcov.info
```

---

## 9. ДОКУМЕНТАЦИЯ

### 9.1 Типы документации

#### 9.1.1 Техническая документация

**API Documentation**
```
docs/api/
├── openapi.yaml                 # OpenAPI 3.0 спецификация
├── postman-collection.json      # Postman коллекция
├── authentication.md            # Руководство по аутентификации
├── rate-limiting.md             # Rate limiting политика
└── webhooks.md                  # Webhook events
```

**Architecture Documentation**
```
docs/architecture/
├── c4-diagrams/
│   ├── context.md               # C4 Context диаграмма
│   ├── container.md             # C4 Container диаграмма
│   ├── component.md             # C4 Component диаграммы
│   └── code.md                  # C4 Code диаграммы
│
├── adr/                         # Architecture Decision Records
│   ├── 001-use-ddd.md
│   ├── 002-use-nestjs.md
│   ├── 003-use-supabase.md
│   └── ...
│
├── domain-model.md              # Модель домена
├── bounded-contexts.md          # Описание bounded contexts
└── event-storming.md            # Event storming результаты
```

**Domain Documentation**
```
docs/domain/
├── ubiquitous-language.md       # Единый язык проекта
├── business-rules.md            # Бизнес-правила
├── workflows.md                 # Бизнес-процессы
└── entities.md                  # Описание сущностей
```

#### 9.1.2 Пользовательская документация

**End User Documentation**
```
docs/user/
├── client/
│   ├── getting-started.md       # Начало работы
│   ├── booking-consultation.md  # Как забронировать консультацию
│   ├── subscriptions.md         # Управление подпиской
│   └── faq.md                   # Частые вопросы
│
└── lawyer/
    ├── getting-started.md       # Начало работы для юристов
    ├── verification.md          # Процесс верификации
    ├── availability.md          # Управление доступностью
    └── consultations.md         # Проведение консультаций
```

#### 9.1.3 Операционная документация

**DevOps Documentation**
```
docs/ops/
├── deployment.md                # Процесс деплоя
├── monitoring.md                # Мониторинг и алерты
├── backup-restore.md            # Бэкапы и восстановление
├── incident-response.md         # Реагирование на инциденты
└── runbooks/
    ├── database-migration.md
    ├── scaling.md
    └── disaster-recovery.md
```

### 9.2 Documentation as Code

**Example: ADR Template**
```markdown
# ADR-001: Use Domain-Driven Design

## Status
Accepted

## Context
We are building a complex application with multiple bounded contexts
(Identity, Lawyer Management, Consultation, Payment). We need an
architectural approach that:
- Handles business complexity
- Provides clear boundaries between contexts
- Supports team collaboration
- Allows for evolution

## Decision
We will use Domain-Driven Design (DDD) as our core architectural approach,
including:
- Strategic patterns (Bounded Contexts, Context Mapping)
- Tactical patterns (Entities, Value Objects, Aggregates, Repositories)
- Ubiquitous Language
- Event-Driven Architecture

## Consequences

### Positive
- Clear separation of concerns
- Shared understanding through Ubiquitous Language
- Easier testing (domain logic isolated)
- Better scalability (contexts can be scaled independently)

### Negative
- Steeper learning curve for team members
- More upfront design work
- Risk of over-engineering simple features

### Neutral
- Requires strong collaboration with domain experts
- Need to maintain consistency across bounded contexts
```

**Example: API Documentation (OpenAPI)**
```yaml
# docs/api/openapi.yaml
openapi: 3.0.0
info:
  title: Advocata API
  version: 1.0.0
  description: API для платформы Advocata

servers:
  - url: https://api.advocata.ru/v1
    description: Production
  - url: https://staging-api.advocata.ru/v1
    description: Staging

paths:
  /lawyers:
    get:
      summary: Поиск юристов
      tags:
        - Lawyers
      parameters:
        - name: specializations
          in: query
          schema:
            type: array
            items:
              type: string
          description: Специализации юристов
        - name: city
          in: query
          schema:
            type: string
          description: Город
        - name: maxHourlyRate
          in: query
          schema:
            type: number
          description: Максимальная ставка в час
      responses:
        '200':
          description: Список юристов
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/Lawyer'
                  total:
                    type: integer
                  page:
                    type: integer
                  pageSize:
                    type: integer

components:
  schemas:
    Lawyer:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        specializations:
          type: array
          items:
            type: string
        experienceYears:
          type: integer
        hourlyRate:
          type: number
        currency:
          type: string
        city:
          type: string
        rating:
          type: number
          format: float
        reviewCount:
          type: integer
        isOnline:
          type: boolean

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

### 9.3 Documentation Tools

**Backend:**
- **API Docs**: Swagger UI (автогенерация из OpenAPI)
- **Code Docs**: TSDoc
- **Architecture**: C4 PlantUML / Mermaid

**Frontend:**
- **Code Docs**: DartDoc
- **Widget Catalog**: Widgetbook

**General:**
- **Knowledge Base**: Notion / Confluence
- **Diagrams**: Excalidraw / Miro
- **Version Control**: Git (docs хранятся рядом с кодом)

---

## 10. ПЛАН РАЗРАБОТКИ ПО ФАЗАМ

### Phase 0: Подготовка (Недели 1-2)

**Цель**: Настройка инфраструктуры и команды

#### Tasks:
```
├─ Team Setup
│  ├─ Набор команды (разработчики, дизайнеры, QA)
│  ├─ Onboarding новых членов
│  └─ Распределение ролей
│
├─ Infrastructure Setup
│  ├─ Настройка Supabase instance (российские серверы)
│  ├─ Настройка Git repositories
│  ├─ CI/CD pipeline (GitHub Actions)
│  ├─ Development environment
│  └─ Staging environment
│
├─ Development Tools
│  ├─ Code standards & linting
│  ├─ Pre-commit hooks
│  ├─ Issue tracking (Jira/Linear)
│  └─ Communication channels (Slack/Telegram)
│
└─ Documentation
   ├─ Ubiquitous Language
   ├─ Domain Model
   └─ Architecture Decision Records
```

**Deliverables:**
- Работающая CI/CD pipeline
- Development & staging окружения
- Команда готова к разработке
- Базовая документация

**Субагенты:**
- DevOps агент (настройка инфраструктуры)
- Documentation агент (создание базовой документации)

---

### Phase 1: MVP Backend (Недели 3-6)

**Цель**: Разработка core backend функционала

#### Subphases:

**Week 3-4: Identity & Auth Context**
```
├─ Domain Layer
│  ├─ User entity
│  ├─ Value objects (Email, PhoneNumber)
│  └─ Domain events
│
├─ Application Layer
│  ├─ RegisterUserUseCase
│  ├─ SendOTPUseCase
│  ├─ VerifyOTPUseCase
│  └─ RefreshTokenUseCase
│
├─ Infrastructure Layer
│  ├─ Supabase integration
│  ├─ UserRepository implementation
│  └─ JWT service
│
└─ Presentation Layer
   ├─ Auth controller
   ├─ Guards & decorators
   └─ DTOs & validation
```

**Week 5-6: Lawyer Management Context (MVP)**
```
├─ Domain Layer
│  ├─ Lawyer aggregate
│  ├─ LawyerProfile value object
│  └─ Verification domain service
│
├─ Application Layer
│  ├─ RegisterLawyerUseCase
│  ├─ SearchLawyersQuery
│  └─ GetLawyerDetailQuery
│
├─ Infrastructure Layer
│  ├─ LawyerRepository
│  └─ Database schema
│
└─ Presentation Layer
   ├─ Lawyer controller
   └─ DTOs
```

**Tests:**
- Unit tests для domain logic
- Integration tests для repositories
- API tests для controllers

**Deliverables:**
- Работающий Auth API
- API поиска юристов
- API регистрации юристов
- 75%+ code coverage

**Субагенты:**
- Backend Dev Agent #1 (Identity Context)
- Backend Dev Agent #2 (Lawyer Context)
- Testing Agent (написание тестов)

---

### Phase 2: MVP Mobile App (Недели 7-10)

**Цель**: Разработка мобильного приложения с базовым функционалом

#### Week 7-8: Ребрендинг Zer0 → Advocata
```
├─ Branding
│  ├─ Обновить цветовую схему
│  ├─ Обновить логотип
│  ├─ Обновить название приложения
│  └─ Обновить иконки
│
├─ Core Structure
│  ├─ Удалить food tracking features
│  ├─ Настроить navigation для юристов
│  └─ Обновить models (User → Lawyer, etc.)
│
└─ Auth Flow
   ├─ Переиспользовать OTP flow
   ├─ Обновить onboarding screens
   └─ Интеграция с backend Auth API
```

**Week 9-10: Lawyer Search & Booking**
```
├─ Lawyer Search
│  ├─ LawyersListScreen
│  ├─ SearchBar + Filters
│  ├─ LawyerCard widget
│  └─ Integration с backend
│
├─ Lawyer Detail
│  ├─ LawyerDetailScreen
│  ├─ Reviews section
│  ├─ Availability calendar
│  └─ Booking button
│
└─ Booking Flow (Simplified)
   ├─ Time slot selection
   ├─ Booking confirmation
   └─ Success screen
```

**Tests:**
- Widget tests для компонентов
- Integration tests для flows

**Deliverables:**
- Работающее мобильное приложение (iOS + Android)
- Auth + Lawyer search + Booking
- Интеграция с backend

**Субагенты:**
- Mobile Dev Agent #1 (Rebrand + Auth)
- Mobile Dev Agent #2 (Lawyer features)
- UI/UX Agent (дизайн адаптация)

---

### Phase 3: Consultation & Payment (Недели 11-14)

**Цель**: Реализация консультаций и платежей

#### Week 11-12: Backend - Consultation Context
```
├─ Domain Layer
│  ├─ Consultation aggregate
│  ├─ ConsultationSession
│  └─ ConsultationAvailabilityService
│
├─ Application Layer
│  ├─ BookConsultationUseCase
│  ├─ StartConsultationUseCase
│  ├─ CompleteConsultationUseCase
│  └─ CancelConsultationUseCase
│
└─ Infrastructure Layer
   ├─ ConsultationRepository
   └─ Real-time messaging (Supabase Realtime)
```

**Week 11-12: Backend - Payment Context**
```
├─ Domain Layer
│  ├─ Payment aggregate
│  ├─ Subscription aggregate
│  └─ PaymentMethod value object
│
├─ Application Layer
│  ├─ CreatePaymentUseCase
│  ├─ ProcessPaymentUseCase
│  ├─ RefundPaymentUseCase
│  └─ CreateSubscriptionUseCase
│
└─ Infrastructure Layer
   ├─ ЮКасса integration
   └─ PaymentRepository
```

**Week 13-14: Mobile - Consultation Features**
```
├─ Consultation Booking
│  ├─ ConsultationBookingScreen
│  ├─ Time slot picker
│  ├─ Payment integration
│  └─ Confirmation
│
├─ Active Consultation
│  ├─ ActiveConsultationScreen
│  ├─ Chat functionality
│  ├─ Timer widget
│  └─ End consultation flow
│
└─ Consultation History
   ├─ ConsultationHistoryScreen
   ├─ Review & rating
   └─ Repeat booking
```

**Deliverables:**
- Полный цикл консультации (бронирование → проведение → завершение)
- Интеграция платежей (ЮКасса)
- Real-time чат

**Субагенты:**
- Backend Dev Agent #1 (Consultation)
- Backend Dev Agent #2 (Payment)
- Mobile Dev Agent (UI implementation)
- Integration Agent (payment gateway integration)

---

### Phase 4: Admin Panel (Недели 15-17)

**Цель**: Админская панель для модерации и аналитики

#### Week 15-16: Core Admin Features
```
├─ Authentication
│  └─ Admin login
│
├─ Lawyer Verification
│  ├─ Pending lawyers list
│  ├─ Document viewer
│  ├─ Verification form
│  └─ Approve/Reject flow
│
├─ User Management
│  ├─ Users table
│  ├─ User details
│  └─ Ban/Suspend actions
│
└─ Consultation Management
   ├─ Consultations list
   ├─ Filter & search
   └─ Consultation details
```

**Week 17: Analytics Dashboard**
```
├─ KPIs
│  ├─ Total users
│  ├─ Active consultations
│  ├─ Revenue
│  └─ Average rating
│
├─ Charts
│  ├─ Revenue chart (monthly)
│  ├─ Users growth chart
│  └─ Consultations chart
│
└─ Reports
   ├─ Export to CSV/Excel
   └─ Custom date ranges
```

**Deliverables:**
- Работающая админ панель (Next.js)
- Верификация юристов
- Аналитика и отчеты

**Субагенты:**
- Frontend Dev Agent (Next.js admin panel)
- Backend Dev Agent (admin API endpoints)
- Analytics Agent (dashboard & charts)

---

### Phase 5: Landing Page (Неделя 18)

**Цель**: Лендинг для инвесторов

```
├─ Sections
│  ├─ Hero
│  ├─ Problem & Solution
│  ├─ Market Opportunity
│  ├─ Business Model
│  ├─ Team
│  └─ Investment Ask
│
├─ Design
│  ├─ Modern gradient design
│  ├─ Smooth animations (Framer Motion)
│  └─ Mobile responsive
│
└─ Deployment
   └─ Vercel deployment
```

**Deliverables:**
- Профессиональный лендинг для инвесторов
- Презентация для скачивания
- Форма связи

**Субагенты:**
- Frontend Dev Agent (Next.js landing)
- Content Agent (копирайтинг)
- Design Agent (визуальный дизайн)

---

### Phase 6: Advanced Features (Недели 19-22)

**Цель**: Расширенные функции

#### Week 19-20: Video Calls
```
├─ Backend
│  └─ Integration с Agora/Twilio
│
└─ Mobile
   ├─ Video call screen
   ├─ Camera/mic controls
   └─ Network quality indicator
```

#### Week 21: Notifications
```
├─ Backend
│  ├─ Notification Context implementation
│  ├─ Email notifications (Resend/SendGrid)
│  ├─ SMS notifications (Twilio)
│  └─ Push notifications (FCM)
│
└─ Mobile
   ├─ Push notification setup
   ├─ In-app notifications
   └─ Notification preferences
```

#### Week 22: Documents & Templates
```
├─ Backend
│  ├─ Document Context
│  ├─ Document upload/download
│  └─ Template system
│
└─ Mobile
   ├─ Document viewer
   ├─ Template selection
   └─ Document signing
```

**Deliverables:**
- Видео-звонки в консультациях
- Система уведомлений (Email, SMS, Push)
- Управление документами

**Субагенты:**
- Backend Dev Agent (advanced features)
- Mobile Dev Agent (UI implementation)
- Integration Agent (third-party services)

---

### Phase 7: Testing & Polish (Недели 23-24)

**Цель**: Тестирование, исправление багов, оптимизация

#### Week 23: QA & Bug Fixing
```
├─ Manual QA Testing
│  ├─ Full regression testing
│  ├─ Edge cases testing
│  └─ Device compatibility
│
├─ Bug Fixing
│  ├─ Critical bugs
│  ├─ High priority bugs
│  └─ Medium priority bugs
│
└─ Performance Optimization
   ├─ Backend API optimization
   ├─ Database query optimization
   └─ Mobile app performance
```

#### Week 24: Polish & Launch Prep
```
├─ UI/UX Polish
│  ├─ Animation refinements
│  ├─ Loading states
│  └─ Error messages
│
├─ Documentation
│  ├─ User guides
│  ├─ API documentation
│  └─ Deployment docs
│
└─ Launch Preparation
   ├─ Production environment setup
   ├─ Monitoring & alerts
   └─ Rollback plan
```

**Deliverables:**
- Полностью протестированное приложение
- Все критические баги исправлены
- Готовность к запуску

**Субагенты:**
- QA Agent (тестирование)
- Bug Fix Agent (исправления)
- Performance Agent (оптимизация)
- Documentation Agent (финальная документация)

---

### Timeline Summary

```
Phase 0: Подготовка                      [Недели 1-2]    ████
Phase 1: MVP Backend                     [Недели 3-6]    ████████
Phase 2: MVP Mobile App                  [Недели 7-10]   ████████
Phase 3: Consultation & Payment          [Недели 11-14]  ████████
Phase 4: Admin Panel                     [Недели 15-17]  ██████
Phase 5: Landing Page                    [Неделя 18]     ██
Phase 6: Advanced Features               [Недели 19-22]  ████████
Phase 7: Testing & Polish                [Недели 23-24]  ████
──────────────────────────────────────────────────────────────
Total: 24 недели (~6 месяцев)
```

---

## 11. КОМАНДА И РОЛИ

### 11.1 Структура команды

```
CEO/Founder
    │
    ├─── CTO
    │     │
    │     ├─── Tech Lead (Backend)
    │     │     ├─── Backend Developer #1
    │     │     ├─── Backend Developer #2
    │     │     └─── Backend Developer #3
    │     │
    │     ├─── Tech Lead (Mobile)
    │     │     ├─── Mobile Developer #1 (iOS)
    │     │     └─── Mobile Developer #2 (Android/Flutter)
    │     │
    │     ├─── Frontend Developer (Admin Panel & Landing)
    │     │
    │     └─── DevOps Engineer
    │
    ├─── Head of Product
    │     ├─── Product Manager
    │     ├─── UI/UX Designer
    │     └─── QA Engineer
    │
    ├─── Head of Legal/Compliance
    │     └─── Compliance Officer
    │
    └─── Head of Marketing
          └─── Content Manager
```

### 11.2 Роли и ответственности

#### CTO (Chief Technology Officer)
- Общее технологическое руководство
- Архитектурные решения
- Выбор технологического стека
- Управление техническим долгом
- Код ревью критических частей

#### Tech Lead (Backend)
- Разработка backend архитектуры (DDD)
- Код ревью backend кода
- Менторство backend разработчиков
- Интеграция с Supabase, платежными системами
- Performance оптимизация

#### Backend Developers
- Реализация bounded contexts
- Написание unit/integration тестов
- API разработка
- Database schema design
- Документация API

#### Tech Lead (Mobile)
- Разработка мобильной архитектуры (Clean Architecture)
- Код ревью мобильного кода
- Менторство mobile разработчиков
- Настройка CI/CD для мобильных приложений
- App Store/Google Play релизы

#### Mobile Developers
- Реализация UI/UX по дизайнам
- Написание widget/integration тестов
- Интеграция с backend API
- Оптимизация производительности
- Platform-specific features (iOS/Android)

#### Frontend Developer (Admin & Landing)
- Разработка админ панели (Next.js)
- Разработка лендинга для инвесторов
- Интеграция с backend API
- Responsive design
- SEO оптимизация

#### DevOps Engineer
- Настройка CI/CD pipelines
- Инфраструктура (серверы в РФ)
- Мониторинг и алерты
- Backup & disaster recovery
- Security & compliance

#### Product Manager
- Product roadmap
- Feature prioritization
- User stories & acceptance criteria
- Координация между командами
- Метрики продукта

#### UI/UX Designer
- User research
- Wireframes & prototypes
- High-fidelity designs (Figma)
- Design system
- Usability testing

#### QA Engineer
- Test planning
- Manual testing
- E2E test automation (Playwright)
- Bug tracking & reporting
- Regression testing

#### Compliance Officer
- Соблюдение 152-ФЗ (персональные данные)
- Адвокатская тайна
- Верификация юристов
- Юридическая консультация для команды
- Audit trails

#### Content Manager / Marketing
- Контент для лендинга
- Маркетинговые материалы
- SEO/SEM
- Social media
- Email campaigns

### 11.3 Минимальная команда для MVP

**Phase 1-2 (Недели 1-10):**
- 1 CTO/Tech Lead
- 2 Backend Developers
- 2 Mobile Developers
- 1 UI/UX Designer
- 1 QA Engineer
- 1 Product Manager

**Total: 8 человек**

**Phase 3-7 (Недели 11-24):**
- Добавить:
  - 1 Frontend Developer (Admin Panel)
  - 1 DevOps Engineer
  - 1 Compliance Officer

**Total: 11 человек**

### 11.4 Разделение работы по субагентам

Для эффективной параллельной разработки рекомендуется использовать следующих субагентов (AI-ассистентов):

#### Backend Субагенты
```
Backend Agent #1: Identity & Auth Context
  - Реализация User entity, Auth use cases
  - Интеграция Supabase Auth
  - JWT tokens

Backend Agent #2: Lawyer Management Context
  - Реализация Lawyer aggregate
  - Поиск и фильтрация юристов
  - Верификация юристов

Backend Agent #3: Consultation Context
  - Реализация Consultation aggregate
  - Бронирование и управление консультациями
  - Real-time messaging

Backend Agent #4: Payment Context
  - Реализация Payment aggregate
  - Интеграция ЮКасса
  - Subscription management
```

#### Mobile Субагенты
```
Mobile Agent #1: Auth & Onboarding
  - Ребрендинг Zer0 → Advocata
  - Auth screens (OTP flow)
  - Onboarding flow

Mobile Agent #2: Lawyer Features
  - Lawyer search & filters
  - Lawyer detail screen
  - Booking flow

Mobile Agent #3: Consultation Features
  - Active consultation screen
  - Chat implementation
  - Video call integration

Mobile Agent #4: Profile & Settings
  - User profile
  - Subscription management
  - Settings
```

#### Other Субагенты
```
Admin Agent: Admin Panel Development
  - Next.js admin panel
  - Lawyer verification UI
  - Analytics dashboard

Landing Agent: Landing Page
  - Next.js landing для инвесторов
  - Responsive design
  - Animations (Framer Motion)

Testing Agent: Test Coverage
  - Написание unit tests
  - Integration tests
  - E2E tests

Documentation Agent: Documentation
  - API documentation
  - Architecture docs
  - User guides

DevOps Agent: Infrastructure
  - CI/CD setup
  - Deployment
  - Monitoring
```

---

## 12. КЛЮЧЕВЫЕ МЕТРИКИ УСПЕХА

### 12.1 Development Metrics

| Метрика | Target |
|---------|--------|
| Code Coverage | 75-85% |
| Build Success Rate | >95% |
| Average PR Review Time | <24 hours |
| Critical Bugs in Production | <5 per month |
| API Response Time (p95) | <500ms |
| Mobile App Crash Rate | <1% |

### 12.2 Business Metrics

| Метрика | Месяц 1 | Месяц 6 | Месяц 12 |
|---------|---------|---------|----------|
| Активные пользователи | 500 | 2,500 | 8,000 |
| Юристы на платформе | 50 | 100 | 200 |
| Консультации/месяц | 100 | 800 | 2,500 |
| MRR | 300K ₽ | 2M ₽ | 8M ₽ |
| Churn Rate | <10% | <7% | <5% |
| NPS Score | 40+ | 50+ | 60+ |

---

## 13. РИСКИ И МИТИГАЦИЯ

### 13.1 Технические риски

#### Риск: Проблемы с локализацией данных
**Вероятность**: Средняя
**Влияние**: Критическое
**Митигация**:
- Использовать только российские серверы с самого начала
- Регулярный audit с compliance officer
- End-to-end шифрование
- Консультация с юристами по 152-ФЗ

#### Риск: Масштабирование базы данных
**Вероятность**: Средняя (при успехе)
**Влияние**: Высокое
**Митигация**:
- Использовать Supabase (auto-scaling)
- Database connection pooling
- Caching (Redis)
- Read replicas для аналитики

#### Риск: Integration failures (платежи, видео)
**Вероятность**: Высокая
**Влияние**: Среднее
**Митигация**:
- Retry mechanisms
- Fallback providers
- Comprehensive error handling
- Circuit breaker pattern

### 13.2 Бизнес риски

#### Риск: Низкое качество юристов
**Вероятность**: Средняя
**Влияние**: Критическое
**Митигация**:
- Строгая верификация
- Рейтинговая система
- Regular quality checks
- Быстрая реакция на жалобы

#### Риск: Высокий CAC
**Вероятность**: Высокая
**Влияние**: Критическое
**Митигация**:
- Content marketing
- Referral program
- Partnerships (автошколы, таксопарки)
- Organic growth через SEO

---

## 14. NEXT STEPS

### Immediate Actions (Week 1)

1. **Собрать команду**
   - Найм key positions (CTO, Tech Leads)
   - Onboarding процесс

2. **Setup инфраструктуры**
   - Создать Supabase instance (российские серверы)
   - Setup Git repositories
   - CI/CD pipeline

3. **Domain Modeling**
   - Event Storming session
   - Ubiquitous Language
   - Bounded Contexts mapping

4. **Fundraising**
   - Презентация для инвесторов
   - Встречи с потенциальными инвесторами
   - Term sheet negotiation

---

## 15. ЗАКЛЮЧЕНИЕ

Этот план представляет собой всеобъемлющую стратегию разработки платформы Advocata с использованием Domain-Driven Design, SOLID принципов, комплексного тестирования и документации.

**Ключевые преимущества подхода:**
- **DDD**: Четкое разделение бизнес-логики по bounded contexts
- **SOLID**: Поддерживаемый, расширяемый код
- **Test Coverage**: Высокое качество и уверенность в коде
- **Documentation**: Знания сохранены и доступны
- **Параллельная разработка**: Субагенты работают независимо

**Timeline**: 24 недели (~6 месяцев) до полноценного MVP с advanced features.

**Следующий шаг**: Начать Phase 0 (Подготовка) и собрать команду.

---

**Документ подготовлен**: 13 ноября 2025
**Версия**: 2.0 (Полная)
**Автор**: Claude (Opus 4.1)
**Для**: Advocata Platform Development
