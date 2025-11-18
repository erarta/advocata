import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';

/// Message model for support chat
class SupportMessage {
  final String id;
  final String content;
  final bool isFromUser;
  final DateTime createdAt;
  final String senderName;

  SupportMessage({
    required this.id,
    required this.content,
    required this.isFromUser,
    required this.createdAt,
    required this.senderName,
  });
}

/// Chat message bubble widget for support chat
class ChatMessageBubble extends StatelessWidget {
  final SupportMessage message;

  const ChatMessageBubble({
    Key? key,
    required this.message,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isFromUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        child: Column(
          crossAxisAlignment: message.isFromUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            // Message bubble
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 10,
              ),
              decoration: BoxDecoration(
                color: message.isFromUser ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(message.isFromUser ? 16 : 4),
                  bottomRight: Radius.circular(message.isFromUser ? 4 : 16),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Sender name (for received messages)
                  if (!message.isFromUser) ...[
                    Text(
                      message.senderName,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 4),
                  ],

                  // Message content
                  Text(
                    message.content,
                    style: TextStyle(
                      fontSize: 15,
                      color: message.isFromUser ? Colors.white : AppColors.grey900,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),

            // Time
            Padding(
              padding: const EdgeInsets.only(top: 4, left: 4, right: 4),
              child: Text(
                _formatTime(message.createdAt),
                style: TextStyle(
                  fontSize: 11,
                  color: AppColors.grey600.withOpacity(0.6),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Format time
  String _formatTime(DateTime dateTime) {
    return DateFormat('HH:mm').format(dateTime);
  }
}
