import 'package:equatable/equatable.dart';
import 'message_entity.dart';

/// Chat session entity
///
/// Represents a chat session for a consultation
class ChatSessionEntity extends Equatable {
  final String id;
  final String consultationId;
  final List<String> participantIds;
  final MessageEntity? lastMessage;
  final int unreadCount;
  final bool isTyping;
  final String? typingUserId;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const ChatSessionEntity({
    required this.id,
    required this.consultationId,
    required this.participantIds,
    this.lastMessage,
    this.unreadCount = 0,
    this.isTyping = false,
    this.typingUserId,
    required this.createdAt,
    this.updatedAt,
  });

  /// Check if there are unread messages
  bool get hasUnreadMessages => unreadCount > 0;

  /// Check if someone is typing
  bool isUserTyping(String userId) => isTyping && typingUserId == userId;

  @override
  List<Object?> get props => [
        id,
        consultationId,
        participantIds,
        lastMessage,
        unreadCount,
        isTyping,
        typingUserId,
        createdAt,
        updatedAt,
      ];
}
