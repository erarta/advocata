# Advocata Mobile App

**On-demand legal services marketplace - "Uber for lawyers"**

Advocata connects clients with verified lawyers for emergency consultations (car accidents, arrests, labor disputes, and more).

## Features

- 🔐 **Phone-based authentication** - Secure OTP login via Supabase
- 👨‍⚖️ **Lawyer search & discovery** - Find lawyers by specialization, rating, and availability
- 📅 **Consultation booking** - Schedule consultations with verified lawyers
- 💬 **Real-time chat** - Communicate with your lawyer before/after consultations
- 📹 **Video consultations** - Conduct consultations via video call
- 💳 **Payment integration** - ЮКасса (YooKassa) payment processing
- 📄 **Document management** - Upload and share legal documents securely
- ⭐ **Rating & reviews** - Rate lawyers after consultations
- 🔔 **Push notifications** - Stay updated on consultation status
- 📊 **Consultation history** - Access past consultations and documents
- 💼 **Subscription plans** - Free, Basic, Pro, Enterprise tiers

## Tech Stack

- **Framework**: Flutter 3.19+
- **Backend**: Python FastAPI (port 8000)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (OTP)
- **State Management**: Riverpod 2.4+
- **Navigation**: GoRouter 13.0+
- **Payments**: ЮКасса (YooKassa)
- **Video**: Agora RTC Engine (planned)
- **Storage**: Supabase Storage

## Architecture

The app follows **Clean Architecture** with **Domain-Driven Design (DDD)** principles:

```
lib/
├── core/                 # Shared infrastructure
│   ├── domain/          # Core domain logic
│   ├── infrastructure/  # HTTP, storage, providers
│   └── presentation/    # Shared UI components
│
├── features/            # Feature modules
│   ├── auth/           # Authentication & authorization
│   ├── lawyer/         # Lawyer search & management
│   ├── consultation/   # Consultation booking & management
│   ├── payment/        # Payments & subscriptions
│   ├── profile/        # User profile & settings
│   ├── chat/           # Real-time messaging
│   └── home/           # Home dashboard
│
└── config/             # App configuration
    ├── env_config.dart
    ├── router_config.dart
    └── supabase_config.dart
```

Each feature follows the layered structure:
- **domain/** - Entities, repositories (interfaces), use cases
- **data/** - Models, data sources, repository implementations
- **presentation/** - Screens, widgets, providers (state management)

## Getting Started

### Prerequisites

- Flutter SDK (>=3.2.0 <4.0.0)
- Xcode (for iOS development)
- Android Studio (for Android development)
- Supabase project configured

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/erarta/advocata.git
   cd advocata/apps/mobile
   ```

2. **Install dependencies**:
   ```bash
   flutter pub get
   ```

3. **Set up environment variables**:

   Copy `.env.example` to `.env` and configure:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   API_BASE_URL=http://localhost:8000
   ENVIRONMENT=development
   ```

4. **Run code generation** (for models and providers):
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

5. **Run the app**:
   ```bash
   # Development mode
   flutter run

   # With environment variables
   flutter run --dart-define=API_BASE_URL=http://localhost:8000
   ```

### Backend Setup

Make sure the Python FastAPI backend is running:

```bash
cd ../backend-python
docker-compose up -d  # Or run manually
```

The mobile app expects the backend at `http://localhost:8000` (or configured `API_BASE_URL`).

## Development

### Running Tests

```bash
# Unit tests
flutter test

# Integration tests
flutter test integration_test/

# With coverage
flutter test --coverage
```

### Code Generation

The app uses code generation for:
- JSON serialization (`json_serializable`)
- Freezed classes (`freezed`)
- Riverpod providers (`riverpod_generator`)
- Router generation (`go_router_builder`)

Generate code after making changes:
```bash
flutter pub run build_runner build --delete-conflicting-outputs

# Or watch mode for continuous generation
flutter pub run build_runner watch
```

### Linting

```bash
flutter analyze
```

## Project Status

### Completed Features ✅
- Authentication (phone OTP)
- Lawyer search with filters
- Home dashboard
- Core infrastructure

### In Progress 🚧
- Consultation booking
- Payment integration
- Profile management
- Video call integration
- Chat/messaging

### Planned 📋
- Push notifications
- Document management
- Offline support
- Analytics integration
- Multi-language support

## API Endpoints

The mobile app connects to these backend endpoints:

- **Auth**: `/api/v1/auth/*` (Supabase Auth)
- **Lawyers**: `/api/v1/lawyers/*`
- **Consultations**: `/api/v1/consultations/*`
- **Payments**: `/api/v1/payments/*`
- **Subscriptions**: `/api/v1/subscriptions/*`
- **Chat**: `/ws/chat/{conversation_id}` (WebSocket)
- **Documents**: `/api/v1/documents/*`

See [Backend API Documentation](../backend-python/README.md) for details.

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Make your changes
3. Run tests and linting
4. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Contact

For questions or support:
- Email: [modera@erarta.ai](mailto:modera@erarta.ai), [evgeniy@erarta.ai](mailto:evgeniy@erarta.ai)
- Repository: https://github.com/erarta/advocata

---

**Advocata** - Legal help when you need it most.
