import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/message_entity.dart';

part 'message_model.g.dart';

/// Message data model
@JsonSerializable()
class MessageModel {
  final String id;

  @JsonKey(name: 'consultation_id')
  final String consultationId;

  @JsonKey(name: 'sender_id')
  final String senderId;

  @JsonKey(name: 'sender_name')
  final String? senderName;

  @JsonKey(name: 'sender_avatar')
  final String? senderAvatar;

  final String content;
  final String type;
  final String status;

  final List<MessageAttachmentModel> attachments;

  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  @JsonKey(name: 'read_at')
  final DateTime? readAt;

  @JsonKey(name: 'delivered_at')
  final DateTime? deliveredAt;

  const MessageModel({
    required this.id,
    required this.consultationId,
    required this.senderId,
    this.senderName,
    this.senderAvatar,
    required this.content,
    required this.type,
    required this.status,
    this.attachments = const [],
    required this.createdAt,
    this.readAt,
    this.deliveredAt,
  });

  /// Create from JSON
  factory MessageModel.fromJson(Map<String, dynamic> json) =>
      _$MessageModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$MessageModelToJson(this);

  /// Convert to entity
  MessageEntity toEntity() {
    return MessageEntity(
      id: id,
      consultationId: consultationId,
      senderId: senderId,
      senderName: senderName,
      senderAvatar: senderAvatar,
      content: content,
      type: _parseMessageType(type),
      status: _parseMessageStatus(status),
      attachments: attachments.map((a) => a.toEntity()).toList(),
      createdAt: createdAt,
      readAt: readAt,
      deliveredAt: deliveredAt,
    );
  }

  /// Parse message type from string
  MessageType _parseMessageType(String type) {
    switch (type.toLowerCase()) {
      case 'text':
        return MessageType.text;
      case 'image':
        return MessageType.image;
      case 'document':
        return MessageType.document;
      case 'audio':
        return MessageType.audio;
      case 'video':
        return MessageType.video;
      case 'system':
        return MessageType.system;
      default:
        return MessageType.text;
    }
  }

  /// Parse message status from string
  MessageStatus _parseMessageStatus(String status) {
    switch (status.toLowerCase()) {
      case 'sending':
        return MessageStatus.sending;
      case 'sent':
        return MessageStatus.sent;
      case 'delivered':
        return MessageStatus.delivered;
      case 'read':
        return MessageStatus.read;
      case 'failed':
        return MessageStatus.failed;
      default:
        return MessageStatus.sent;
    }
  }
}

/// Message attachment data model
@JsonSerializable()
class MessageAttachmentModel {
  final String id;

  @JsonKey(name: 'file_name')
  final String fileName;

  @JsonKey(name: 'file_url')
  final String fileUrl;

  @JsonKey(name: 'file_size')
  final int fileSize;

  @JsonKey(name: 'mime_type')
  final String mimeType;

  @JsonKey(name: 'thumbnail_url')
  final String? thumbnailUrl;

  const MessageAttachmentModel({
    required this.id,
    required this.fileName,
    required this.fileUrl,
    required this.fileSize,
    required this.mimeType,
    this.thumbnailUrl,
  });

  /// Create from JSON
  factory MessageAttachmentModel.fromJson(Map<String, dynamic> json) =>
      _$MessageAttachmentModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$MessageAttachmentModelToJson(this);

  /// Convert to entity
  MessageAttachment toEntity() {
    return MessageAttachment(
      id: id,
      fileName: fileName,
      fileUrl: fileUrl,
      fileSize: fileSize,
      mimeType: mimeType,
      thumbnailUrl: thumbnailUrl,
    );
  }
}
