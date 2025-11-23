import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/video_session_entity.dart';

part 'video_session_model.g.dart';

/// Video session data model
@JsonSerializable()
class VideoSessionModel {
  final String id;

  @JsonKey(name: 'consultation_id')
  final String consultationId;

  @JsonKey(name: 'channel_name')
  final String channelName;

  final String token;
  final int uid;
  final String status;

  @JsonKey(name: 'started_at')
  final DateTime? startedAt;

  @JsonKey(name: 'ended_at')
  final DateTime? endedAt;

  final int? duration;
  final String quality;

  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  const VideoSessionModel({
    required this.id,
    required this.consultationId,
    required this.channelName,
    required this.token,
    required this.uid,
    required this.status,
    this.startedAt,
    this.endedAt,
    this.duration,
    this.quality = 'auto',
    required this.createdAt,
  });

  /// Create from JSON
  factory VideoSessionModel.fromJson(Map<String, dynamic> json) =>
      _$VideoSessionModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$VideoSessionModelToJson(this);

  /// Convert to entity
  VideoSessionEntity toEntity() {
    return VideoSessionEntity(
      id: id,
      consultationId: consultationId,
      channelName: channelName,
      token: token,
      uid: uid,
      status: _parseStatus(status),
      startedAt: startedAt,
      endedAt: endedAt,
      duration: duration,
      quality: _parseQuality(quality),
      createdAt: createdAt,
    );
  }

  /// Parse status from string
  VideoSessionStatus _parseStatus(String status) {
    switch (status.toLowerCase()) {
      case 'connecting':
        return VideoSessionStatus.connecting;
      case 'active':
        return VideoSessionStatus.active;
      case 'ended':
        return VideoSessionStatus.ended;
      case 'failed':
        return VideoSessionStatus.failed;
      default:
        return VideoSessionStatus.connecting;
    }
  }

  /// Parse quality from string
  VideoQuality _parseQuality(String quality) {
    switch (quality.toLowerCase()) {
      case 'auto':
        return VideoQuality.auto;
      case 'low':
        return VideoQuality.low;
      case 'medium':
        return VideoQuality.medium;
      case 'high':
        return VideoQuality.high;
      default:
        return VideoQuality.auto;
    }
  }

  /// Create from entity
  factory VideoSessionModel.fromEntity(VideoSessionEntity entity) {
    return VideoSessionModel(
      id: entity.id,
      consultationId: entity.consultationId,
      channelName: entity.channelName,
      token: entity.token,
      uid: entity.uid,
      status: entity.status.name,
      startedAt: entity.startedAt,
      endedAt: entity.endedAt,
      duration: entity.duration,
      quality: entity.quality.name,
      createdAt: entity.createdAt,
    );
  }
}
