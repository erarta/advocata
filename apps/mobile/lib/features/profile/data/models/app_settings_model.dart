import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/app_settings.entity.dart';

part 'app_settings_model.g.dart';

/// App settings model
@JsonSerializable()
class AppSettingsModel {
  @JsonKey(name: 'user_id')
  final String userId;
  @JsonKey(name: 'theme_mode')
  final String themeMode;
  final String language;
  final Map<String, dynamic> notifications;
  @JsonKey(name: 'biometric_enabled')
  final bool biometricEnabled;
  @JsonKey(name: 'analytics_enabled')
  final bool analyticsEnabled;
  @JsonKey(name: 'crash_reporting_enabled')
  final bool crashReportingEnabled;
  @JsonKey(name: 'updated_at')
  final String updatedAt;

  const AppSettingsModel({
    required this.userId,
    required this.themeMode,
    required this.language,
    required this.notifications,
    required this.biometricEnabled,
    required this.analyticsEnabled,
    required this.crashReportingEnabled,
    required this.updatedAt,
  });

  /// From JSON
  factory AppSettingsModel.fromJson(Map<String, dynamic> json) =>
      _$AppSettingsModelFromJson(json);

  /// To JSON
  Map<String, dynamic> toJson() => _$AppSettingsModelToJson(this);

  /// To entity
  AppSettingsEntity toEntity() {
    return AppSettingsEntity(
      userId: userId,
      themeMode: _parseThemeMode(themeMode),
      language: _parseLanguage(language),
      notifications: NotificationPreferences.fromJson(notifications),
      biometricEnabled: biometricEnabled,
      analyticsEnabled: analyticsEnabled,
      crashReportingEnabled: crashReportingEnabled,
      updatedAt: DateTime.parse(updatedAt),
    );
  }

  /// From entity
  factory AppSettingsModel.fromEntity(AppSettingsEntity entity) {
    return AppSettingsModel(
      userId: entity.userId,
      themeMode: _themeModeToString(entity.themeMode),
      language: entity.language.code,
      notifications: entity.notifications.toJson(),
      biometricEnabled: entity.biometricEnabled,
      analyticsEnabled: entity.analyticsEnabled,
      crashReportingEnabled: entity.crashReportingEnabled,
      updatedAt: entity.updatedAt.toIso8601String(),
    );
  }

  static ThemeMode _parseThemeMode(String value) {
    switch (value) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }

  static String _themeModeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }

  static AppLanguage _parseLanguage(String code) {
    switch (code) {
      case 'en':
        return AppLanguage.english;
      case 'kk':
        return AppLanguage.kazakh;
      case 'ru':
      default:
        return AppLanguage.russian;
    }
  }
}
