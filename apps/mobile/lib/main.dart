import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/supabase_config.dart';
import 'config/router_config.dart';
import 'core/infrastructure/storage/local_storage.dart';
import 'core/presentation/theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Initialize services
  await _initializeServices();

  runApp(
    const ProviderScope(
      child: AdvocataApp(),
    ),
  );
}

/// Initialize all required services
Future<void> _initializeServices() async {
  try {
    // Initialize Supabase
    await SupabaseConfig.initialize();

    // Initialize Local Storage
    await LocalStorage.initialize();
  } catch (e) {
    debugPrint('Error initializing services: $e');
    rethrow;
  }
}

class AdvocataApp extends ConsumerWidget {
  const AdvocataApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Advocata',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: router,
      builder: (context, child) {
        // Set system UI overlay style
        SystemChrome.setSystemUIOverlayStyle(
          const SystemUiOverlayStyle(
            statusBarColor: Colors.transparent,
            statusBarIconBrightness: Brightness.dark,
            systemNavigationBarColor: Colors.white,
            systemNavigationBarIconBrightness: Brightness.dark,
          ),
        );

        return child!;
      },
    );
  }
}
