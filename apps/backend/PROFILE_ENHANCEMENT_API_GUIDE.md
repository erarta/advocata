# Profile Enhancement API Implementation Guide

This guide provides the backend API structure for the Profile Enhancement features.

## API Endpoints

### 1. Saved Addresses

#### GET `/api/users/me/addresses`
Get all saved addresses for the current user.

**Response:**
```json
{
  "addresses": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "label": "home",
      "address": "ул. Ленина, 10, Москва",
      "latitude": 55.751244,
      "longitude": 37.618423,
      "is_default": true,
      "created_at": "2024-11-20T10:00:00Z",
      "updated_at": "2024-11-20T10:00:00Z"
    }
  ]
}
```

#### GET `/api/users/me/addresses/:id`
Get a specific address.

#### POST `/api/users/me/addresses`
Create a new address.

**Request Body:**
```json
{
  "label": "home",
  "address": "ул. Ленина, 10, Москва",
  "latitude": 55.751244,
  "longitude": 37.618423,
  "is_default": false
}
```

#### PUT `/api/users/me/addresses/:id`
Update an existing address.

**Request Body:** (all fields optional)
```json
{
  "label": "work",
  "address": "ул. Пушкина, 5, Москва",
  "latitude": 55.751244,
  "longitude": 37.618423,
  "is_default": true
}
```

#### DELETE `/api/users/me/addresses/:id`
Delete an address.

---

### 2. Emergency Contacts

#### GET `/api/users/me/emergency-contacts`
Get all emergency contacts.

**Response:**
```json
{
  "contacts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Иван Петров",
      "phone_number": "+79001234567",
      "relationship": "spouse",
      "created_at": "2024-11-20T10:00:00Z",
      "updated_at": "2024-11-20T10:00:00Z"
    }
  ]
}
```

#### GET `/api/users/me/emergency-contacts/:id`
Get a specific contact.

#### POST `/api/users/me/emergency-contacts`
Create a new emergency contact.

**Request Body:**
```json
{
  "name": "Иван Петров",
  "phone_number": "+79001234567",
  "relationship": "spouse"
}
```

#### PUT `/api/users/me/emergency-contacts/:id`
Update an emergency contact.

#### DELETE `/api/users/me/emergency-contacts/:id`
Delete an emergency contact.

---

### 3. Referral Program

#### GET `/api/users/me/referral`
Get referral information for the current user.

**Response:**
```json
{
  "user_id": "uuid",
  "referral_code": "ABC123XY",
  "total_invites": 5,
  "successful_invites": 3,
  "total_bonus_earned": 1500.00,
  "current_balance": 1500.00,
  "redemptions": [
    {
      "id": "uuid",
      "referee_id": "uuid",
      "referee_name": "Петр Сидоров",
      "bonus_amount": 500.00,
      "redeemed_at": "2024-11-15T10:00:00Z"
    }
  ],
  "created_at": "2024-11-01T10:00:00Z"
}
```

#### POST `/api/users/me/referral/redeem`
Redeem a referral code.

**Request Body:**
```json
{
  "code": "ABC123XY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Промокод успешно активирован",
  "bonus_amount": 500.00
}
```

---

### 4. App Settings

#### GET `/api/users/me/settings`
Get app settings.

**Response:**
```json
{
  "user_id": "uuid",
  "theme_mode": "system",
  "language": "ru",
  "notifications": {
    "pushEnabled": true,
    "smsEnabled": true,
    "emailEnabled": true,
    "consultationReminders": true,
    "paymentNotifications": true,
    "marketingNotifications": false
  },
  "biometric_enabled": false,
  "analytics_enabled": true,
  "crash_reporting_enabled": true,
  "updated_at": "2024-11-20T10:00:00Z"
}
```

#### PUT `/api/users/me/settings`
Update app settings.

**Request Body:** (all fields optional)
```json
{
  "theme_mode": "dark",
  "language": "en",
  "notifications": {
    "pushEnabled": false,
    "smsEnabled": true,
    "emailEnabled": true,
    "consultationReminders": true,
    "paymentNotifications": true,
    "marketingNotifications": false
  },
  "biometric_enabled": true,
  "analytics_enabled": false,
  "crash_reporting_enabled": true
}
```

---

## NestJS Implementation Structure

### Module Structure

```
src/modules/profile/
├── application/
│   ├── commands/
│   │   ├── add-address/
│   │   │   ├── add-address.command.ts
│   │   │   └── add-address.handler.ts
│   │   ├── update-address/
│   │   ├── delete-address/
│   │   ├── add-emergency-contact/
│   │   ├── update-emergency-contact/
│   │   ├── delete-emergency-contact/
│   │   ├── redeem-referral/
│   │   └── update-settings/
│   └── queries/
│       ├── get-addresses/
│       │   ├── get-addresses.query.ts
│       │   └── get-addresses.handler.ts
│       ├── get-address/
│       ├── get-emergency-contacts/
│       ├── get-emergency-contact/
│       ├── get-referral-info/
│       └── get-settings/
└── infrastructure/
    ├── controllers/
    │   ├── address.controller.ts
    │   ├── emergency-contact.controller.ts
    │   ├── referral.controller.ts
    │   └── settings.controller.ts
    └── persistence/
        ├── repositories/
        │   ├── address.repository.ts
        │   ├── emergency-contact.repository.ts
        │   ├── referral.repository.ts
        │   └── settings.repository.ts
        └── entities/
            ├── user-address.entity.ts
            ├── emergency-contact.entity.ts
            ├── referral-code.entity.ts
            ├── referral-redemption.entity.ts
            └── user-settings.entity.ts
```

### Example Controller Implementation

```typescript
// src/modules/profile/infrastructure/controllers/address.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { GetAddressesQuery } from '../../application/queries/get-addresses/get-addresses.query';
import { AddAddressCommand } from '../../application/commands/add-address/add-address.command';
import { UpdateAddressCommand } from '../../application/commands/update-address/update-address.command';
import { DeleteAddressCommand } from '../../application/commands/delete-address/delete-address.command';

@Controller('users/me/addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAddresses(@CurrentUser() user: any) {
    return this.queryBus.execute(new GetAddressesQuery(user.id));
  }

  @Get(':id')
  async getAddress(@Param('id') id: string, @CurrentUser() user: any) {
    return this.queryBus.execute(new GetAddressQuery(id, user.id));
  }

  @Post()
  async addAddress(@Body() dto: AddAddressDto, @CurrentUser() user: any) {
    return this.commandBus.execute(
      new AddAddressCommand(
        user.id,
        dto.label,
        dto.address,
        dto.latitude,
        dto.longitude,
        dto.is_default,
      ),
    );
  }

  @Put(':id')
  async updateAddress(
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
    @CurrentUser() user: any,
  ) {
    return this.commandBus.execute(
      new UpdateAddressCommand(id, user.id, dto),
    );
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commandBus.execute(new DeleteAddressCommand(id, user.id));
  }
}
```

### Example Command Handler

```typescript
// src/modules/profile/application/commands/add-address/add-address.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddAddressCommand } from './add-address.command';
import { AddressRepository } from '../../infrastructure/persistence/repositories/address.repository';
import { UserAddress } from '../../domain/entities/user-address.entity';

@CommandHandler(AddAddressCommand)
export class AddAddressHandler implements ICommandHandler<AddAddressCommand> {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(command: AddAddressCommand): Promise<UserAddress> {
    const { userId, label, address, latitude, longitude, isDefault } = command;

    // If setting as default, unset other defaults
    if (isDefault) {
      await this.addressRepository.unsetDefaultAddresses(userId);
    }

    // Create new address
    const newAddress = UserAddress.create({
      userId,
      label,
      address,
      latitude,
      longitude,
      isDefault,
    });

    return this.addressRepository.save(newAddress);
  }
}
```

### Example Query Handler

```typescript
// src/modules/profile/application/queries/get-addresses/get-addresses.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAddressesQuery } from './get-addresses.query';
import { AddressRepository } from '../../infrastructure/persistence/repositories/address.repository';
import { UserAddress } from '../../domain/entities/user-address.entity';

@QueryHandler(GetAddressesQuery)
export class GetAddressesHandler implements IQueryHandler<GetAddressesQuery> {
  constructor(private readonly addressRepository: AddressRepository) {}

  async execute(query: GetAddressesQuery): Promise<UserAddress[]> {
    return this.addressRepository.findByUserId(query.userId);
  }
}
```

## Security Considerations

1. **Authentication**: All endpoints require JWT authentication
2. **Authorization**: Users can only access their own data
3. **Validation**:
   - Phone numbers must be validated
   - Coordinates must be valid lat/long
   - Referral codes are alphanumeric only
4. **Rate Limiting**: Apply rate limiting to prevent abuse
5. **Data Sanitization**: Sanitize all user inputs

## Error Handling

```typescript
// Example error responses
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "phone_number": "Invalid phone number format"
  }
}

{
  "statusCode": 404,
  "message": "Address not found"
}

{
  "statusCode": 409,
  "message": "Referral code already redeemed"
}
```

## Testing

1. **Unit Tests**: Test individual handlers and services
2. **Integration Tests**: Test API endpoints with real database
3. **E2E Tests**: Test complete user flows

---

For complete implementation, create the corresponding:
1. DTOs (Data Transfer Objects)
2. Domain entities with business logic
3. Repository implementations
4. Event handlers for domain events
5. Integration tests

Refer to existing modules in the codebase for implementation patterns.
