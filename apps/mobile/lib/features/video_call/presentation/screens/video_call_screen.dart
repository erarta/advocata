import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/video_call_controller.dart';
import '../providers/video_call_providers.dart';
import '../widgets/call_controls.dart';
import '../widgets/network_quality_indicator.dart';
import '../widgets/video_preview.dart';

/// Video call screen
class VideoCallScreen extends ConsumerWidget {
  final String consultationId;

  const VideoCallScreen({
    super.key,
    required this.consultationId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(videoCallControllerProvider(consultationId));

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: state.when(
          initial: () => _buildLoadingState(),
          connecting: () => _buildConnectingState(),
          connected: (session, settings, remoteUid, networkQuality) =>
              _buildConnectedState(
            context,
            ref,
            settings,
            remoteUid,
            networkQuality,
          ),
          ended: () {
            // Navigate back when call ends
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (context.mounted) {
                context.pop();
              }
            });
            return _buildEndedState();
          },
          error: (message) => _buildErrorState(context, message),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
      ),
    );
  }

  Widget _buildConnectingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
          ),
          const SizedBox(height: 24),
          Text(
            'Подключение...',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConnectedState(
    BuildContext context,
    WidgetRef ref,
    settings,
    int? remoteUid,
    int networkQuality,
  ) {
    final controller = ref.read(videoCallControllerProvider(consultationId).notifier);

    return Stack(
      children: [
        // Remote video (full screen)
        if (remoteUid != null)
          Positioned.fill(
            child: VideoPreview(
              uid: remoteUid,
              isLocal: false,
            ),
          )
        else
          Positioned.fill(
            child: Container(
              color: AppColors.grey900,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.person_outline,
                      size: 80,
                      color: Colors.white54,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Ожидание подключения юриста...',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

        // Local video preview (small, top right)
        if (settings.isCameraEnabled)
          Positioned(
            top: 16,
            right: 16,
            width: 120,
            height: 160,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: Colors.white,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const VideoPreview(
                  uid: 0, // Local user
                  isLocal: true,
                ),
              ),
            ),
          ),

        // Network quality indicator (top left)
        Positioned(
          top: 16,
          left: 16,
          child: NetworkQualityIndicator(quality: networkQuality),
        ),

        // Call controls (bottom)
        Positioned(
          bottom: 32,
          left: 0,
          right: 0,
          child: CallControls(
            isMicEnabled: settings.isMicrophoneEnabled,
            isCameraEnabled: settings.isCameraEnabled,
            isSpeakerEnabled: settings.isSpeakerEnabled,
            onMicToggle: () => controller.toggleMicrophone(),
            onCameraToggle: () => controller.toggleCamera(),
            onSwitchCamera: () => controller.switchCamera(),
            onSpeakerToggle: () => controller.toggleSpeaker(),
            onEndCall: () => _showEndCallConfirmation(context, controller),
          ),
        ),
      ],
    );
  }

  Widget _buildEndedState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.call_end,
            size: 64,
            color: Colors.white,
          ),
          const SizedBox(height: 24),
          Text(
            'Звонок завершен',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 24),
            Text(
              'Ошибка подключения',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              message,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.pop(),
              child: const Text('Вернуться назад'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showEndCallConfirmation(
    BuildContext context,
    VideoCallController controller,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Завершить звонок?'),
        content: const Text('Вы действительно хотите завершить видеозвонок?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Завершить'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await controller.endCall();
    }
  }
}
