import 'package:flutter/material.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';

/// Badge widget for displaying payment status
class PaymentStatusBadge extends StatelessWidget {
  final PaymentStatus status;
  final bool compact;

  const PaymentStatusBadge({
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
  _StatusConfig _getStatusConfig(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.pending:
        return _StatusConfig(
          label: 'Ожидает',
          icon: Icons.schedule_rounded,
          color: Colors.orange,
        );

      case PaymentStatus.processing:
        return _StatusConfig(
          label: 'Обработка',
          icon: Icons.sync_rounded,
          color: Colors.blue,
        );

      case PaymentStatus.succeeded:
        return _StatusConfig(
          label: 'Оплачено',
          icon: Icons.check_circle_rounded,
          color: Colors.green,
        );

      case PaymentStatus.failed:
        return _StatusConfig(
          label: 'Ошибка',
          icon: Icons.error_outline_rounded,
          color: Colors.red,
        );

      case PaymentStatus.refundPending:
        return _StatusConfig(
          label: 'Возврат',
          icon: Icons.pending_outlined,
          color: Colors.orange,
        );

      case PaymentStatus.refunded:
        return _StatusConfig(
          label: 'Возвращено',
          icon: Icons.undo_rounded,
          color: Colors.purple,
        );

      case PaymentStatus.cancelled:
        return _StatusConfig(
          label: 'Отменено',
          icon: Icons.cancel_outlined,
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
