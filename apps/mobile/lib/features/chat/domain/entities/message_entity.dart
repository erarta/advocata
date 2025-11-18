import 'package:equatable/equatable.dart';

/// Message entity
///
/// Represents a chat message in a consultation
class MessageEntity extends Equatable {
  final String id;
  final String consultationId;
  final String senderId;
  final String? senderName;
  final String? senderAvatar;
  final String content;
  final MessageType type;
  final MessageStatus status;
  final List<MessageAttachment> attachments;
  final DateTime createdAt;
  final DateTime? readAt;
  final DateTime? deliveredAt;

  const MessageEntity({
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

  /// Check if message is sent by current user
  bool isMine(String currentUserId) => senderId == currentUserId;

  /// Check if message is read
  bool get isRead => readAt != null;

  /// Check if message is delivered
  bool get isDelivered => deliveredAt != null || isRead;

  /// Check if message has attachments
  bool get hasAttachments => attachments.isNotEmpty;

  /// Get formatted time
  String get formattedTime {
    final hour = createdAt.hour.toString().padLeft(2, '0');
    final minute = createdAt.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  @override
  List<Object?> get props => [
        id,
        consultationId,
        senderId,
        senderName,
        senderAvatar,
        content,
        type,
        status,
        attachments,
        createdAt,
        readAt,
        deliveredAt,
      ];
}

/// Message type
enum MessageType {
  text,
  image,
  document,
  audio,
  video,
  system;

  String get displayName {
    switch (this) {
      case MessageType.text:
        return 'Текст';
      case MessageType.image:
        return 'Изображение';
      case MessageType.document:
        return 'Документ';
      case MessageType.audio:
        return 'Аудио';
      case MessageType.video:
        return 'Видео';
      case MessageType.system:
        return 'Системное';
    }
  }
}

/// Message status
enum MessageStatus {
  sending,
  sent,
  delivered,
  read,
  failed;

  String get displayName {
    switch (this) {
      case MessageStatus.sending:
        return 'Отправка...';
      case MessageStatus.sent:
        return 'Отправлено';
      case MessageStatus.delivered:
        return 'Доставлено';
      case MessageStatus.read:
        return 'Прочитано';
      case MessageStatus.failed:
        return 'Ошибка';
    }
  }
}

/// Message attachment
class MessageAttachment extends Equatable {
  final String id;
  final String fileName;
  final String fileUrl;
  final int fileSize;
  final String mimeType;
  final String? thumbnailUrl;

  const MessageAttachment({
    required this.id,
    required this.fileName,
    required this.fileUrl,
    required this.fileSize,
    required this.mimeType,
    this.thumbnailUrl,
  });

  /// Get file size in readable format
  String get fileSizeFormatted {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  /// Check if file is an image
  bool get isImage => mimeType.startsWith('image/');

  /// Check if file is a document
  bool get isDocument =>
      mimeType.startsWith('application/') || mimeType.contains('pdf');

  @override
  List<Object?> get props => [
        id,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        thumbnailUrl,
      ];
}
