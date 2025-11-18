import 'dart:io';
import '../../../../core/domain/result/result.dart';
import '../entities/user_profile_entity.dart';

/// Profile repository interface
abstract class ProfileRepository {
  /// Get user profile
  Future<Result<UserProfileEntity>> getProfile();

  /// Update user profile
  Future<Result<UserProfileEntity>> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? bio,
    String? city,
    String? address,
    DateTime? dateOfBirth,
  });

  /// Update avatar
  Future<Result<String>> updateAvatar(File imageFile);

  /// Delete avatar
  Future<Result<void>> deleteAvatar();

  /// Update notification settings
  Future<Result<UserProfileEntity>> updateNotificationSettings({
    bool? notificationsEnabled,
    bool? emailNotificationsEnabled,
    bool? smsNotificationsEnabled,
    bool? pushNotificationsEnabled,
  });

  /// Update language preference
  Future<Result<UserProfileEntity>> updateLanguagePreference(String language);

  /// Delete account
  Future<Result<void>> deleteAccount();
}
