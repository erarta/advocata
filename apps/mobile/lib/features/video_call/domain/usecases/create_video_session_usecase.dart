import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../entities/video_session_entity.dart';
import '../repositories/video_call_repository.dart';

/// Use case for creating a video session
class CreateVideoSessionUseCase {
  final VideoCallRepository repository;

  CreateVideoSessionUseCase(this.repository);

  /// Execute the use case
  ///
  /// Creates a new video session for the given consultation
  /// Returns Result with VideoSessionEntity or error
  Future<Result<VideoSessionEntity>> execute(String consultationId) async {
    // Validate consultation ID
    if (consultationId.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(
          message: 'ID консультации не может быть пустым',
        ),
      );
    }

    return await repository.createSession(consultationId);
  }
}
