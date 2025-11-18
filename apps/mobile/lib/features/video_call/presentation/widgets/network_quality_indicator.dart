import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Network quality indicator widget
class NetworkQualityIndicator extends StatelessWidget {
  final int quality; // 0-5 scale

  const NetworkQualityIndicator({
    super.key,
    required this.quality,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getIcon(),
            color: _getColor(),
            size: 20,
          ),
          const SizedBox(width: 8),
          Text(
            _getLabel(),
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIcon() {
    if (quality >= 4) return Icons.signal_cellular_alt;
    if (quality >= 2) return Icons.signal_cellular_alt_2_bar;
    return Icons.signal_cellular_alt_1_bar;
  }

  Color _getColor() {
    if (quality >= 4) return AppColors.success;
    if (quality >= 2) return AppColors.warning;
    return AppColors.error;
  }

  String _getLabel() {
    if (quality >= 4) return 'Отличное';
    if (quality >= 2) return 'Среднее';
    return 'Плохое';
  }
}
