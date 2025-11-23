import '../../../../core/domain/result/result.dart';
import '../entities/video_session_entity.dart';

/// Video call repository interface
abstract class VideoCallRepository {
  /// Create a new video session for consultation
  Future<Result<VideoSessionEntity>> createSession(String consultationId);

  /// Join an existing video session
  Future<Result<VideoSessionEntity>> joinSession(String sessionId);

  /// End the current video session
  Future<Result<void>> endSession(String sessionId);

  /// Get video session by ID
  Future<Result<VideoSessionEntity>> getSession(String sessionId);

  /// Update session status
  Future<Result<VideoSessionEntity>> updateSessionStatus({
    required String sessionId,
    required VideoSessionStatus status,
  });

  /// Report network quality
  Future<Result<void>> reportNetworkQuality({
    required String sessionId,
    required int quality, // 0-5 scale
  });
}
