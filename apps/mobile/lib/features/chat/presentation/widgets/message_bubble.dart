import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../config/supabase_config.dart';
import '../../../../core/presentation/theme/app_colors.dart';
import '../../domain/entities/message_entity.dart';

/// Message bubble widget
class MessageBubble extends StatelessWidget {
  final MessageEntity message;

  const MessageBubble({
    Key? key,
    required this.message,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final currentUserId = SupabaseConfig.currentUser?.id;
    final isMine = message.isMine(currentUserId ?? '');

    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        child: Column(
          crossAxisAlignment:
              isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            // Message bubble
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 10,
              ),
              decoration: BoxDecoration(
                color: isMine ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isMine ? 16 : 4),
                  bottomRight: Radius.circular(isMine ? 4 : 16),
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
                  if (!isMine && message.senderName != null) ...[
                    Text(
                      message.senderName!,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 4),
                  ],

                  // Attachment preview
                  if (message.hasAttachments) ...[
                    ...message.attachments.map(
                      (attachment) => _buildAttachment(attachment),
                    ),
                    const SizedBox(height: 8),
                  ],

                  // Message content
                  if (message.type == MessageType.system)
                    Text(
                      message.content,
                      style: TextStyle(
                        fontSize: 13,
                        fontStyle: FontStyle.italic,
                        color: isMine
                            ? Colors.white.withOpacity(0.8)
                            : AppColors.textSecondary,
                      ),
                    )
                  else
                    Text(
                      message.content,
                      style: TextStyle(
                        fontSize: 15,
                        color: isMine ? Colors.white : AppColors.textPrimary,
                        height: 1.4,
                      ),
                    ),
                ],
              ),
            ),

            // Message metadata (time + status)
            Padding(
              padding: const EdgeInsets.only(top: 4, left: 4, right: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Time
                  Text(
                    _formatTime(message.createdAt),
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary.withOpacity(0.6),
                    ),
                  ),

                  // Status indicator (for sent messages)
                  if (isMine) ...[
                    const SizedBox(width: 4),
                    _buildStatusIcon(),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build attachment preview
  Widget _buildAttachment(MessageAttachment attachment) {
    if (attachment.mimeType.startsWith('image/')) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: Image.network(
          attachment.fileUrl,
          width: 200,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            return Container(
              width: 200,
              height: 150,
              color: AppColors.surface,
              child: const Icon(Icons.broken_image),
            );
          },
        ),
      );
    }

    // Document/file attachment
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getFileIcon(attachment.mimeType),
            size: 24,
            color: Colors.white,
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  attachment.fileName,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  _formatFileSize(attachment.fileSize),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.7),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Build status icon
  Widget _buildStatusIcon() {
    IconData icon;
    Color color;

    switch (message.status) {
      case MessageStatus.sending:
        icon = Icons.schedule;
        color = AppColors.textSecondary.withOpacity(0.4);
        break;
      case MessageStatus.sent:
        icon = Icons.check;
        color = AppColors.textSecondary.withOpacity(0.6);
        break;
      case MessageStatus.delivered:
        icon = Icons.done_all;
        color = AppColors.textSecondary.withOpacity(0.6);
        break;
      case MessageStatus.read:
        icon = Icons.done_all;
        color = AppColors.primary;
        break;
      case MessageStatus.failed:
        icon = Icons.error_outline;
        color = AppColors.error;
        break;
    }

    return Icon(
      icon,
      size: 14,
      color: color,
    );
  }

  /// Format time
  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final messageDate = DateTime(dateTime.year, dateTime.month, dateTime.day);

    if (messageDate == today) {
      // Today: show time only
      return DateFormat('HH:mm').format(dateTime);
    } else if (messageDate == today.subtract(const Duration(days: 1))) {
      // Yesterday
      return 'Вчера ${DateFormat('HH:mm').format(dateTime)}';
    } else if (dateTime.year == now.year) {
      // This year: show date without year
      return DateFormat('d MMM, HH:mm', 'ru_RU').format(dateTime);
    } else {
      // Other years: show full date
      return DateFormat('d MMM yyyy, HH:mm', 'ru_RU').format(dateTime);
    }
  }

  /// Format file size
  String _formatFileSize(int bytes) {
    if (bytes < 1024) {
      return '$bytes B';
    } else if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    } else {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
  }

  /// Get file icon based on MIME type
  IconData _getFileIcon(String mimeType) {
    if (mimeType.startsWith('image/')) {
      return Icons.image;
    } else if (mimeType.startsWith('audio/')) {
      return Icons.audiotrack;
    } else if (mimeType.startsWith('video/')) {
      return Icons.videocam;
    } else if (mimeType.contains('pdf')) {
      return Icons.picture_as_pdf;
    } else if (mimeType.contains('word') || mimeType.contains('document')) {
      return Icons.description;
    } else {
      return Icons.insert_drive_file;
    }
  }
}
