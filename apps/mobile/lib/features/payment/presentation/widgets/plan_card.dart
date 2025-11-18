import 'package:flutter/material.dart';
import 'package:advocata/features/payment/domain/repositories/subscription_repository.dart';

/// Card widget for displaying subscription plan option
class PlanCard extends StatelessWidget {
  final SubscriptionPlanInfo plan;
  final bool isSelected;
  final bool isCurrentPlan;
  final VoidCallback? onTap;

  const PlanCard({
    super.key,
    required this.plan,
    this.isSelected = false,
    this.isCurrentPlan = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isPopular = plan.plan == 'pro';

    return Stack(
      clipBehavior: Clip.none,
      children: [
        // Main card
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected
                    ? _getPlanColor(plan.plan)
                    : Colors.grey.shade300,
                width: isSelected ? 2 : 1,
              ),
              color: isSelected
                  ? _getPlanColor(plan.plan).withOpacity(0.05)
                  : Colors.white,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    Icon(
                      _getPlanIcon(plan.plan),
                      size: 32,
                      color: _getPlanColor(plan.plan),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _getPlanName(plan.plan),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            plan.description,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (isSelected)
                      Icon(
                        Icons.check_circle,
                        color: _getPlanColor(plan.plan),
                      ),
                  ],
                ),
                const SizedBox(height: 16),

                // Price
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      plan.monthlyPrice == 0
                          ? 'Бесплатно'
                          : '${plan.monthlyPrice.toStringAsFixed(0)}₽',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: _getPlanColor(plan.plan),
                      ),
                    ),
                    if (plan.monthlyPrice > 0) ...[
                      const SizedBox(width: 4),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text(
                          '/месяц',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 16),

                // Consultations limit
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: _getPlanColor(plan.plan).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.balance_rounded,
                        size: 16,
                        color: _getPlanColor(plan.plan),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        plan.consultationsLimit == -1
                            ? 'Безлимитные консультации'
                            : '${plan.consultationsLimit} консультаций/мес',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: _getPlanColor(plan.plan),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Features
                ...plan.features.map((feature) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          Icon(
                            Icons.check_circle_outline,
                            size: 18,
                            color: _getPlanColor(plan.plan),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              feature,
                              style: const TextStyle(fontSize: 13),
                            ),
                          ),
                        ],
                      ),
                    )),

                // Current plan indicator
                if (isCurrentPlan) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: Colors.green.shade200),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.verified,
                          size: 14,
                          color: Colors.green.shade700,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Текущий план',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.green.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),

        // Popular badge
        if (isPopular)
          Positioned(
            top: -10,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.amber,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.amber.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.star, size: 14, color: Colors.white),
                  SizedBox(width: 4),
                  Text(
                    'Популярный',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  /// Get plan name
  String _getPlanName(String plan) {
    switch (plan) {
      case 'free':
        return 'Бесплатный';
      case 'basic':
        return 'Базовый';
      case 'pro':
        return 'Профессиональный';
      case 'enterprise':
        return 'Корпоративный';
      default:
        return plan;
    }
  }

  /// Get plan color
  Color _getPlanColor(String plan) {
    switch (plan) {
      case 'free':
        return Colors.grey.shade600;
      case 'basic':
        return Colors.blue.shade600;
      case 'pro':
        return Colors.purple.shade600;
      case 'enterprise':
        return Colors.amber.shade700;
      default:
        return Colors.grey.shade600;
    }
  }

  /// Get plan icon
  IconData _getPlanIcon(String plan) {
    switch (plan) {
      case 'free':
        return Icons.star_border_rounded;
      case 'basic':
        return Icons.star_half_rounded;
      case 'pro':
        return Icons.star_rounded;
      case 'enterprise':
        return Icons.workspace_premium_rounded;
      default:
        return Icons.star_border_rounded;
    }
  }
}
