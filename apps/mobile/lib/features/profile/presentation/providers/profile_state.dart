import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/user_profile_entity.dart';

part 'profile_state.freezed.dart';

/// Profile state
@freezed
class ProfileState with _$ProfileState {
  const factory ProfileState.initial() = _Initial;
  const factory ProfileState.loading() = _Loading;
  const factory ProfileState.loaded(UserProfileEntity profile) = _Loaded;
  const factory ProfileState.updating() = _Updating;
  const factory ProfileState.error(String message) = _Error;
}
