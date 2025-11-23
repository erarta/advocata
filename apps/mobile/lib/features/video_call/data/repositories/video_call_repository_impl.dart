import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../domain/entities/video_session_entity.dart';
import '../../domain/repositories/video_call_repository.dart';
import '../datasources/agora_datasource.dart';
import '../datasources/video_call_remote_datasource.dart';

/// Video call repository implementation
class VideoCallRepositoryImpl implements VideoCallRepository {
  final VideoCallRemoteDataSource remoteDataSource;
  final AgoraDataSource agoraDataSource;

  VideoCallRepositoryImpl({
    required this.remoteDataSource,
    required this.agoraDataSource,
  });

  @override
  Future<Result<VideoSessionEntity>> createSession(
    String consultationId,
  ) async {
    try {
      final sessionModel = await remoteDataSource.createSession(consultationId);
      return Result.success(sessionModel.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
        message: e.message,
        code: e.code,
      ));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(
        message: e.message,
        code: e.code,
      ));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      return Result.failure(UnknownFailure(
        message: 'Неизвестная ошибка: $e',
      ));
    }
  }

  @override
  Future<Result<VideoSessionEntity>> joinSession(String sessionId) async {
    try {
      // Get session credentials from backend
      final sessionModel = await remoteDataSource.joinSession(sessionId);
      final session = sessionModel.toEntity();

      // Initialize and join Agora channel
      await agoraDataSource.joinChannel(
        token: session.token,
        channelName: session.channelName,
        uid: session.uid,
      );

      // Update session status to active
      await remoteDataSource.updateSessionStatus(
        sessionId: sessionId,
        status: 'active',
      );

      return Result.success(session);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
        message: e.message,
        code: e.code,
      ));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(
        message: e.message,
        code: e.code,
      ));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      return Result.failure(UnknownFailure(
        message: 'Неизвестная ошибка: $e',
      ));
    }
  }

  @override
  Future<Result<void>> endSession(String sessionId) async {
    try {
      // Leave Agora channel
      await agoraDataSource.leaveChannel();

      // Update backend
      await remoteDataSource.endSession(sessionId);

      return Result.success(null);
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(
        message: e.message,
        code: e.code,
      ));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      return Result.failure(UnknownFailure(
        message: 'Неизвестная ошибка: $e',
      ));
    }
  }

  @override
  Future<Result<VideoSessionEntity>> getSession(String sessionId) async {
    try {
      final sessionModel = await remoteDataSource.getSession(sessionId);
      return Result.success(sessionModel.toEntity());
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(
        message: e.message,
        code: e.code,
      ));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      return Result.failure(UnknownFailure(
        message: 'Неизвестная ошибка: $e',
      ));
    }
  }

  @override
  Future<Result<VideoSessionEntity>> updateSessionStatus({
    required String sessionId,
    required VideoSessionStatus status,
  }) async {
    try {
      final sessionModel = await remoteDataSource.updateSessionStatus(
        sessionId: sessionId,
        status: status.name,
      );
      return Result.success(sessionModel.toEntity());
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(
        message: e.message,
        code: e.code,
      ));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      return Result.failure(UnknownFailure(
        message: 'Неизвестная ошибка: $e',
      ));
    }
  }

  @override
  Future<Result<void>> reportNetworkQuality({
    required String sessionId,
    required int quality,
  }) async {
    try {
      await remoteDataSource.reportNetworkQuality(
        sessionId: sessionId,
        quality: quality,
      );
      return Result.success(null);
    } catch (e) {
      // Non-critical, don't fail
      return Result.success(null);
    }
  }
}
