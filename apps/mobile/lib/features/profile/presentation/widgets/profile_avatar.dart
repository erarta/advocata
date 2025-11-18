import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Profile avatar widget
class ProfileAvatar extends StatelessWidget {
  final String? avatarUrl;
  final String initials;
  final double size;
  final VoidCallback? onTap;

  const ProfileAvatar({
    super.key,
    this.avatarUrl,
    required this.initials,
    this.size = 40,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: Colors.white,
            width: 3,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipOval(
          child: avatarUrl != null && avatarUrl!.isNotEmpty
              ? Image.network(
                  avatarUrl!,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      _buildInitialsAvatar(),
                )
              : _buildInitialsAvatar(),
        ),
      ),
    );
  }

  Widget _buildInitialsAvatar() {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
      ),
      child: Center(
        child: Text(
          initials,
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.4,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
