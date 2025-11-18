import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../repositories/video_call_repository.dart';

/// Use case for ending a video session
class EndVideoSessionUseCase {
  final VideoCallRepository repository;

  EndVideoSessionUseCase(this.repository);

  /// Execute the use case
  ///
  /// Ends the current video session
  /// Returns Result with void or error
  Future<Result<void>> execute(String sessionId) async {
    // Validate session ID
    if (sessionId.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(
          message: 'ID сессии не может быть пустым',
        ),
      );
    }

    return await repository.endSession(sessionId);
  }
}
