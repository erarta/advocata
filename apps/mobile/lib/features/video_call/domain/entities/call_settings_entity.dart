import 'package:equatable/equatable.dart';

/// Call settings entity
///
/// Stores user preferences for video calls
class CallSettingsEntity extends Equatable {
  final bool isMicrophoneEnabled;
  final bool isCameraEnabled;
  final bool isSpeakerEnabled;
  final CameraPosition cameraPosition;
  final VideoQualityPreference videoQuality;

  const CallSettingsEntity({
    this.isMicrophoneEnabled = true,
    this.isCameraEnabled = true,
    this.isSpeakerEnabled = true,
    this.cameraPosition = CameraPosition.front,
    this.videoQuality = VideoQualityPreference.auto,
  });

  CallSettingsEntity copyWith({
    bool? isMicrophoneEnabled,
    bool? isCameraEnabled,
    bool? isSpeakerEnabled,
    CameraPosition? cameraPosition,
    VideoQualityPreference? videoQuality,
  }) {
    return CallSettingsEntity(
      isMicrophoneEnabled: isMicrophoneEnabled ?? this.isMicrophoneEnabled,
      isCameraEnabled: isCameraEnabled ?? this.isCameraEnabled,
      isSpeakerEnabled: isSpeakerEnabled ?? this.isSpeakerEnabled,
      cameraPosition: cameraPosition ?? this.cameraPosition,
      videoQuality: videoQuality ?? this.videoQuality,
    );
  }

  @override
  List<Object?> get props => [
        isMicrophoneEnabled,
        isCameraEnabled,
        isSpeakerEnabled,
        cameraPosition,
        videoQuality,
      ];
}

/// Camera position
enum CameraPosition {
  front,
  back;

  String get displayName {
    switch (this) {
      case CameraPosition.front:
        return 'Фронтальная';
      case CameraPosition.back:
        return 'Задняя';
    }
  }
}

/// Video quality preference
enum VideoQualityPreference {
  auto,
  low,
  medium,
  high;

  String get displayName {
    switch (this) {
      case VideoQualityPreference.auto:
        return 'Автоматически';
      case VideoQualityPreference.low:
        return 'Экономия трафика';
      case VideoQualityPreference.medium:
        return 'Сбалансированное';
      case VideoQualityPreference.high:
        return 'Максимальное качество';
    }
  }
}
