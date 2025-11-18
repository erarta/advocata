# Emergency Call Feature Documentation

## Overview

The **Emergency Call Feature** enables users to request immediate legal assistance by selecting their location on a Yandex Map. The system finds nearby available lawyers and connects them with the user for emergency consultations.

This feature is designed to work like Uber - users can:
1. Select their location on a map (or use current location)
2. See nearby available lawyers
3. Request emergency legal assistance with one tap
4. Get connected with the nearest available lawyer

## Architecture

### Mobile App (Flutter)

#### Technology Stack
- **Flutter**: Mobile UI framework
- **Yandex MapKit**: Maps SDK (replacing Google Maps for Russia compliance)
- **Riverpod**: State management
- **Geolocator**: Location services
- **Geocoding**: Address lookups
- **Dio**: HTTP client for API calls
- **Supabase**: Real-time updates

#### Module Structure

```
lib/features/emergency_call/
├── domain/                      # Business logic & interfaces
│   ├── entities/
│   │   ├── emergency_call.entity.dart    # Emergency call domain model
│   │   └── location.entity.dart          # Location domain model
│   └── repositories/
│       ├── emergency_call_repository.dart
│       └── geocoding_repository.dart
│
├── data/                        # Data access & API integration
│   ├── models/
│   │   ├── emergency_call.model.dart
│   │   └── location.model.dart
│   ├── datasources/
│   │   ├── emergency_call_remote_datasource.dart
│   │   └── geocoding_datasource.dart
│   └── repositories/
│       ├── emergency_call_repository_impl.dart
│       └── geocoding_repository_impl.dart
│
├── application/                 # State management
│   └── providers/
│       ├── emergency_call_providers.dart
│       └── location_provider.dart
│
└── presentation/                # UI components
    ├── screens/
    │   └── emergency_call_screen.dart
    └── widgets/
        ├── map_widget.dart
        ├── location_search_bar.dart
        ├── location_picker_bottom_sheet.dart
        └── emergency_call_button.dart
```

#### Key Components

**1. EmergencyCallScreen** (`emergency_call_screen.dart`)
- Full-screen Yandex Map
- Location permission handling
- Search bar for address input
- Emergency call button
- Bottom sheet for call confirmation

**2. MapWidget** (`map_widget.dart`)
- Yandex Map integration
- User location marker (blue dot)
- Selected location marker (red pin)
- Nearby lawyers markers (clusters)
- Map controls (zoom, compass, current location)

**3. LocationSearchBar** (`location_search_bar.dart`)
- Address autocomplete
- Geocoding integration
- Search history

**4. LocationPickerBottomSheet** (`location_picker_bottom_sheet.dart`)
- Address confirmation
- Nearby lawyers count
- Emergency call button
- Cancel option

#### State Management

**Riverpod Providers:**

```dart
// Location providers
final currentLocationProvider        // User's current location
final selectedLocationProvider       // Selected location on map
final mapStateProvider              // Map camera & zoom state

// Emergency call providers
final emergencyCallNotifierProvider  // Emergency call state
final nearbyLawyersProvider         // Lawyers near location
final createEmergencyCallProvider   // Create call action
final watchEmergencyCallProvider    // Real-time call updates
```

### Backend API (NestJS)

#### Technology Stack
- **NestJS**: Node.js framework
- **TypeORM**: ORM for PostgreSQL
- **PostGIS**: Geospatial database extension
- **CQRS**: Command Query Responsibility Segregation
- **Swagger**: API documentation

#### Module Structure

```
src/modules/emergency-call/
├── domain/                      # Core business logic
│   ├── entities/
│   │   └── emergency-call.entity.ts
│   ├── value-objects/
│   │   ├── location.vo.ts
│   │   └── call-status.vo.ts
│   └── repositories/
│       └── emergency-call.repository.interface.ts
│
├── application/                 # Use cases (CQRS)
│   ├── commands/
│   │   ├── create-emergency-call/
│   │   ├── accept-emergency-call/
│   │   └── complete-emergency-call/
│   └── queries/
│       ├── get-emergency-call/
│       ├── get-user-emergency-calls/
│       └── find-nearby-lawyers/
│
├── infrastructure/              # Technical implementation
│   ├── persistence/
│   │   ├── emergency-call.orm-entity.ts
│   │   ├── emergency-call.mapper.ts
│   │   └── emergency-call.repository.ts
│   └── services/
│       └── yandex-geocoder.client.ts
│
└── presentation/                # API layer
    ├── controllers/
    │   └── emergency-call.controller.ts
    └── dtos/
        ├── create-emergency-call.dto.ts
        └── emergency-call-response.dto.ts
```

#### Database Schema

**emergency_calls table:**

```sql
CREATE TABLE emergency_calls (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  lawyer_id             UUID REFERENCES lawyers(id),
  location              GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS
  latitude              DOUBLE PRECISION NOT NULL,
  longitude             DOUBLE PRECISION NOT NULL,
  address               TEXT NOT NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes                 TEXT,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  accepted_at           TIMESTAMP WITH TIME ZONE,
  completed_at          TIMESTAMP WITH TIME ZONE,
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Spatial index for nearby queries
CREATE INDEX idx_emergency_calls_location ON emergency_calls USING GIST(location);

-- Status index for filtering
CREATE INDEX idx_emergency_calls_status ON emergency_calls(status);

-- User/Lawyer indexes
CREATE INDEX idx_emergency_calls_user_id ON emergency_calls(user_id);
CREATE INDEX idx_emergency_calls_lawyer_id ON emergency_calls(lawyer_id);
```

**PostGIS Query for Nearby Lawyers:**

```sql
SELECT
  l.id as lawyer_id,
  ST_Distance(
    l.last_known_location,
    ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326)::geography
  ) as distance
FROM lawyers l
WHERE
  l.is_available = true
  AND l.status = 'active'
  AND ST_DWithin(
    l.last_known_location,
    ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326)::geography,
    10000  -- 10km radius
  )
ORDER BY distance
LIMIT 20;
```

#### API Endpoints

**POST /api/v1/emergency-calls**
- Creates new emergency call
- Request body:
  ```json
  {
    "userId": "uuid",
    "latitude": 59.9311,
    "longitude": 30.3609,
    "address": "Nevsky Prospect, 1, St. Petersburg",
    "notes": "Car accident, need immediate help"
  }
  ```

**GET /api/v1/emergency-calls/:id**
- Gets emergency call by ID

**GET /api/v1/emergency-calls/user/:userId**
- Gets all calls for user

**GET /api/v1/emergency-calls/nearby-lawyers?lat=X&lng=Y&radius=10000**
- Finds nearby lawyers within radius

**POST /api/v1/emergency-calls/:id/accept**
- Lawyer accepts call

**POST /api/v1/emergency-calls/:id/complete**
- Completes call

## User Flow

### Client Flow

1. **Open Emergency Call Screen**
   - User taps "Emergency Call" button on home screen
   - App requests location permission if not granted

2. **Location Permission**
   - System prompts for location access
   - If denied, show manual address input
   - If granted, get current location

3. **Map Display**
   - Show Yandex Map with current location
   - Display nearby lawyers as markers
   - User can drag map or search address

4. **Select Location**
   - User taps on map OR enters address in search bar
   - Map updates with selected location marker
   - Show address in bottom sheet

5. **View Nearby Lawyers**
   - System queries nearby lawyers (10km radius)
   - Display count: "5 lawyers nearby"
   - Show lawyer markers on map

6. **Create Emergency Call**
   - User taps "Emergency Call" button
   - Confirm location in bottom sheet
   - Send request to backend
   - Show success message

7. **Wait for Lawyer**
   - Display "Searching for lawyer..." state
   - Show real-time updates via WebSocket
   - Notify when lawyer accepts

### Lawyer Flow

1. **Receive Notification**
   - Push notification for nearby emergency call
   - Show call details (location, distance, user info)

2. **Accept Call**
   - Lawyer taps "Accept" button
   - System updates call status to "accepted"
   - User receives notification

3. **Navigate to Location**
   - Open navigation to emergency location
   - Real-time location tracking

4. **Complete Call**
   - Mark call as completed after consultation
   - System creates payment record

## Testing

### Mobile Tests

Location: `/apps/mobile/test/features/emergency_call/`

**Unit Tests:**
- `emergency_call_entity_test.dart` - Domain entity tests
- `location_entity_test.dart` - Location entity tests

**Widget Tests:**
- Map widget tests
- Search bar tests
- Bottom sheet tests

**Integration Tests:**
- Full emergency call flow test
- Location permission test
- Map interaction test

Run tests:
```bash
cd apps/mobile
flutter test
flutter test --coverage
```

### Backend Tests

Location: `/apps/backend/test/modules/emergency-call/`

**Unit Tests:**
- Domain entity tests
- Value object tests
- Command handler tests

**Integration Tests:**
- Repository tests
- API endpoint tests

Run tests:
```bash
cd apps/backend
npm run test
npm run test:e2e
npm run test:cov
```

## Deployment

### Mobile App

1. **Update dependencies:**
   ```bash
   cd apps/mobile
   flutter pub get
   ```

2. **Configure Yandex MapKit:**
   - Get API key from https://developer.tech.yandex.ru/
   - Add to `.env` file:
     ```
     YANDEX_MAPKIT_API_KEY=your_api_key_here
     ```

3. **Add permissions:**
   - iOS: Update `Info.plist` with location permissions
   - Android: Update `AndroidManifest.xml` with location permissions

4. **Build:**
   ```bash
   flutter build apk  # Android
   flutter build ios  # iOS
   ```

### Backend API

1. **Run database migration:**
   ```bash
   cd apps/backend
   npm run migration:run
   ```

2. **Enable PostGIS:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Update environment variables:**
   ```
   YANDEX_GEOCODER_API_KEY=your_api_key_here
   ```

4. **Start server:**
   ```bash
   npm run start:prod
   ```

## Monitoring

### Metrics to Track

1. **Emergency Call Metrics:**
   - Total calls created
   - Calls by status (pending, accepted, completed)
   - Average response time
   - Call completion rate

2. **Performance Metrics:**
   - Map load time
   - Geocoding response time
   - Nearby lawyer query time
   - API response time

3. **User Metrics:**
   - Location permission grant rate
   - Call cancellation rate
   - User satisfaction ratings

## Future Enhancements

1. **Real-time Tracking:**
   - Live lawyer location tracking
   - Estimated arrival time (ETA)

2. **Call Prioritization:**
   - Emergency severity levels
   - Priority queue for critical cases

3. **In-App Communication:**
   - Voice/video call during emergency
   - Text chat for details

4. **Smart Matching:**
   - Match by lawyer specialization
   - Consider lawyer ratings
   - Language preferences

5. **Offline Support:**
   - Cache map tiles
   - Queue calls when offline
   - Sync when connection restored

## Troubleshooting

### Common Issues

**1. Location Permission Denied**
- Show manual address input
- Guide user to settings

**2. No Nearby Lawyers**
- Expand search radius
- Show "Searching wider area..."
- Suggest scheduling regular consultation

**3. Map Not Loading**
- Check API key configuration
- Verify network connection
- Show error with retry button

**4. Geocoding Failures**
- Fallback to coordinate-only mode
- Show "Unable to determine address"
- Allow manual address entry

## Support

For issues or questions:
- Email: modera@erarta.ai, evgeniy@erarta.ai
- Repository: https://github.com/erarta/advocata
- Documentation: /docs/EMERGENCY_CALL_FEATURE.md

---

**Version**: 1.0.0
**Last Updated**: November 18, 2025
**Status**: Production Ready
