import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/settings_repository_impl.dart';
import '../../domain/entities/app_settings.entity.dart';
import '../../domain/repositories/settings_repository.dart';
import 'address_providers.dart'; // For shared data source

/// Settings repository provider
final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepositoryImpl(
    remoteDataSource: ref.watch(profileEnhancedDataSourceProvider),
  );
});

/// App settings provider
final appSettingsProvider = FutureProvider<AppSettingsEntity>((ref) async {
  final repository = ref.watch(settingsRepositoryProvider);
  final result = await repository.getSettings();
  return result.fold(
    onSuccess: (settings) => settings,
    onFailure: (failure) => throw Exception(failure.message),
  );
});

/// Cache size provider
final cacheSizeProvider = FutureProvider<double>((ref) async {
  final repository = ref.watch(settingsRepositoryProvider);
  final result = await repository.getCacheSize();
  return result.fold(
    onSuccess: (size) => size,
    onFailure: (failure) => 0.0,
  );
});

/// Settings operations state notifier
class SettingsOperationsNotifier extends StateNotifier<AsyncValue<void>> {
  final SettingsRepository repository;
  final Ref ref;

  SettingsOperationsNotifier(this.repository, this.ref)
      : super(const AsyncValue.data(null));

  Future<bool> updateThemeMode(ThemeMode themeMode) async {
    state = const AsyncValue.loading();
    final result = await repository.updateSettings(themeMode: themeMode);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(appSettingsProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> updateLanguage(AppLanguage language) async {
    state = const AsyncValue.loading();
    final result = await repository.updateSettings(language: language);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(appSettingsProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> updateNotifications(NotificationPreferences notifications) async {
    state = const AsyncValue.loading();
    final result =
        await repository.updateSettings(notifications: notifications);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(appSettingsProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> updateBiometric(bool enabled) async {
    state = const AsyncValue.loading();
    final result = await repository.updateSettings(biometricEnabled: enabled);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(appSettingsProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> updateAnalytics(bool enabled) async {
    state = const AsyncValue.loading();
    final result = await repository.updateSettings(analyticsEnabled: enabled);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(appSettingsProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> updateCrashReporting(bool enabled) async {
    state = const AsyncValue.loading();
    final result =
        await repository.updateSettings(crashReportingEnabled: enabled);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(appSettingsProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> clearCache() async {
    state = const AsyncValue.loading();
    final result = await repository.clearCache();

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(cacheSizeProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }
}

/// Settings operations provider
final settingsOperationsProvider =
    StateNotifierProvider<SettingsOperationsNotifier, AsyncValue<void>>((ref) {
  return SettingsOperationsNotifier(
    ref.watch(settingsRepositoryProvider),
    ref,
  );
});
