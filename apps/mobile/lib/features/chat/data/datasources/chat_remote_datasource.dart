import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../models/message_model.dart';

/// Chat remote data source
abstract class ChatRemoteDataSource {
  /// Get messages for a consultation
  Future<List<MessageModel>> getMessages({
    required String consultationId,
    int? limit,
    String? beforeMessageId,
  });

  /// Send a text message
  Future<MessageModel> sendMessage({
    required String consultationId,
    required String content,
    required String type,
  });

  /// Upload file attachment
  Future<MessageAttachmentModel> uploadAttachment({
    required File file,
    required String consultationId,
  });

  /// Mark message as read
  Future<void> markAsRead({required String messageId});

  /// Mark all messages in consultation as read
  Future<void> markAllAsRead({required String consultationId});

  /// Update typing status
  Future<void> updateTypingStatus({
    required String consultationId,
    required bool isTyping,
  });

  /// Watch messages in real-time
  Stream<MessageModel> watchMessages(String consultationId);

  /// Watch typing status in real-time
  Stream<Map<String, dynamic>> watchTypingStatus(String consultationId);

  /// Delete message (soft delete)
  Future<void> deleteMessage({required String messageId});
}

/// Chat remote data source implementation using Supabase
class ChatRemoteDataSourceImpl implements ChatRemoteDataSource {
  final SupabaseClient supabaseClient;

  ChatRemoteDataSourceImpl({required this.supabaseClient});

  @override
  Future<List<MessageModel>> getMessages({
    required String consultationId,
    int? limit,
    String? beforeMessageId,
  }) async {
    try {
      var query = supabaseClient
          .from('messages')
          .select('*, attachments:message_attachments(*)')
          .eq('consultation_id', consultationId)
          .order('created_at', ascending: false);

      if (limit != null) {
        query = query.limit(limit);
      }

      if (beforeMessageId != null) {
        // Get timestamp of the beforeMessage
        final beforeMessage = await supabaseClient
            .from('messages')
            .select('created_at')
            .eq('id', beforeMessageId)
            .single();

        query = query.lt('created_at', beforeMessage['created_at']);
      }

      final response = await query;

      return (response as List<dynamic>)
          .map((json) => MessageModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on PostgrestException catch (e) {
      throw ServerException(
        message: 'Не удалось загрузить сообщения: ${e.message}',
      );
    } catch (e) {
      throw ServerException(message: 'Не удалось загрузить сообщения: $e');
    }
  }

  @override
  Future<MessageModel> sendMessage({
    required String consultationId,
    required String content,
    required String type,
  }) async {
    try {
      final currentUser = supabaseClient.auth.currentUser;
      if (currentUser == null) {
        throw const AuthenticationException(
          message: 'Требуется авторизация для отправки сообщения',
        );
      }

      // Get sender info
      final userProfile = await supabaseClient
          .from('users')
          .select('first_name, last_name, avatar_url')
          .eq('id', currentUser.id)
          .single();

      final senderName = userProfile['first_name'] != null &&
              userProfile['last_name'] != null
          ? '${userProfile['first_name']} ${userProfile['last_name']}'
          : currentUser.phone ?? 'Пользователь';

      // Insert message
      final messageData = {
        'consultation_id': consultationId,
        'sender_id': currentUser.id,
        'sender_name': senderName,
        'sender_avatar': userProfile['avatar_url'],
        'content': content,
        'type': type,
        'status': 'sent',
        'created_at': DateTime.now().toIso8601String(),
      };

      final response = await supabaseClient
          .from('messages')
          .insert(messageData)
          .select('*, attachments:message_attachments(*)')
          .single();

      return MessageModel.fromJson(response);
    } on PostgrestException catch (e) {
      throw ServerException(
        message: 'Не удалось отправить сообщение: ${e.message}',
      );
    } on AuthenticationException {
      rethrow;
    } catch (e) {
      throw ServerException(message: 'Не удалось отправить сообщение: $e');
    }
  }

  @override
  Future<MessageAttachmentModel> uploadAttachment({
    required File file,
    required String consultationId,
  }) async {
    try {
      final currentUser = supabaseClient.auth.currentUser;
      if (currentUser == null) {
        throw const AuthenticationException(
          message: 'Требуется авторизация для загрузки файлов',
        );
      }

      // Generate unique file name
      final fileName = file.path.split('/').last;
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final extension = fileName.split('.').last;
      final uniqueFileName =
          'consultations/$consultationId/${timestamp}_$fileName';

      // Upload file to Supabase Storage
      final uploadPath = await supabaseClient.storage
          .from('attachments')
          .upload(uniqueFileName, file);

      // Get public URL
      final fileUrl = supabaseClient.storage
          .from('attachments')
          .getPublicUrl(uniqueFileName);

      // Get file size
      final fileSize = await file.length();

      // Determine MIME type
      final mimeType = _getMimeType(extension);

      // Create attachment record
      final attachmentData = {
        'file_name': fileName,
        'file_url': fileUrl,
        'file_size': fileSize,
        'mime_type': mimeType,
      };

      return MessageAttachmentModel.fromJson({
        'id': uploadPath.hashCode.toString(), // Temporary ID
        ...attachmentData,
      });
    } on StorageException catch (e) {
      throw ServerException(
        message: 'Не удалось загрузить файл: ${e.message}',
      );
    } on AuthenticationException {
      rethrow;
    } catch (e) {
      throw ServerException(message: 'Не удалось загрузить файл: $e');
    }
  }

  @override
  Future<void> markAsRead({required String messageId}) async {
    try {
      final currentUser = supabaseClient.auth.currentUser;
      if (currentUser == null) {
        throw const AuthenticationException(
          message: 'Требуется авторизация',
        );
      }

      await supabaseClient.from('messages').update({
        'status': 'read',
        'read_at': DateTime.now().toIso8601String(),
      }).eq('id', messageId).neq('sender_id', currentUser.id); // Don't mark own messages

    } on PostgrestException catch (e) {
      throw ServerException(
        message: 'Не удалось отметить сообщение прочитанным: ${e.message}',
      );
    } on AuthenticationException {
      rethrow;
    } catch (e) {
      throw ServerException(
        message: 'Не удалось отметить сообщение прочитанным: $e',
      );
    }
  }

  @override
  Future<void> markAllAsRead({required String consultationId}) async {
    try {
      final currentUser = supabaseClient.auth.currentUser;
      if (currentUser == null) {
        throw const AuthenticationException(
          message: 'Требуется авторизация',
        );
      }

      await supabaseClient
          .from('messages')
          .update({
            'status': 'read',
            'read_at': DateTime.now().toIso8601String(),
          })
          .eq('consultation_id', consultationId)
          .neq('sender_id', currentUser.id) // Don't mark own messages
          .or('status.eq.sent,status.eq.delivered');
    } on PostgrestException catch (e) {
      throw ServerException(
        message: 'Не удалось отметить сообщения прочитанными: ${e.message}',
      );
    } on AuthenticationException {
      rethrow;
    } catch (e) {
      throw ServerException(
        message: 'Не удалось отметить сообщения прочитанными: $e',
      );
    }
  }

  @override
  Future<void> updateTypingStatus({
    required String consultationId,
    required bool isTyping,
  }) async {
    try {
      final currentUser = supabaseClient.auth.currentUser;
      if (currentUser == null) return;

      // Send typing status via Realtime presence
      final channel = supabaseClient.channel('consultation:$consultationId');

      if (isTyping) {
        await channel.track({
          'user_id': currentUser.id,
          'typing': true,
          'timestamp': DateTime.now().toIso8601String(),
        });
      } else {
        await channel.untrack();
      }
    } catch (e) {
      // Silently fail for typing indicators - not critical
      return;
    }
  }

  @override
  Stream<MessageModel> watchMessages(String consultationId) {
    try {
      return supabaseClient
          .from('messages')
          .stream(primaryKey: ['id'])
          .eq('consultation_id', consultationId)
          .order('created_at')
          .map((data) {
            // Get the latest message from the stream
            if (data.isEmpty) {
              throw const ServerException(message: 'No message data');
            }

            final latestMessage = data.last as Map<String, dynamic>;
            return MessageModel.fromJson(latestMessage);
          });
    } catch (e) {
      throw ServerException(
        message: 'Не удалось подключиться к чату: $e',
      );
    }
  }

  @override
  Stream<Map<String, dynamic>> watchTypingStatus(String consultationId) {
    try {
      final channel = supabaseClient
          .channel('consultation:$consultationId')
          .onPresenceSync((payload) {
            // Presence sync event
          }).onPresenceJoin((payload) {
            // User joined
          }).onPresenceLeave((payload) {
            // User left
          });

      // Subscribe to channel
      channel.subscribe();

      // Return presence state as stream
      return Stream.periodic(
        const Duration(milliseconds: 500),
        (_) => channel.presenceState(),
      );
    } catch (e) {
      throw ServerException(
        message: 'Не удалось подключиться к индикатору набора текста: $e',
      );
    }
  }

  @override
  Future<void> deleteMessage({required String messageId}) async {
    try {
      final currentUser = supabaseClient.auth.currentUser;
      if (currentUser == null) {
        throw const AuthenticationException(
          message: 'Требуется авторизация',
        );
      }

      // Soft delete - just mark as deleted
      await supabaseClient
          .from('messages')
          .update({
            'content': 'Сообщение удалено',
            'type': 'system',
            'deleted_at': DateTime.now().toIso8601String(),
          })
          .eq('id', messageId)
          .eq('sender_id', currentUser.id); // Can only delete own messages
    } on PostgrestException catch (e) {
      throw ServerException(
        message: 'Не удалось удалить сообщение: ${e.message}',
      );
    } on AuthenticationException {
      rethrow;
    } catch (e) {
      throw ServerException(message: 'Не удалось удалить сообщение: $e');
    }
  }

  /// Get MIME type from file extension
  String _getMimeType(String extension) {
    final ext = extension.toLowerCase();
    switch (ext) {
      // Images
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';

      // Documents
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      // Audio
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'm4a':
        return 'audio/m4a';

      // Video
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';

      default:
        return 'application/octet-stream';
    }
  }
}
