import 'dart:io';
import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../entities/message_entity.dart';
import '../repositories/chat_repository.dart';

/// Use case for uploading file attachment
class UploadAttachmentUseCase {
  final ChatRepository repository;

  UploadAttachmentUseCase(this.repository);

  /// Execute the use case
  ///
  /// Uploads a file attachment for chat
  /// Returns Result with MessageAttachment or error
  Future<Result<MessageAttachment>> execute({
    required File file,
    required String consultationId,
  }) async {
    // Validate file exists
    if (!await file.exists()) {
      return Result.failure(
        const ValidationFailure(message: 'Файл не существует'),
      );
    }

    // Validate consultation ID
    if (consultationId.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(
          message: 'ID консультации не может быть пустым',
        ),
      );
    }

    // Check file size (max 10MB)
    final fileSize = await file.length();
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (fileSize > maxSize) {
      return Result.failure(
        const ValidationFailure(
          message: 'Размер файла не должен превышать 10 МБ',
        ),
      );
    }

    // Upload file via repository
    return await repository.uploadAttachment(
      file: file,
      consultationId: consultationId,
    );
  }
}
