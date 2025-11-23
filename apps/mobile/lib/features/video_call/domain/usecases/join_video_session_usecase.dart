import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../entities/video_session_entity.dart';
import '../repositories/video_call_repository.dart';

/// Use case for joining a video session
class JoinVideoSessionUseCase {
  final VideoCallRepository repository;

  JoinVideoSessionUseCase(this.repository);

  /// Execute the use case
  ///
  /// Joins an existing video session
  /// Returns Result with VideoSessionEntity or error
  Future<Result<VideoSessionEntity>> execute(String sessionId) async {
    // Validate session ID
    if (sessionId.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(
          message: 'ID сессии не может быть пустым',
        ),
      );
    }

    return await repository.joinSession(sessionId);
  }
}
