import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../entities/message_entity.dart';
import '../repositories/chat_repository.dart';

/// Parameters for getting messages
class GetMessagesParams {
  final String consultationId;
  final int? limit;
  final String? beforeMessageId;

  const GetMessagesParams({
    required this.consultationId,
    this.limit,
    this.beforeMessageId,
  });
}

/// Use case for getting messages
class GetMessagesUseCase {
  final ChatRepository repository;

  GetMessagesUseCase(this.repository);

  /// Execute the use case
  ///
  /// Gets messages for a consultation with optional pagination
  /// Returns Result with list of MessageEntity or error
  Future<Result<List<MessageEntity>>> execute(GetMessagesParams params) async {
    // Validate consultation ID
    if (params.consultationId.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(
          message: 'ID консультации не может быть пустым',
        ),
      );
    }

    return await repository.getMessages(
      consultationId: params.consultationId,
      limit: params.limit,
      beforeMessageId: params.beforeMessageId,
    );
  }
}
