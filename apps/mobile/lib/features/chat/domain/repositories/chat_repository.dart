import 'dart:io';
import '../../../../core/domain/result/result.dart';
import '../entities/chat_session_entity.dart';
import '../entities/message_entity.dart';

/// Chat repository interface
abstract class ChatRepository {
  /// Get chat session for consultation
  Future<Result<ChatSessionEntity>> getChatSession(String consultationId);

  /// Get messages for consultation
  Future<Result<List<MessageEntity>>> getMessages({
    required String consultationId,
    int? limit,
    String? beforeMessageId,
  });

  /// Send text message
  Future<Result<MessageEntity>> sendMessage({
    required String consultationId,
    required String content,
    MessageType type = MessageType.text,
  });

  /// Send message with attachment
  Future<Result<MessageEntity>> sendMessageWithAttachment({
    required String consultationId,
    required String content,
    required File file,
  });

  /// Mark message as read
  Future<Result<void>> markAsRead({
    required String messageId,
  });

  /// Mark all messages in consultation as read
  Future<Result<void>> markAllAsRead({
    required String consultationId,
  });

  /// Upload file attachment
  Future<Result<MessageAttachment>> uploadAttachment({
    required File file,
    required String consultationId,
  });

  /// Set typing status
  Future<Result<void>> setTypingStatus({
    required String consultationId,
    required bool isTyping,
  });

  /// Listen to new messages (real-time)
  Stream<MessageEntity> watchMessages(String consultationId);

  /// Listen to typing status (real-time)
  Stream<bool> watchTypingStatus(String consultationId);
}
