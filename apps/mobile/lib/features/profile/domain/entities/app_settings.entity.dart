import 'package:equatable/equatable.dart';

/// Theme mode enum
enum ThemeMode {
  light,
  dark,
  system;

  String get displayName {
    switch (this) {
      case ThemeMode.light:
        return 'Светлая';
      case ThemeMode.dark:
        return 'Темная';
      case ThemeMode.system:
        return 'Системная';
    }
  }
}

/// Language enum
enum AppLanguage {
  russian,
  english,
  kazakh;

  String get code {
    switch (this) {
      case AppLanguage.russian:
        return 'ru';
      case AppLanguage.english:
        return 'en';
      case AppLanguage.kazakh:
        return 'kk';
    }
  }

  String get displayName {
    switch (this) {
      case AppLanguage.russian:
        return 'Русский';
      case AppLanguage.english:
        return 'English';
      case AppLanguage.kazakh:
        return 'Қазақ';
    }
  }
}

/// Notification preferences entity
class NotificationPreferences extends Equatable {
  final bool pushEnabled;
  final bool smsEnabled;
  final bool emailEnabled;
  final bool consultationReminders;
  final bool paymentNotifications;
  final bool marketingNotifications;

  const NotificationPreferences({
    this.pushEnabled = true,
    this.smsEnabled = true,
    this.emailEnabled = true,
    this.consultationReminders = true,
    this.paymentNotifications = true,
    this.marketingNotifications = false,
  });

  NotificationPreferences copyWith({
    bool? pushEnabled,
    bool? smsEnabled,
    bool? emailEnabled,
    bool? consultationReminders,
    bool? paymentNotifications,
    bool? marketingNotifications,
  }) {
    return NotificationPreferences(
      pushEnabled: pushEnabled ?? this.pushEnabled,
      smsEnabled: smsEnabled ?? this.smsEnabled,
      emailEnabled: emailEnabled ?? this.emailEnabled,
      consultationReminders: consultationReminders ?? this.consultationReminders,
      paymentNotifications: paymentNotifications ?? this.paymentNotifications,
      marketingNotifications: marketingNotifications ?? this.marketingNotifications,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pushEnabled': pushEnabled,
      'smsEnabled': smsEnabled,
      'emailEnabled': emailEnabled,
      'consultationReminders': consultationReminders,
      'paymentNotifications': paymentNotifications,
      'marketingNotifications': marketingNotifications,
    };
  }

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    return NotificationPreferences(
      pushEnabled: json['pushEnabled'] ?? true,
      smsEnabled: json['smsEnabled'] ?? true,
      emailEnabled: json['emailEnabled'] ?? true,
      consultationReminders: json['consultationReminders'] ?? true,
      paymentNotifications: json['paymentNotifications'] ?? true,
      marketingNotifications: json['marketingNotifications'] ?? false,
    );
  }

  @override
  List<Object?> get props => [
        pushEnabled,
        smsEnabled,
        emailEnabled,
        consultationReminders,
        paymentNotifications,
        marketingNotifications,
      ];
}

/// App settings entity
///
/// Contains all user preferences and app settings
class AppSettingsEntity extends Equatable {
  final String userId;
  final ThemeMode themeMode;
  final AppLanguage language;
  final NotificationPreferences notifications;
  final bool biometricEnabled;
  final bool analyticsEnabled;
  final bool crashReportingEnabled;
  final DateTime updatedAt;

  const AppSettingsEntity({
    required this.userId,
    this.themeMode = ThemeMode.system,
    this.language = AppLanguage.russian,
    this.notifications = const NotificationPreferences(),
    this.biometricEnabled = false,
    this.analyticsEnabled = true,
    this.crashReportingEnabled = true,
    required this.updatedAt,
  });

  /// Copy with new values
  AppSettingsEntity copyWith({
    String? userId,
    ThemeMode? themeMode,
    AppLanguage? language,
    NotificationPreferences? notifications,
    bool? biometricEnabled,
    bool? analyticsEnabled,
    bool? crashReportingEnabled,
    DateTime? updatedAt,
  }) {
    return AppSettingsEntity(
      userId: userId ?? this.userId,
      themeMode: themeMode ?? this.themeMode,
      language: language ?? this.language,
      notifications: notifications ?? this.notifications,
      biometricEnabled: biometricEnabled ?? this.biometricEnabled,
      analyticsEnabled: analyticsEnabled ?? this.analyticsEnabled,
      crashReportingEnabled: crashReportingEnabled ?? this.crashReportingEnabled,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        userId,
        themeMode,
        language,
        notifications,
        biometricEnabled,
        analyticsEnabled,
        crashReportingEnabled,
        updatedAt,
      ];
}
