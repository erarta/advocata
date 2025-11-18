import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../entities/message_entity.dart';
import '../repositories/chat_repository.dart';

/// Parameters for sending a message
class SendMessageParams {
  final String consultationId;
  final String content;
  final MessageType type;

  const SendMessageParams({
    required this.consultationId,
    required this.content,
    this.type = MessageType.text,
  });

  /// Validate parameters
  Result<void> validate() {
    // Consultation ID validation
    if (consultationId.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(
          message: 'ID консультации не может быть пустым',
        ),
      );
    }

    // Content validation
    if (content.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(
          message: 'Сообщение не может быть пустым',
        ),
      );
    }

    if (content.length > 5000) {
      return Result.failure(
        const ValidationFailure(
          message: 'Сообщение не может быть длиннее 5000 символов',
        ),
      );
    }

    return Result.success(null);
  }
}

/// Use case for sending a message
class SendMessageUseCase {
  final ChatRepository repository;

  SendMessageUseCase(this.repository);

  /// Execute the use case
  ///
  /// Sends a text message to the consultation chat
  /// Returns Result with MessageEntity or error
  Future<Result<MessageEntity>> execute(SendMessageParams params) async {
    // Validate parameters
    final validationResult = params.validate();
    if (validationResult.isFailure) {
      return Result.failure(validationResult.failure);
    }

    // Send message via repository
    return await repository.sendMessage(
      consultationId: params.consultationId,
      content: params.content.trim(),
      type: params.type,
    );
  }
}
