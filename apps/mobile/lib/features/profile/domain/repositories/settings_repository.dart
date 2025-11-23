import '../../../../core/utils/result.dart';
import '../entities/app_settings.entity.dart';

/// Settings repository interface
abstract class SettingsRepository {
  /// Get app settings for the current user
  Future<Result<AppSettingsEntity>> getSettings();

  /// Update app settings
  Future<Result<AppSettingsEntity>> updateSettings({
    ThemeMode? themeMode,
    AppLanguage? language,
    NotificationPreferences? notifications,
    bool? biometricEnabled,
    bool? analyticsEnabled,
    bool? crashReportingEnabled,
  });

  /// Clear app cache
  Future<Result<void>> clearCache();

  /// Get cache size
  Future<Result<double>> getCacheSize();
}
