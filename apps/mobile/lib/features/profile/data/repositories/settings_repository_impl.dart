import 'dart:io';
import '../../../../core/domain/failures/failure.dart';
import '../../../../core/utils/result.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../domain/entities/app_settings.entity.dart';
import '../../domain/repositories/settings_repository.dart';
import '../datasources/profile_enhanced_remote_datasource.dart';
import '../models/app_settings_model.dart';

/// Settings repository implementation
class SettingsRepositoryImpl implements SettingsRepository {
  final ProfileEnhancedRemoteDataSource remoteDataSource;

  SettingsRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Result<AppSettingsEntity>> getSettings() async {
    try {
      final model = await remoteDataSource.getSettings();
      return Result.success(model.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message, code: e.code));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message, code: e.code));
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Неизвестная ошибка: $e'));
    }
  }

  @override
  Future<Result<AppSettingsEntity>> updateSettings({
    ThemeMode? themeMode,
    AppLanguage? language,
    NotificationPreferences? notifications,
    bool? biometricEnabled,
    bool? analyticsEnabled,
    bool? crashReportingEnabled,
  }) async {
    try {
      final model = await remoteDataSource.updateSettings(
        themeMode: themeMode != null ? _themeModeToString(themeMode) : null,
        language: language?.code,
        notifications: notifications?.toJson(),
        biometricEnabled: biometricEnabled,
        analyticsEnabled: analyticsEnabled,
        crashReportingEnabled: crashReportingEnabled,
      );
      return Result.success(model.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message, code: e.code));
    } on ValidationException catch (e) {
      return Result.failure(ValidationFailure(message: e.message, code: e.code));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message, code: e.code));
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Неизвестная ошибка: $e'));
    }
  }

  @override
  Future<Result<void>> clearCache() async {
    try {
      // Implement cache clearing logic
      // This could involve deleting temporary files, clearing image cache, etc.
      final cacheDir = Directory.systemTemp;
      if (await cacheDir.exists()) {
        await cacheDir.delete(recursive: true);
        await cacheDir.create();
      }
      return Result.success(null);
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Не удалось очистить кеш: $e'));
    }
  }

  @override
  Future<Result<double>> getCacheSize() async {
    try {
      // Calculate cache size in MB
      final cacheDir = Directory.systemTemp;
      if (!await cacheDir.exists()) {
        return Result.success(0.0);
      }

      int totalSize = 0;
      await for (final entity in cacheDir.list(recursive: true, followLinks: false)) {
        if (entity is File) {
          totalSize += await entity.length();
        }
      }

      // Convert to MB
      final sizeInMB = totalSize / (1024 * 1024);
      return Result.success(sizeInMB);
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Не удалось получить размер кеша: $e'));
    }
  }

  String _themeModeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }
}
