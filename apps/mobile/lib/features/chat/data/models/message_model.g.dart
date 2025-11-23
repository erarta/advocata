// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'message_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

MessageModel _$MessageModelFromJson(Map<String, dynamic> json) => MessageModel(
      id: json['id'] as String,
      consultationId: json['consultation_id'] as String,
      senderId: json['sender_id'] as String,
      senderName: json['sender_name'] as String?,
      senderAvatar: json['sender_avatar'] as String?,
      content: json['content'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      attachments: (json['attachments'] as List<dynamic>?)
              ?.map((e) =>
                  MessageAttachmentModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      createdAt: DateTime.parse(json['created_at'] as String),
      readAt: json['read_at'] == null
          ? null
          : DateTime.parse(json['read_at'] as String),
      deliveredAt: json['delivered_at'] == null
          ? null
          : DateTime.parse(json['delivered_at'] as String),
    );

Map<String, dynamic> _$MessageModelToJson(MessageModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'consultation_id': instance.consultationId,
      'sender_id': instance.senderId,
      'sender_name': instance.senderName,
      'sender_avatar': instance.senderAvatar,
      'content': instance.content,
      'type': instance.type,
      'status': instance.status,
      'attachments': instance.attachments.map((e) => e.toJson()).toList(),
      'created_at': instance.createdAt.toIso8601String(),
      'read_at': instance.readAt?.toIso8601String(),
      'delivered_at': instance.deliveredAt?.toIso8601String(),
    };

MessageAttachmentModel _$MessageAttachmentModelFromJson(
        Map<String, dynamic> json) =>
    MessageAttachmentModel(
      id: json['id'] as String,
      fileName: json['file_name'] as String,
      fileUrl: json['file_url'] as String,
      fileSize: (json['file_size'] as num).toInt(),
      mimeType: json['mime_type'] as String,
      thumbnailUrl: json['thumbnail_url'] as String?,
    );

Map<String, dynamic> _$MessageAttachmentModelToJson(
        MessageAttachmentModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'file_name': instance.fileName,
      'file_url': instance.fileUrl,
      'file_size': instance.fileSize,
      'mime_type': instance.mimeType,
      'thumbnail_url': instance.thumbnailUrl,
    };
