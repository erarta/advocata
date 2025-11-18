import 'package:flutter/material.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';

/// Badge widget for displaying consultation status
class ConsultationStatusBadge extends StatelessWidget {
  final ConsultationStatus status;
  final bool compact;

  const ConsultationStatusBadge({
    super.key,
    required this.status,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getStatusConfig(status);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 12,
        vertical: compact ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: config.color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(compact ? 12 : 16),
        border: Border.all(
          color: config.color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            config.icon,
            size: compact ? 12 : 14,
            color: config.color,
          ),
          const SizedBox(width: 4),
          Text(
            config.label,
            style: TextStyle(
              fontSize: compact ? 11 : 12,
              fontWeight: FontWeight.w600,
              color: config.color,
            ),
          ),
        ],
      ),
    );
  }

  /// Get status configuration
  _StatusConfig _getStatusConfig(ConsultationStatus status) {
    switch (status) {
      case ConsultationStatus.pending:
        return _StatusConfig(
          label: 'Ожидает',
          icon: Icons.schedule_rounded,
          color: Colors.orange,
        );

      case ConsultationStatus.confirmed:
        return _StatusConfig(
          label: 'Подтверждена',
          icon: Icons.check_circle_outline_rounded,
          color: Colors.blue,
        );

      case ConsultationStatus.active:
        return _StatusConfig(
          label: 'Идет',
          icon: Icons.play_circle_outline_rounded,
          color: Colors.green,
        );

      case ConsultationStatus.completed:
        return _StatusConfig(
          label: 'Завершена',
          icon: Icons.check_circle_rounded,
          color: Colors.green.shade700,
        );

      case ConsultationStatus.cancelled:
        return _StatusConfig(
          label: 'Отменена',
          icon: Icons.cancel_outlined,
          color: Colors.red,
        );

      case ConsultationStatus.failed:
        return _StatusConfig(
          label: 'Не состоялась',
          icon: Icons.error_outline_rounded,
          color: Colors.red.shade700,
        );

      case ConsultationStatus.expired:
        return _StatusConfig(
          label: 'Истекла',
          icon: Icons.timer_off_outlined,
          color: Colors.grey,
        );
    }
  }
}

/// Status configuration
class _StatusConfig {
  final String label;
  final IconData icon;
  final Color color;

  _StatusConfig({
    required this.label,
    required this.icon,
    required this.color,
  });
}
