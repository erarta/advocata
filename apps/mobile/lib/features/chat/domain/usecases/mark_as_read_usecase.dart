import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../repositories/chat_repository.dart';

/// Use case for marking message as read
class MarkAsReadUseCase {
  final ChatRepository repository;

  MarkAsReadUseCase(this.repository);

  /// Execute the use case
  ///
  /// Marks a message as read
  /// Returns Result with void or error
  Future<Result<void>> execute(String messageId) async {
    // Validate message ID
    if (messageId.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(
          message: 'ID сообщения не может быть пустым',
        ),
      );
    }

    return await repository.markAsRead(messageId: messageId);
  }
}

/// Use case for marking all messages as read
class MarkAllAsReadUseCase {
  final ChatRepository repository;

  MarkAllAsReadUseCase(this.repository);

  /// Execute the use case
  ///
  /// Marks all messages in consultation as read
  /// Returns Result with void or error
  Future<Result<void>> execute(String consultationId) async {
    // Validate consultation ID
    if (consultationId.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(
          message: 'ID консультации не может быть пустым',
        ),
      );
    }

    return await repository.markAllAsRead(consultationId: consultationId);
  }
}
