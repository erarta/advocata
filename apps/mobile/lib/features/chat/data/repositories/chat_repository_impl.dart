import 'dart:io';
import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../domain/entities/message_entity.dart';
import '../../domain/repositories/chat_repository.dart';
import '../datasources/chat_remote_datasource.dart';

/// Chat repository implementation
class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDataSource remoteDataSource;

  ChatRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Result<List<MessageEntity>>> getMessages({
    required String consultationId,
    int? limit,
    String? beforeMessageId,
  }) async {
    try {
      final messages = await remoteDataSource.getMessages(
        consultationId: consultationId,
        limit: limit,
        beforeMessageId: beforeMessageId,
      );

      return Result.success(
        messages.map((model) => model.toEntity()).toList(),
      );
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Неизвестная ошибка: $e'),
      );
    }
  }

  @override
  Future<Result<MessageEntity>> sendMessage({
    required String consultationId,
    required String content,
    required MessageType type,
  }) async {
    try {
      final message = await remoteDataSource.sendMessage(
        consultationId: consultationId,
        content: content,
        type: _mapMessageTypeToString(type),
      );

      return Result.success(message.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Не удалось отправить сообщение: $e'),
      );
    }
  }

  @override
  Future<Result<MessageAttachment>> uploadAttachment({
    required File file,
    required String consultationId,
  }) async {
    try {
      final attachment = await remoteDataSource.uploadAttachment(
        file: file,
        consultationId: consultationId,
      );

      return Result.success(attachment.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Не удалось загрузить файл: $e'),
      );
    }
  }

  @override
  Future<Result<void>> markAsRead({required String messageId}) async {
    try {
      await remoteDataSource.markAsRead(messageId: messageId);
      return Result.success(null);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Не удалось отметить сообщение прочитанным: $e'),
      );
    }
  }

  @override
  Future<Result<void>> markAllAsRead({required String consultationId}) async {
    try {
      await remoteDataSource.markAllAsRead(consultationId: consultationId);
      return Result.success(null);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Не удалось отметить сообщения прочитанными: $e'),
      );
    }
  }

  @override
  Future<Result<void>> updateTypingStatus({
    required String consultationId,
    required bool isTyping,
  }) async {
    try {
      await remoteDataSource.updateTypingStatus(
        consultationId: consultationId,
        isTyping: isTyping,
      );
      return Result.success(null);
    } catch (e) {
      // Silently fail for typing indicators - not critical
      return Result.success(null);
    }
  }

  @override
  Stream<MessageEntity> watchMessages(String consultationId) {
    try {
      return remoteDataSource
          .watchMessages(consultationId)
          .map((model) => model.toEntity());
    } catch (e) {
      return Stream.error(
        ServerFailure(message: 'Не удалось подключиться к чату: $e'),
      );
    }
  }

  @override
  Stream<bool> watchTypingStatus(String consultationId) {
    try {
      return remoteDataSource.watchTypingStatus(consultationId).map((state) {
        // Check if any user (except current) is typing
        if (state.isEmpty) return false;

        // Get current timestamp
        final now = DateTime.now();

        // Check if any presence is recent (within 3 seconds)
        for (final entry in state.entries) {
          final presences = entry.value as List;
          for (final presence in presences) {
            if (presence['typing'] == true) {
              final timestamp =
                  DateTime.parse(presence['timestamp'] as String);
              final difference = now.difference(timestamp).inSeconds;
              if (difference < 3) {
                return true;
              }
            }
          }
        }

        return false;
      });
    } catch (e) {
      // Return false stream if error - typing indicator not critical
      return Stream.value(false);
    }
  }

  @override
  Future<Result<void>> deleteMessage({required String messageId}) async {
    try {
      await remoteDataSource.deleteMessage(messageId: messageId);
      return Result.success(null);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message));
    } catch (e) {
      return Result.failure(
        ServerFailure(message: 'Не удалось удалить сообщение: $e'),
      );
    }
  }

  /// Map MessageType enum to string for API
  String _mapMessageTypeToString(MessageType type) {
    switch (type) {
      case MessageType.text:
        return 'text';
      case MessageType.image:
        return 'image';
      case MessageType.document:
        return 'document';
      case MessageType.audio:
        return 'audio';
      case MessageType.video:
        return 'video';
      case MessageType.system:
        return 'system';
    }
  }
}
