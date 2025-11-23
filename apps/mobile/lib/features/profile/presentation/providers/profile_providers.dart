import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/supabase_config.dart';
import '../../data/datasources/profile_remote_datasource.dart';
import '../../data/repositories/profile_repository_impl.dart';
import '../../domain/repositories/profile_repository.dart';
import '../../domain/usecases/delete_account_usecase.dart';
import '../../domain/usecases/get_profile_usecase.dart';
import '../../domain/usecases/update_avatar_usecase.dart';
import '../../domain/usecases/update_notification_settings_usecase.dart';
import '../../domain/usecases/update_profile_usecase.dart';
import 'profile_state_notifier.dart';

/// Profile remote data source provider
final profileRemoteDataSourceProvider = Provider<ProfileRemoteDataSource>((ref) {
  return ProfileRemoteDataSourceImpl(
    supabaseClient: SupabaseConfig.client,
  );
});

/// Profile repository provider
final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(
    remoteDataSource: ref.watch(profileRemoteDataSourceProvider),
  );
});

/// Get profile use case provider
final getProfileUseCaseProvider = Provider<GetProfileUseCase>((ref) {
  return GetProfileUseCase(ref.watch(profileRepositoryProvider));
});

/// Update profile use case provider
final updateProfileUseCaseProvider = Provider<UpdateProfileUseCase>((ref) {
  return UpdateProfileUseCase(ref.watch(profileRepositoryProvider));
});

/// Update avatar use case provider
final updateAvatarUseCaseProvider = Provider<UpdateAvatarUseCase>((ref) {
  return UpdateAvatarUseCase(ref.watch(profileRepositoryProvider));
});

/// Update notification settings use case provider
final updateNotificationSettingsUseCaseProvider =
    Provider<UpdateNotificationSettingsUseCase>((ref) {
  return UpdateNotificationSettingsUseCase(ref.watch(profileRepositoryProvider));
});

/// Delete account use case provider
final deleteAccountUseCaseProvider = Provider<DeleteAccountUseCase>((ref) {
  return DeleteAccountUseCase(ref.watch(profileRepositoryProvider));
});

/// Profile state notifier provider
final profileNotifierProvider =
    StateNotifierProvider<ProfileStateNotifier, ProfileState>((ref) {
  return ProfileStateNotifier(
    getProfileUseCase: ref.watch(getProfileUseCaseProvider),
    updateProfileUseCase: ref.watch(updateProfileUseCaseProvider),
    updateAvatarUseCase: ref.watch(updateAvatarUseCaseProvider),
    updateNotificationSettingsUseCase:
        ref.watch(updateNotificationSettingsUseCaseProvider),
    deleteAccountUseCase: ref.watch(deleteAccountUseCaseProvider),
  );
});
