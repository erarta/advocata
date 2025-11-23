import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'supabase_config.dart';
import '../features/onboarding/application/providers/onboarding_providers.dart';

// Placeholder screens (to be implemented)
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/auth/presentation/screens/otp_verification_screen.dart';
import '../features/home/presentation/screens/home_screen.dart';
import '../features/lawyer/presentation/screens/lawyer_search_screen.dart';
import '../features/lawyer/presentation/screens/lawyer_detail_screen.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/chat/presentation/screens/chat_screen.dart';
import '../features/emergency_call/presentation/screens/emergency_call_screen.dart';
import '../features/support/presentation/screens/support_screen.dart';
import '../features/support/presentation/screens/support_chat_screen.dart';
import '../features/support/presentation/screens/instructions_screen.dart';
import '../features/support/presentation/screens/legal_information_screen.dart';
import '../features/onboarding/presentation/screens/onboarding_screen.dart';
// Profile enhancement screens
import '../features/profile/presentation/screens/saved_addresses_screen.dart';
import '../features/profile/presentation/screens/add_address_screen.dart';
import '../features/profile/presentation/screens/emergency_contacts_screen.dart';
import '../features/profile/presentation/screens/add_emergency_contact_screen.dart';
import '../features/profile/presentation/screens/referral_screen.dart';
import '../features/profile/presentation/screens/app_settings_screen.dart';

/// Router configuration provider
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isAuthenticated = SupabaseConfig.isAuthenticated;
      final isOnAuthScreen = state.matchedLocation.startsWith('/auth');
      final isOnSplash = state.matchedLocation == '/splash';

      // If not authenticated and not on auth screen, redirect to login
      if (!isAuthenticated && !isOnAuthScreen && !isOnSplash) {
        return '/auth/login';
      }

      // If authenticated and on auth screen, redirect to home
      if (isAuthenticated && isOnAuthScreen) {
        return '/home';
      }

      return null;
    },
    routes: [
      // Splash
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Onboarding
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),

      // Auth routes
      GoRoute(
        path: '/auth/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/verify-otp',
        name: 'verify-otp',
        builder: (context, state) {
          final phoneNumber = state.extra as String?;
          return OtpVerificationScreen(phoneNumber: phoneNumber ?? '');
        },
      ),

      // Main routes
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),

      // Lawyer routes
      GoRoute(
        path: '/lawyers',
        name: 'lawyers',
        builder: (context, state) => const LawyerSearchScreen(),
      ),
      GoRoute(
        path: '/lawyers/:id',
        name: 'lawyer-detail',
        builder: (context, state) {
          final lawyerId = state.pathParameters['id']!;
          return LawyerDetailScreen(lawyerId: lawyerId);
        },
      ),

      // Profile routes
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      // Saved addresses routes
      GoRoute(
        path: '/profile/addresses',
        name: 'saved-addresses',
        builder: (context, state) => const SavedAddressesScreen(),
      ),
      GoRoute(
        path: '/profile/addresses/add',
        name: 'add-address',
        builder: (context, state) => const AddAddressScreen(),
      ),
      GoRoute(
        path: '/profile/addresses/edit/:id',
        name: 'edit-address',
        builder: (context, state) {
          final addressId = state.pathParameters['id']!;
          return AddAddressScreen(addressId: addressId);
        },
      ),
      // Emergency contacts routes
      GoRoute(
        path: '/profile/emergency-contacts',
        name: 'emergency-contacts',
        builder: (context, state) => const EmergencyContactsScreen(),
      ),
      GoRoute(
        path: '/profile/emergency-contacts/add',
        name: 'add-emergency-contact',
        builder: (context, state) => const AddEmergencyContactScreen(),
      ),
      GoRoute(
        path: '/profile/emergency-contacts/edit/:id',
        name: 'edit-emergency-contact',
        builder: (context, state) {
          final contactId = state.pathParameters['id']!;
          return AddEmergencyContactScreen(contactId: contactId);
        },
      ),
      // Referral route
      GoRoute(
        path: '/profile/referral',
        name: 'referral',
        builder: (context, state) => const ReferralScreen(),
      ),
      // Settings route
      GoRoute(
        path: '/profile/settings',
        name: 'app-settings',
        builder: (context, state) => const AppSettingsScreen(),
      ),

      // Chat routes
      GoRoute(
        path: '/consultations/:consultationId/chat',
        name: 'chat',
        builder: (context, state) {
          final consultationId = state.pathParameters['consultationId']!;
          final extra = state.extra as Map<String, dynamic>?;
          return ChatScreen(
            consultationId: consultationId,
            lawyerName: extra?['lawyerName'] ?? 'Юрист',
            lawyerAvatar: extra?['lawyerAvatar'],
          );
        },
      ),

      // Emergency call route
      GoRoute(
        path: '/emergency-call',
        name: 'emergency-call',
        builder: (context, state) => const EmergencyCallScreen(),
      ),

      // Support routes
      GoRoute(
        path: '/support',
        name: 'support',
        builder: (context, state) => const SupportScreen(),
      ),
      GoRoute(
        path: '/support/chat',
        name: 'support-chat',
        builder: (context, state) => const SupportChatScreen(),
      ),
      GoRoute(
        path: '/support/instructions',
        name: 'support-instructions',
        builder: (context, state) => const InstructionsScreen(),
      ),
      GoRoute(
        path: '/support/legal',
        name: 'support-legal',
        builder: (context, state) => const LegalInformationScreen(),
      ),
    ],
    errorBuilder: (context, state) => ErrorScreen(error: state.error),
  );
});

/// Splash screen
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNextScreen();
  }

  Future<void> _navigateToNextScreen() async {
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    // Check onboarding status
    final onboardingCompleted = OnboardingService.isOnboardingCompleted();

    // If onboarding not completed, show onboarding
    if (!onboardingCompleted) {
      context.go('/onboarding');
      return;
    }

    // Check authentication
    final isAuthenticated = SupabaseConfig.isAuthenticated;

    if (isAuthenticated) {
      context.go('/home');
    } else {
      context.go('/auth/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
          ),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.gavel_rounded,
                size: 80,
                color: Colors.white,
              ),
              SizedBox(height: 24),
              Text(
                'Advocata',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Юридическая помощь онлайн',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Error screen
class ErrorScreen extends StatelessWidget {
  final Exception? error;

  const ErrorScreen({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline_rounded,
                size: 80,
                color: Colors.red,
              ),
              const SizedBox(height: 24),
              const Text(
                'Страница не найдена',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                error?.toString() ?? 'Неизвестная ошибка',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/home'),
                child: const Text('На главную'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
