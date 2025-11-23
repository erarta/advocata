import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import '../../data/datasources/agora_datasource.dart';
import '../../domain/entities/call_settings_entity.dart';
import '../../domain/entities/video_session_entity.dart';
import '../../domain/usecases/create_video_session_usecase.dart';
import '../../domain/usecases/end_video_session_usecase.dart';
import '../../domain/usecases/join_video_session_usecase.dart';

part 'video_call_controller.freezed.dart';

/// Video call state
@freezed
class VideoCallState with _$VideoCallState {
  const factory VideoCallState.initial() = _Initial;
  const factory VideoCallState.connecting() = _Connecting;
  const factory VideoCallState.connected({
    required VideoSessionEntity session,
    required CallSettingsEntity settings,
    int? remoteUid,
    int networkQuality,
  }) = _Connected;
  const factory VideoCallState.ended() = _Ended;
  const factory VideoCallState.error(String message) = _Error;
}

/// Video call controller
class VideoCallController extends StateNotifier<VideoCallState> {
  final String consultationId;
  final CreateVideoSessionUseCase createVideoSessionUseCase;
  final JoinVideoSessionUseCase joinVideoSessionUseCase;
  final EndVideoSessionUseCase endVideoSessionUseCase;
  final AgoraDataSource agoraDataSource;

  VideoSessionEntity? _currentSession;
  CallSettingsEntity _callSettings = const CallSettingsEntity();

  VideoCallController({
    required this.consultationId,
    required this.createVideoSessionUseCase,
    required this.joinVideoSessionUseCase,
    required this.endVideoSessionUseCase,
    required this.agoraDataSource,
  }) : super(const VideoCallState.initial()) {
    _initializeCall();
  }

  /// Initialize and start the call
  Future<void> _initializeCall() async {
    state = const VideoCallState.connecting();

    try {
      // Create or join session
      final result = await createVideoSessionUseCase.execute(consultationId);

      result.fold(
        onSuccess: (session) async {
          _currentSession = session;

          // Initialize Agora
          await agoraDataSource.initialize('YOUR_AGORA_APP_ID'); // TODO: Move to config

          // Join channel
          await agoraDataSource.joinChannel(
            token: session.token,
            channelName: session.channelName,
            uid: session.uid,
          );

          // Listen to remote user joined
          agoraDataSource.onUserJoined.listen((remoteUid) {
            _updateStateWithRemoteUser(remoteUid);
          });

          // Listen to network quality
          agoraDataSource.onNetworkQuality.listen((quality) {
            _updateNetworkQuality(quality);
          });

          state = VideoCallState.connected(
            session: session,
            settings: _callSettings,
            networkQuality: 5,
          );
        },
        onFailure: (failure) {
          state = VideoCallState.error(failure.message);
        },
      );
    } catch (e) {
      state = VideoCallState.error('Ошибка подключения: $e');
    }
  }

  /// Toggle microphone
  Future<void> toggleMicrophone() async {
    final newSettings = _callSettings.copyWith(
      isMicrophoneEnabled: !_callSettings.isMicrophoneEnabled,
    );

    await agoraDataSource.enableLocalAudio(newSettings.isMicrophoneEnabled);
    _callSettings = newSettings;

    _updateSettings();
  }

  /// Toggle camera
  Future<void> toggleCamera() async {
    final newSettings = _callSettings.copyWith(
      isCameraEnabled: !_callSettings.isCameraEnabled,
    );

    await agoraDataSource.enableLocalVideo(newSettings.isCameraEnabled);
    _callSettings = newSettings;

    _updateSettings();
  }

  /// Switch camera (front/back)
  Future<void> switchCamera() async {
    await agoraDataSource.switchCamera();

    final newPosition = _callSettings.cameraPosition == CameraPosition.front
        ? CameraPosition.back
        : CameraPosition.front;

    _callSettings = _callSettings.copyWith(cameraPosition: newPosition);
    _updateSettings();
  }

  /// Toggle speaker
  Future<void> toggleSpeaker() async {
    final newSettings = _callSettings.copyWith(
      isSpeakerEnabled: !_callSettings.isSpeakerEnabled,
    );

    await agoraDataSource.setEnableSpeakerphone(newSettings.isSpeakerEnabled);
    _callSettings = newSettings;

    _updateSettings();
  }

  /// End call
  Future<void> endCall() async {
    if (_currentSession == null) return;

    await agoraDataSource.leaveChannel();
    await endVideoSessionUseCase.execute(_currentSession!.id);

    state = const VideoCallState.ended();
  }

  /// Update state with remote user
  void _updateStateWithRemoteUser(int remoteUid) {
    if (state is _Connected) {
      state = (state as _Connected).copyWith(remoteUid: remoteUid);
    }
  }

  /// Update network quality
  void _updateNetworkQuality(int quality) {
    if (state is _Connected) {
      state = (state as _Connected).copyWith(networkQuality: quality);
    }
  }

  /// Update settings in state
  void _updateSettings() {
    if (state is _Connected) {
      state = (state as _Connected).copyWith(settings: _callSettings);
    }
  }

  @override
  void dispose() {
    agoraDataSource.dispose();
    super.dispose();
  }
}
