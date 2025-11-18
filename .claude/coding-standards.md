# Coding Standards

## Backend (TypeScript/NestJS)

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### ESLint Rules

```json
// .eslintrc.json
{
  "extends": [
    "@nestjs",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "max-lines-per-function": ["warn", 50],
    "complexity": ["warn", 10]
  }
}
```

### Naming Conventions

```typescript
// Classes: PascalCase
class UserRepository { }
class RegisterUserUseCase { }

// Interfaces: PascalCase with I prefix
interface IUserRepository { }
interface IEmailService { }

// Functions/Methods: camelCase
async findById(id: string): Promise<User> { }
calculateTotalPrice(): Money { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 20;

// Private members: camelCase with _ prefix
private _status: UserStatus;
private _domainEvents: DomainEvent[] = [];

// Type aliases: PascalCase
type UserId = string;
type LawyerStatus = 'pending' | 'active' | 'suspended';
```

### File Naming

```
// Domain entities
user.entity.ts
lawyer.entity.ts

// Value objects
email.vo.ts
money.vo.ts

// Use cases
register-user.use-case.ts
verify-lawyer.use-case.ts

// Repositories
user.repository.interface.ts
user.repository.ts

// Controllers
user.controller.ts
auth.controller.ts

// DTOs
register-user.dto.ts
create-lawyer.dto.ts

// Tests
user.entity.spec.ts
register-user.use-case.spec.ts
user.controller.integration.spec.ts
```

### Code Organization

```typescript
// 1. Imports (grouped and sorted)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@/modules/identity/domain/entities/user.entity';
import { IUserRepository } from '@/modules/identity/domain/repositories/user.repository.interface';

// 2. Decorators
@Injectable()
export class UserService {
  // 3. Constructor
  constructor(
    @InjectRepository(User)
    private readonly userRepository: IUserRepository,
  ) {}

  // 4. Public methods
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  // 5. Private methods
  private validateUser(user: User): boolean {
    return user.status === UserStatus.Active;
  }
}
```

### Function Structure

```typescript
async function bookConsultation(
  command: BookConsultationCommand
): Promise<Result<ConsultationDTO>> {
  // 1. Validate input
  if (!command.lawyerId || !command.scheduledTime) {
    return Result.fail('Missing required fields');
  }

  // 2. Load entities
  const lawyer = await this.lawyerRepository.findById(command.lawyerId);
  if (!lawyer) {
    return Result.fail('Lawyer not found');
  }

  // 3. Check business rules
  const availabilityCheck = await this.availabilityService.checkAvailability(
    lawyer.id,
    command.scheduledTime
  );
  if (availabilityCheck.isFailure) {
    return Result.fail(availabilityCheck.error);
  }

  // 4. Create entity
  const consultationOrError = Consultation.create({
    clientId: command.clientId,
    lawyerId: lawyer.id,
    scheduledTime: command.scheduledTime,
  });

  if (consultationOrError.isFailure) {
    return Result.fail(consultationOrError.error);
  }

  const consultation = consultationOrError.getValue();

  // 5. Persist
  await this.consultationRepository.save(consultation);

  // 6. Publish events
  await this.eventBus.publishAll(consultation.domainEvents);

  // 7. Return DTO
  return Result.ok(ConsultationMapper.toDTO(consultation));
}
```

### Error Handling

```typescript
// Use Result pattern, not exceptions for business logic
class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: string
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result<T>(true, value);
  }

  static fail<T>(error: string): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }

  getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this.value!;
  }
}

// Usage
const userOrError = User.create(props);
if (userOrError.isFailure) {
  return Result.fail(userOrError.error);
}

const user = userOrError.getValue();
```

### Comments & Documentation

```typescript
/**
 * Verifies a lawyer by checking their credentials against external registries.
 *
 * This use case performs the following steps:
 * 1. Validates the lawyer exists and is pending verification
 * 2. Checks bar license with Ministry of Justice registry
 * 3. Validates education documents
 * 4. Updates lawyer status to active if all checks pass
 * 5. Publishes LawyerVerifiedEvent
 *
 * @param command - Contains lawyer ID and verification documents
 * @returns Result indicating success or failure with error message
 *
 * @throws {LawyerNotFoundException} When lawyer ID is invalid
 * @throws {InvalidLicenseException} When bar license check fails
 *
 * @example
 * ```typescript
 * const result = await verifyLawyer.execute({
 *   lawyerId: '123',
 *   barLicenseNumber: '456',
 *   diplomaDocument: 'url',
 * });
 * ```
 */
async execute(command: VerifyLawyerCommand): Promise<Result<void>> {
  // Implementation
}

// Inline comments for complex logic only
// Calculate price with discount if subscription is active
const price = subscription?.isActive
  ? lawyer.hourlyRate.applyDiscount(0.2)
  : lawyer.hourlyRate;
```

---

## Mobile (Dart/Flutter)

### Analysis Options

```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  strong-mode:
    implicit-casts: false
    implicit-dynamic: false
  errors:
    missing_required_param: error
    missing_return: error
    todo: ignore

linter:
  rules:
    - prefer_const_constructors
    - prefer_const_declarations
    - avoid_print
    - prefer_single_quotes
    - always_declare_return_types
    - require_trailing_commas
    - sort_child_properties_last
```

### Naming Conventions

```dart
// Classes: PascalCase
class Lawyer { }
class LawyerRepository { }

// Functions/Methods: camelCase
Future<List<Lawyer>> searchLawyers() async { }
Money calculatePrice() { }

// Constants: lowerCamelCase
const primaryColor = Color(0xFF2563EB);
const maxRetryAttempts = 3;

// Private: _ prefix
String _userId;
void _validateInput() { }

// Files: snake_case
lawyer_repository.dart
search_lawyers_query.dart
```

### File Naming

```
// Entities
lawyer.dart
consultation.dart

// Repositories
lawyer_repository.dart
consultation_repository.dart

// Providers
auth_provider.dart
lawyer_search_provider.dart

// Screens
lawyers_list_screen.dart
lawyer_detail_screen.dart

// Widgets
lawyer_card.dart
primary_button.dart

// Tests
lawyer_test.dart
lawyer_card_test.dart
lawyers_list_screen_test.dart
```

### Code Organization

```dart
// 1. Imports (grouped)
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:advocata/core/theme/app_colors.dart';
import 'package:advocata/features/lawyer/domain/entities/lawyer.dart';

// 2. Class definition
class LawyerCard extends StatelessWidget {
  // 3. Constructor
  const LawyerCard({
    Key? key,
    required this.lawyer,
    required this.onTap,
  }) : super(key: key);

  // 4. Properties
  final Lawyer lawyer;
  final VoidCallback onTap;

  // 5. Build method
  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: _buildContent(),
      ),
    );
  }

  // 6. Private methods
  Widget _buildContent() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildHeader(),
          _buildBody(),
        ],
      ),
    );
  }
}
```

### Widget Structure

```dart
class LawyersListScreen extends ConsumerWidget {
  const LawyersListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lawyersAsync = ref.watch(lawyerSearchProvider);

    return Scaffold(
      appBar: _buildAppBar(),
      body: lawyersAsync.when(
        data: (lawyers) => _buildList(lawyers),
        loading: () => _buildLoading(),
        error: (error, stack) => _buildError(error),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: const Text('Найти юриста'),
      actions: [
        IconButton(
          icon: const Icon(Icons.filter_list),
          onPressed: () => _showFilters(),
        ),
      ],
    );
  }

  Widget _buildList(List<Lawyer> lawyers) {
    if (lawyers.isEmpty) {
      return _buildEmptyState();
    }

    return ListView.builder(
      itemCount: lawyers.length,
      itemBuilder: (context, index) {
        return LawyerCard(
          lawyer: lawyers[index],
          onTap: () => _onLawyerTap(lawyers[index]),
        );
      },
    );
  }
}
```

### State Management (Riverpod)

```dart
// Provider definition
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

// Usage in widget
final lawyers = ref.watch(
  lawyerSearchProvider(
    specializations: ['ДТП'],
    city: 'Санкт-Петербург',
  ),
);
```

### Error Handling

```dart
// Use Either from dartz
import 'package:dartz/dartz.dart';

abstract class LawyerRepository {
  Future<Either<Failure, List<Lawyer>>> searchLawyers({
    required List<String> specializations,
  });
}

// Implementation
class LawyerRepositoryImpl implements LawyerRepository {
  @override
  Future<Either<Failure, List<Lawyer>>> searchLawyers({
    required List<String> specializations,
  }) async {
    try {
      final response = await _remoteDataSource.searchLawyers(specializations);
      final lawyers = response.map((m) => m.toDomain()).toList();
      return Right(lawyers);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on NetworkException {
      return Left(NetworkFailure('No internet connection'));
    }
  }
}
```

### Comments & Documentation

```dart
/// Searches for lawyers based on filters.
///
/// Returns a list of lawyers matching the [specializations], [city],
/// and [maxHourlyRate] filters. Results are paginated with [limit] items per page.
///
/// Throws [ServerException] if the API call fails.
/// Throws [NetworkException] if there's no internet connection.
///
/// Example:
/// ```dart
/// final lawyers = await repository.searchLawyers(
///   specializations: ['ДТП', 'Уголовное право'],
///   city: 'Санкт-Петербург',
///   maxHourlyRate: Money(3000, 'RUB'),
/// );
/// ```
Future<Either<Failure, List<Lawyer>>> searchLawyers({
  required List<String> specializations,
  String? city,
  Money? maxHourlyRate,
  int limit = 20,
});
```

---

## General Best Practices

### DRY (Don't Repeat Yourself)

```typescript
// BAD
async function createUser(email: string, name: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email');
  }
  // ...
}

async function updateUser(userId: string, email: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email');
  }
  // ...
}

// GOOD
class Email extends ValueObject {
  static create(value: string): Result<Email> {
    if (!value || !value.includes('@')) {
      return Result.fail('Invalid email');
    }
    return Result.ok(new Email(value));
  }
}

async function createUser(email: Email, name: string) { }
async function updateUser(userId: string, email: Email) { }
```

### KISS (Keep It Simple, Stupid)

```typescript
// BAD - Over-engineered
class UserFactory {
  private builder: UserBuilder;

  constructor() {
    this.builder = new UserBuilder();
  }

  createUserWithDefaultSettings(email: string): User {
    return this.builder
      .withEmail(email)
      .withDefaultRole()
      .withDefaultStatus()
      .withCurrentTimestamp()
      .build();
  }
}

// GOOD - Simple
class User {
  static create(email: Email): Result<User> {
    return Result.ok(new User(
      UserId.generate(),
      email,
      UserRole.Client,
      UserStatus.Pending,
      new Date(),
    ));
  }
}
```

### YAGNI (You Aren't Gonna Need It)

```typescript
// BAD - Features you don't need yet
class Lawyer {
  // Current needs
  verify() { }
  updateAvailability() { }

  // Future features - DON'T ADD YET
  certifySpecialization() { }
  joinConference() { }
  exportStatistics() { }
}

// GOOD - Only what you need now
class Lawyer {
  verify() { }
  updateAvailability() { }
}

// Add other methods when actually needed
```

---

## Code Review Standards

### What to Look For

1. **Correctness**: Does the code work as expected?
2. **Design**: Is the code well-designed? DDD/SOLID principles?
3. **Complexity**: Is it too complex? Can it be simplified?
4. **Tests**: Are there tests? Do they cover edge cases?
5. **Naming**: Are names clear and descriptive?
6. **Comments**: Are complex parts documented?
7. **Style**: Does it follow style guide?
8. **Security**: Any vulnerabilities?

### Example Review Comments

```typescript
// ❌ Poor
class UserService {
  async getData(id: string) { // Vague name
    const u = await this.repo.find(id); // Single letter variable
    if (!u) throw new Error('not found'); // Generic error
    return u;
  }
}

// Review: "Consider renaming getData to getUserById, use descriptive
// variable names, and return Result instead of throwing"

// ✅ Good
class UserService {
  async getUserById(userId: UserId): Promise<Result<User>> {
    const user = await this.repository.findById(userId);
    if (!user) {
      return Result.fail('User not found');
    }
    return Result.ok(user);
  }
}
```

---

## Performance Guidelines

### Database Queries

```typescript
// BAD - N+1 query problem
async function getLawyersWithReviews() {
  const lawyers = await db.from('lawyers').select();

  for (const lawyer of lawyers) {
    lawyer.reviews = await db
      .from('reviews')
      .select()
      .eq('lawyer_id', lawyer.id); // N queries
  }

  return lawyers;
}

// GOOD - Join query
async function getLawyersWithReviews() {
  return await db
    .from('lawyers')
    .select(`
      *,
      reviews:lawyer_reviews(*)
    `);
}
```

### Caching

```typescript
// Use Redis for hot data
@Injectable()
export class LawyerService {
  async findById(id: LawyerId): Promise<Lawyer | null> {
    // Try cache first
    const cached = await this.redis.get(`lawyer:${id.value}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from DB
    const lawyer = await this.repository.findById(id);
    if (lawyer) {
      // Cache for 5 minutes
      await this.redis.setex(
        `lawyer:${id.value}`,
        300,
        JSON.stringify(lawyer)
      );
    }

    return lawyer;
  }
}
```

### Pagination

```typescript
// Always paginate large lists
interface PaginationParams {
  page: number;
  pageSize: number; // Max 100
}

async function searchLawyers(
  filters: SearchFilters,
  pagination: PaginationParams
): Promise<PaginatedResult<Lawyer>> {
  const { page, pageSize } = pagination;
  const limit = Math.min(pageSize, 100); // Cap at 100
  const offset = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.repository.search(filters, limit, offset),
    this.repository.count(filters),
  ]);

  return {
    items,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

---

**Last Updated:** November 13, 2025
