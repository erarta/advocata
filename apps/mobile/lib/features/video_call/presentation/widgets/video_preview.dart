import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Video preview widget
///
/// Displays video feed from local or remote user
/// TODO: Integrate with Agora RTC Engine views
class VideoPreview extends StatelessWidget {
  final int uid;
  final bool isLocal;

  const VideoPreview({
    super.key,
    required this.uid,
    required this.isLocal,
  });

  @override
  Widget build(BuildContext context) {
    // TODO: Replace with actual Agora video view
    // For local: AgoraVideoView(controller: RtcLocalVideoViewController(...))
    // For remote: AgoraVideoView(controller: RtcRemoteVideoViewController(...))

    return Container(
      color: AppColors.grey900,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isLocal ? Icons.videocam : Icons.person,
              size: isLocal ? 40 : 80,
              color: Colors.white54,
            ),
            const SizedBox(height: 12),
            Text(
              isLocal ? 'Вы' : 'Юрист',
              style: TextStyle(
                color: Colors.white70,
                fontSize: isLocal ? 12 : 16,
              ),
            ),
            if (!isLocal) ...[
              const SizedBox(height: 8),
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white54),
                strokeWidth: 2,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
