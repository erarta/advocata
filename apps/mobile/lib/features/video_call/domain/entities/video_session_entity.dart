import 'package:equatable/equatable.dart';

/// Video session entity
///
/// Represents an active or completed video call session
class VideoSessionEntity extends Equatable {
  final String id;
  final String consultationId;
  final String channelName;
  final String token;
  final int uid;
  final VideoSessionStatus status;
  final DateTime? startedAt;
  final DateTime? endedAt;
  final int? duration; // in seconds
  final VideoQuality quality;
  final DateTime createdAt;

  const VideoSessionEntity({
    required this.id,
    required this.consultationId,
    required this.channelName,
    required this.token,
    required this.uid,
    required this.status,
    this.startedAt,
    this.endedAt,
    this.duration,
    this.quality = VideoQuality.auto,
    required this.createdAt,
  });

  /// Check if session is active
  bool get isActive =>
      status == VideoSessionStatus.active ||
      status == VideoSessionStatus.connecting;

  /// Check if session has ended
  bool get hasEnded =>
      status == VideoSessionStatus.ended ||
      status == VideoSessionStatus.failed;

  /// Get duration in minutes
  int get durationInMinutes => duration != null ? (duration! / 60).ceil() : 0;

  @override
  List<Object?> get props => [
        id,
        consultationId,
        channelName,
        token,
        uid,
        status,
        startedAt,
        endedAt,
        duration,
        quality,
        createdAt,
      ];
}

/// Video session status
enum VideoSessionStatus {
  connecting,
  active,
  ended,
  failed;

  String get displayName {
    switch (this) {
      case VideoSessionStatus.connecting:
        return 'Подключение...';
      case VideoSessionStatus.active:
        return 'Активен';
      case VideoSessionStatus.ended:
        return 'Завершен';
      case VideoSessionStatus.failed:
        return 'Ошибка';
    }
  }
}

/// Video quality settings
enum VideoQuality {
  auto,
  low,
  medium,
  high;

  String get displayName {
    switch (this) {
      case VideoQuality.auto:
        return 'Автоматически';
      case VideoQuality.low:
        return 'Низкое (360p)';
      case VideoQuality.medium:
        return 'Среднее (480p)';
      case VideoQuality.high:
        return 'Высокое (720p)';
    }
  }

  /// Get video dimensions for quality level
  (int width, int height) get dimensions {
    switch (this) {
      case VideoQuality.auto:
      case VideoQuality.medium:
        return (640, 480);
      case VideoQuality.low:
        return (480, 360);
      case VideoQuality.high:
        return (1280, 720);
    }
  }
}
