import '../../../../core/domain/result/result.dart';
import '../entities/user_profile_entity.dart';
import '../repositories/profile_repository.dart';

/// Parameters for updating notification settings
class UpdateNotificationSettingsParams {
  final bool? notificationsEnabled;
  final bool? emailNotificationsEnabled;
  final bool? smsNotificationsEnabled;
  final bool? pushNotificationsEnabled;

  const UpdateNotificationSettingsParams({
    this.notificationsEnabled,
    this.emailNotificationsEnabled,
    this.smsNotificationsEnabled,
    this.pushNotificationsEnabled,
  });
}

/// Use case for updating notification settings
class UpdateNotificationSettingsUseCase {
  final ProfileRepository repository;

  UpdateNotificationSettingsUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with updated UserProfileEntity or error
  Future<Result<UserProfileEntity>> execute(
    UpdateNotificationSettingsParams params,
  ) async {
    return await repository.updateNotificationSettings(
      notificationsEnabled: params.notificationsEnabled,
      emailNotificationsEnabled: params.emailNotificationsEnabled,
      smsNotificationsEnabled: params.smsNotificationsEnabled,
      pushNotificationsEnabled: params.pushNotificationsEnabled,
    );
  }
}
