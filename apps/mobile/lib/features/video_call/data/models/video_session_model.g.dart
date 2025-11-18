// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'video_session_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

VideoSessionModel _$VideoSessionModelFromJson(Map<String, dynamic> json) =>
    VideoSessionModel(
      id: json['id'] as String,
      consultationId: json['consultation_id'] as String,
      channelName: json['channel_name'] as String,
      token: json['token'] as String,
      uid: (json['uid'] as num).toInt(),
      status: json['status'] as String,
      startedAt: json['started_at'] == null
          ? null
          : DateTime.parse(json['started_at'] as String),
      endedAt: json['ended_at'] == null
          ? null
          : DateTime.parse(json['ended_at'] as String),
      duration: (json['duration'] as num?)?.toInt(),
      quality: json['quality'] as String? ?? 'auto',
      createdAt: DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$VideoSessionModelToJson(VideoSessionModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'consultation_id': instance.consultationId,
      'channel_name': instance.channelName,
      'token': instance.token,
      'uid': instance.uid,
      'status': instance.status,
      'started_at': instance.startedAt?.toIso8601String(),
      'ended_at': instance.endedAt?.toIso8601String(),
      'duration': instance.duration,
      'quality': instance.quality,
      'created_at': instance.createdAt.toIso8601String(),
    };
