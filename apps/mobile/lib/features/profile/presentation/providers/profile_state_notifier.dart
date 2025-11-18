import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/usecases/delete_account_usecase.dart';
import '../../domain/usecases/get_profile_usecase.dart';
import '../../domain/usecases/update_avatar_usecase.dart';
import '../../domain/usecases/update_notification_settings_usecase.dart';
import '../../domain/usecases/update_profile_usecase.dart';
import 'profile_state.dart';

/// Profile state notifier
class ProfileStateNotifier extends StateNotifier<ProfileState> {
  final GetProfileUseCase getProfileUseCase;
  final UpdateProfileUseCase updateProfileUseCase;
  final UpdateAvatarUseCase updateAvatarUseCase;
  final UpdateNotificationSettingsUseCase updateNotificationSettingsUseCase;
  final DeleteAccountUseCase deleteAccountUseCase;

  ProfileStateNotifier({
    required this.getProfileUseCase,
    required this.updateProfileUseCase,
    required this.updateAvatarUseCase,
    required this.updateNotificationSettingsUseCase,
    required this.deleteAccountUseCase,
  }) : super(const ProfileState.initial());

  /// Load profile
  Future<void> loadProfile() async {
    state = const ProfileState.loading();

    final result = await getProfileUseCase.execute();

    state = result.fold(
      onSuccess: (profile) => ProfileState.loaded(profile),
      onFailure: (failure) => ProfileState.error(failure.message),
    );
  }

  /// Update profile
  Future<bool> updateProfile(UpdateProfileParams params) async {
    final currentState = state;

    state = const ProfileState.updating();

    final result = await updateProfileUseCase.execute(params);

    final success = result.fold(
      onSuccess: (profile) {
        state = ProfileState.loaded(profile);
        return true;
      },
      onFailure: (failure) {
        state = currentState; // Restore previous state
        // You might want to show error in a different way
        return false;
      },
    );

    return success;
  }

  /// Update avatar
  Future<bool> updateAvatar(File imageFile) async {
    final currentState = state;

    if (currentState is! _Loaded) {
      return false;
    }

    state = const ProfileState.updating();

    final result = await updateAvatarUseCase.execute(imageFile);

    final success = result.fold(
      onSuccess: (avatarUrl) {
        final updatedProfile = (currentState as _Loaded).profile.copyWith(
              avatarUrl: avatarUrl,
              updatedAt: DateTime.now(),
            );
        state = ProfileState.loaded(updatedProfile);
        return true;
      },
      onFailure: (failure) {
        state = currentState; // Restore previous state
        return false;
      },
    );

    return success;
  }

  /// Update notification settings
  Future<bool> updateNotificationSettings(
    UpdateNotificationSettingsParams params,
  ) async {
    final currentState = state;

    state = const ProfileState.updating();

    final result = await updateNotificationSettingsUseCase.execute(params);

    final success = result.fold(
      onSuccess: (profile) {
        state = ProfileState.loaded(profile);
        return true;
      },
      onFailure: (failure) {
        state = currentState; // Restore previous state
        return false;
      },
    );

    return success;
  }

  /// Delete account
  Future<bool> deleteAccount() async {
    final currentState = state;

    state = const ProfileState.updating();

    final result = await deleteAccountUseCase.execute();

    final success = result.fold(
      onSuccess: (_) {
        state = const ProfileState.initial();
        return true;
      },
      onFailure: (failure) {
        state = currentState; // Restore previous state
        return false;
      },
    );

    return success;
  }
}
