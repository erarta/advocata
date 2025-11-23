import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Profile completion card
class ProfileCompletionCard extends StatelessWidget {
  final int percentage;
  final VoidCallback? onTap;

  const ProfileCompletionCard({
    super.key,
    required this.percentage,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Заполненность профиля',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '$percentage%',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: _getPercentageColor(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: percentage / 100,
              minHeight: 8,
              backgroundColor: AppColors.grey200,
              valueColor: AlwaysStoppedAnimation<Color>(_getPercentageColor()),
            ),
          ),
          if (percentage < 100) ...[
            const SizedBox(height: 12),
            Text(
              'Завершите профиль для лучшего опыта',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.grey600,
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: onTap,
              child: const Text('Заполнить профиль'),
            ),
          ],
        ],
      ),
    );
  }

  Color _getPercentageColor() {
    if (percentage >= 80) return AppColors.success;
    if (percentage >= 50) return AppColors.warning;
    return AppColors.error;
  }
}
