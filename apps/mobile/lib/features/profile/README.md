# Profile Feature - Advocata Mobile App

## Overview

The Profile feature provides comprehensive user profile management including personal information, saved addresses, emergency contacts, referral program, and app settings.

---

## Features

### 1. User Profile
- View and edit personal information
- Avatar management
- Profile completion tracking
- Account security settings

### 2. Saved Addresses
- Save frequently used locations
- Set default address for emergency calls
- Address types: Home, Work, Custom
- Integration with Yandex Maps
- CRUD operations

### 3. Emergency Contacts
- Manage trusted contacts for emergencies
- Relationship types (Spouse, Parent, Friend, etc.)
- Quick call functionality
- Automatic notifications during emergency lawyer calls

### 4. Referral Program
- Unique referral code per user
- Share code via social media, messaging apps
- Track successful referrals and bonuses
- Redemption history
- 500₽ bonus per successful referral

### 5. App Settings
- **Appearance**: Theme (Light/Dark/System), Language
- **Notifications**: Push, SMS, Email preferences
- **Security**: Biometric authentication
- **Privacy**: Analytics, crash reporting controls
- **Storage**: Cache management

---

## Architecture

### Layer Structure

```
presentation/ (UI)
    ↓
application/ (State Management)
    ↓
domain/ (Business Logic)
    ↓
data/ (Data Access)
    ↓
infrastructure/ (External Services)
```

### Key Principles

1. **Clean Architecture**: Separation of concerns
2. **Dependency Injection**: Using Riverpod providers
3. **Immutability**: Entities use const constructors
4. **Type Safety**: Strong typing throughout
5. **Error Handling**: Result pattern for operations

---

## File Organization

### Domain Layer (`domain/`)

Contains business logic and entities.

**Entities:**
- `user_profile_entity.dart` - User profile data
- `saved_address.entity.dart` - Saved location
- `emergency_contact.entity.dart` - Emergency contact
- `referral_info.entity.dart` - Referral information
- `app_settings.entity.dart` - App preferences

**Repositories (Interfaces):**
- Abstract repository interfaces defining contracts

### Data Layer (`data/`)

Handles data operations and API communication.

**Models:**
- JSON serializable models for API communication
- Conversion methods: `toEntity()`, `fromEntity()`
- Generated code using `json_annotation`

**Datasources:**
- `profile_remote_datasource.dart` - Basic profile operations
- `profile_enhanced_remote_datasource.dart` - Enhanced features

**Repositories (Implementations):**
- Implement domain repository interfaces
- Error handling with Result pattern
- Exception mapping to Failures

### Application Layer (`application/`)

State management using Riverpod.

**Providers:**
- `address_providers.dart` - Address state management
- `emergency_contact_providers.dart` - Contact management
- `referral_providers.dart` - Referral operations
- `settings_providers.dart` - Settings management

### Presentation Layer (`presentation/`)

UI components and screens.

**Screens:**
- Profile management screens
- CRUD screens for each feature
- Settings and configuration screens

**Widgets:**
- Reusable card components
- Form inputs
- Display widgets

---

## Usage Examples

### 1. Load User Addresses

```dart
// In a ConsumerWidget
final addressesAsync = ref.watch(addressesProvider);

return addressesAsync.when(
  data: (addresses) => ListView.builder(
    itemCount: addresses.length,
    itemBuilder: (context, index) => AddressCard(
      address: addresses[index],
    ),
  ),
  loading: () => CircularProgressIndicator(),
  error: (error, stack) => ErrorWidget(error),
);
```

### 2. Add New Address

```dart
final success = await ref
    .read(addressOperationsProvider.notifier)
    .addAddress(
      label: 'home',
      address: 'ул. Ленина, 10, Москва',
      latitude: 55.751244,
      longitude: 37.618423,
      isDefault: true,
    );

if (success) {
  // Address added successfully
  // Provider automatically refreshes address list
}
```

### 3. Share Referral Code

```dart
final referralInfo = ref.watch(referralInfoProvider);

referralInfo.when(
  data: (info) {
    // Share using share_plus package
    Share.share(info.shareText);
  },
  loading: () => {},
  error: (_, __) => {},
);
```

### 4. Update Settings

```dart
await ref
    .read(settingsOperationsProvider.notifier)
    .updateThemeMode(ThemeMode.dark);

// Settings automatically refresh
```

---

## State Management Pattern

### Provider Types

1. **FutureProvider**: For async data fetching
   ```dart
   final addressesProvider = FutureProvider<List<SavedAddressEntity>>((ref) async {
     // Fetch data
   });
   ```

2. **StateNotifierProvider**: For mutable state with operations
   ```dart
   final addressOperationsProvider =
       StateNotifierProvider<AddressOperationsNotifier, AsyncValue<void>>((ref) {
     return AddressOperationsNotifier(ref.watch(addressRepositoryProvider), ref);
   });
   ```

### State Invalidation

After mutations, providers are invalidated to trigger refresh:

```dart
ref.invalidate(addressesProvider); // Refresh addresses
```

---

## Error Handling

### Result Pattern

All repository methods return `Result<T>`:

```dart
final result = await repository.addAddress(...);

result.fold(
  onSuccess: (address) {
    // Handle success
  },
  onFailure: (failure) {
    // Handle error
    print(failure.message);
  },
);
```

### Failure Types

- `AuthenticationFailure` - User not authenticated
- `ValidationFailure` - Invalid input data
- `ServerFailure` - Server error
- `NetworkFailure` - Network connectivity issue
- `UnknownFailure` - Unexpected error

---

## Data Models

### JSON Serialization

Models use `json_annotation` for serialization:

```dart
@JsonSerializable()
class SavedAddressModel {
  @JsonKey(name: 'user_id')
  final String userId;

  // ...

  factory SavedAddressModel.fromJson(Map<String, dynamic> json) =>
      _$SavedAddressModelFromJson(json);

  Map<String, dynamic> toJson() => _$SavedAddressModelToJson(this);
}
```

### Code Generation

Run to generate serialization code:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## Navigation

### Routes

All profile routes are defined in `/lib/config/router_config.dart`:

```dart
// Main profile
'/profile' → ProfileScreen

// Addresses
'/profile/addresses' → SavedAddressesScreen
'/profile/addresses/add' → AddAddressScreen
'/profile/addresses/edit/:id' → AddAddressScreen (edit mode)

// Emergency contacts
'/profile/emergency-contacts' → EmergencyContactsScreen
'/profile/emergency-contacts/add' → AddEmergencyContactScreen
'/profile/emergency-contacts/edit/:id' → AddEmergencyContactScreen (edit mode)

// Referral
'/profile/referral' → ReferralScreen

// Settings
'/profile/settings' → AppSettingsScreen
```

### Navigation Examples

```dart
// Go to addresses
context.push('/profile/addresses');

// Edit address
context.push('/profile/addresses/edit/${address.id}');

// Go back
context.pop();
```

---

## Backend Integration

### API Endpoints

**Addresses:**
- `GET /api/users/me/addresses` - List all
- `POST /api/users/me/addresses` - Create
- `PUT /api/users/me/addresses/:id` - Update
- `DELETE /api/users/me/addresses/:id` - Delete

**Emergency Contacts:**
- `GET /api/users/me/emergency-contacts` - List all
- `POST /api/users/me/emergency-contacts` - Create
- `PUT /api/users/me/emergency-contacts/:id` - Update
- `DELETE /api/users/me/emergency-contacts/:id` - Delete

**Referral:**
- `GET /api/users/me/referral` - Get referral info
- `POST /api/users/me/referral/redeem` - Redeem code

**Settings:**
- `GET /api/users/me/settings` - Get settings
- `PUT /api/users/me/settings` - Update settings

### Authentication

All requests require JWT token:

```dart
final supabaseClient = SupabaseConfig.client;
final user = supabaseClient.auth.currentUser; // Contains JWT
```

---

## Testing

### Unit Tests (To Be Implemented)

Test domain entities and business logic:

```dart
test('SavedAddressEntity displays correct label', () {
  final address = SavedAddressEntity(
    id: '1',
    userId: '1',
    label: 'home',
    // ...
  );

  expect(address.displayLabel, 'Дом');
});
```

### Widget Tests

Test UI components:

```dart
testWidgets('AddressCard displays address information', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: AddressCard(address: mockAddress),
    ),
  );

  expect(find.text('Дом'), findsOneWidget);
});
```

---

## Troubleshooting

### Common Issues

**Issue: Providers not updating**
```dart
// Solution: Invalidate provider
ref.invalidate(addressesProvider);
```

**Issue: Model serialization errors**
```bash
# Solution: Regenerate code
flutter pub run build_runner build --delete-conflicting-outputs
```

**Issue: Navigation not working**
```dart
// Ensure router is properly configured
// Check route paths match exactly
```

---

## Dependencies

```yaml
dependencies:
  flutter_riverpod: ^2.4.0
  go_router: ^12.0.0
  supabase_flutter: ^2.0.0
  json_annotation: ^4.8.0
  equatable: ^2.0.5
  share_plus: ^7.2.0
  url_launcher: ^6.2.0
  intl: ^0.18.0

dev_dependencies:
  build_runner: ^2.4.0
  json_serializable: ^6.7.0
```

---

## Contributing

When adding new features to the Profile module:

1. Start with domain entities
2. Create models and repositories
3. Implement providers
4. Build UI screens and widgets
5. Update router configuration
6. Add tests
7. Update documentation

---

## License

Proprietary - Advocata Platform

---

**Maintained by**: Advocata Development Team
**Last Updated**: November 20, 2024
