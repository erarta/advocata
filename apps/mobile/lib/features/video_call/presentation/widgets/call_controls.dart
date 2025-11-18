import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Call controls widget
class CallControls extends StatelessWidget {
  final bool isMicEnabled;
  final bool isCameraEnabled;
  final bool isSpeakerEnabled;
  final VoidCallback onMicToggle;
  final VoidCallback onCameraToggle;
  final VoidCallback onSwitchCamera;
  final VoidCallback onSpeakerToggle;
  final VoidCallback onEndCall;

  const CallControls({
    super.key,
    required this.isMicEnabled,
    required this.isCameraEnabled,
    required this.isSpeakerEnabled,
    required this.onMicToggle,
    required this.onCameraToggle,
    required this.onSwitchCamera,
    required this.onSpeakerToggle,
    required this.onEndCall,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // Microphone
          _buildControlButton(
            icon: isMicEnabled ? Icons.mic : Icons.mic_off,
            isActive: isMicEnabled,
            onPressed: onMicToggle,
          ),

          // Camera
          _buildControlButton(
            icon: isCameraEnabled ? Icons.videocam : Icons.videocam_off,
            isActive: isCameraEnabled,
            onPressed: onCameraToggle,
          ),

          // Switch camera
          _buildControlButton(
            icon: Icons.flip_camera_ios,
            isActive: true,
            onPressed: onSwitchCamera,
          ),

          // Speaker
          _buildControlButton(
            icon: isSpeakerEnabled ? Icons.volume_up : Icons.volume_off,
            isActive: isSpeakerEnabled,
            onPressed: onSpeakerToggle,
          ),

          // End call
          _buildEndCallButton(onEndCall),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required bool isActive,
    required VoidCallback onPressed,
  }) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isActive ? Colors.white.withOpacity(0.2) : Colors.red.withOpacity(0.3),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(icon),
        color: Colors.white,
        iconSize: 28,
        onPressed: onPressed,
      ),
    );
  }

  Widget _buildEndCallButton(VoidCallback onPressed) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: AppColors.error,
        boxShadow: [
          BoxShadow(
            color: AppColors.error.withOpacity(0.5),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: IconButton(
        icon: const Icon(Icons.call_end),
        color: Colors.white,
        iconSize: 32,
        onPressed: onPressed,
      ),
    );
  }
}
