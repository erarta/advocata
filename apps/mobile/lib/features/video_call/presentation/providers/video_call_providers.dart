import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/supabase_config.dart';
import '../../data/datasources/agora_datasource.dart';
import '../../data/datasources/video_call_remote_datasource.dart';
import '../../data/repositories/video_call_repository_impl.dart';
import '../../domain/repositories/video_call_repository.dart';
import '../../domain/usecases/create_video_session_usecase.dart';
import '../../domain/usecases/end_video_session_usecase.dart';
import '../../domain/usecases/join_video_session_usecase.dart';
import 'video_call_controller.dart';

/// Video call remote data source provider
final videoCallRemoteDataSourceProvider =
    Provider<VideoCallRemoteDataSource>((ref) {
  return VideoCallRemoteDataSourceImpl(
    supabaseClient: SupabaseConfig.client,
  );
});

/// Agora data source provider
final agoraDataSourceProvider = Provider<AgoraDataSource>((ref) {
  return AgoraDataSourceMock(); // TODO: Replace with real implementation
});

/// Video call repository provider
final videoCallRepositoryProvider = Provider<VideoCallRepository>((ref) {
  return VideoCallRepositoryImpl(
    remoteDataSource: ref.watch(videoCallRemoteDataSourceProvider),
    agoraDataSource: ref.watch(agoraDataSourceProvider),
  );
});

/// Create video session use case provider
final createVideoSessionUseCaseProvider =
    Provider<CreateVideoSessionUseCase>((ref) {
  return CreateVideoSessionUseCase(ref.watch(videoCallRepositoryProvider));
});

/// Join video session use case provider
final joinVideoSessionUseCaseProvider = Provider<JoinVideoSessionUseCase>((ref) {
  return JoinVideoSessionUseCase(ref.watch(videoCallRepositoryProvider));
});

/// End video session use case provider
final endVideoSessionUseCaseProvider = Provider<EndVideoSessionUseCase>((ref) {
  return EndVideoSessionUseCase(ref.watch(videoCallRepositoryProvider));
});

/// Video call controller provider
final videoCallControllerProvider =
    StateNotifierProvider.family<VideoCallController, VideoCallState, String>(
  (ref, consultationId) {
    return VideoCallController(
      consultationId: consultationId,
      createVideoSessionUseCase: ref.watch(createVideoSessionUseCaseProvider),
      joinVideoSessionUseCase: ref.watch(joinVideoSessionUseCaseProvider),
      endVideoSessionUseCase: ref.watch(endVideoSessionUseCaseProvider),
      agoraDataSource: ref.watch(agoraDataSourceProvider),
    );
  },
);
