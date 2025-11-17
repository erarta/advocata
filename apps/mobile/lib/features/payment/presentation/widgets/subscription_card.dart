import 'package:flutter/material.dart';
import 'package:advocata/features/payment/domain/entities/subscription_entity.dart';

/// Card widget for displaying subscription
class SubscriptionCard extends StatelessWidget {
  final SubscriptionEntity subscription;

  const SubscriptionCard({
    super.key,
    required this.subscription,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: [
              _getPlanColor(subscription.plan),
              _getPlanColor(subscription.plan).withOpacity(0.7),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Plan name and icon
            Row(
              children: [
                Icon(
                  _getPlanIcon(subscription.plan),
                  size: 32,
                  color: Colors.white,
                ),
                const SizedBox(width: 12),
                Text(
                  subscription.planDisplayName,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Description
            Text(
              subscription.planDescription,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),

            // Stats row
            Row(
              children: [
                Expanded(
                  child: _buildStatBox(
                    label: 'Цена',
                    value: subscription.plan == SubscriptionPlan.free
                        ? 'Бесплатно'
                        : '${subscription.monthlyPrice.toStringAsFixed(0)}₽/мес',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatBox(
                    label: 'Осталось дней',
                    value: subscription.remainingDays.toString(),
                  ),
                ),
              ],
            ),

            // Expiring soon warning
            if (subscription.isExpiringSoon && !subscription.isCancelled) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.white.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.warning_amber_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Подписка истекает скоро. Продлите для продолжения доступа.',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Cancelled indicator
            if (subscription.isCancelled) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.white.withOpacity(0.3)),
                ),
                child: Row(
                  children: const [
                    Icon(
                      Icons.info_outline,
                      color: Colors.white,
                      size: 20,
                    ),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Подписка отменена',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Build stat box
  Widget _buildStatBox({required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  /// Get plan color
  Color _getPlanColor(SubscriptionPlan plan) {
    switch (plan) {
      case SubscriptionPlan.free:
        return Colors.grey.shade600;
      case SubscriptionPlan.basic:
        return Colors.blue.shade600;
      case SubscriptionPlan.pro:
        return Colors.purple.shade600;
      case SubscriptionPlan.enterprise:
        return Colors.amber.shade700;
    }
  }

  /// Get plan icon
  IconData _getPlanIcon(SubscriptionPlan plan) {
    switch (plan) {
      case SubscriptionPlan.free:
        return Icons.star_border_rounded;
      case SubscriptionPlan.basic:
        return Icons.star_half_rounded;
      case SubscriptionPlan.pro:
        return Icons.star_rounded;
      case SubscriptionPlan.enterprise:
        return Icons.workspace_premium_rounded;
    }
  }
}
