import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:advocata/features/payment/domain/entities/subscription_entity.dart';
import 'package:advocata/features/payment/presentation/providers/payment_providers.dart';
import 'package:advocata/features/payment/presentation/providers/payment_state.dart';
import 'package:advocata/features/payment/presentation/providers/payment_notifier.dart';
import 'package:advocata/features/payment/presentation/widgets/subscription_card.dart';
import 'package:advocata/core/presentation/widgets/buttons/primary_button.dart';
import 'package:advocata/core/presentation/widgets/buttons/secondary_button.dart';
import 'package:intl/intl.dart';

/// Screen for managing user's subscription
class SubscriptionManagementScreen extends ConsumerWidget {
  const SubscriptionManagementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final subscriptionAsync = ref.watch(activeSubscriptionProvider);

    // Listen for cancellation state
    ref.listen<SubscriptionCancellationState>(
      subscriptionCancellationNotifierProvider,
      (previous, state) {
        state.whenOrNull(
          success: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Подписка отменена'),
                backgroundColor: Colors.green,
              ),
            );
            // Refresh subscription
            ref.invalidate(activeSubscriptionProvider);
          },
          error: (message) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(message),
                backgroundColor: Colors.red,
              ),
            );
          },
        );
      },
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Моя подписка'),
      ),
      body: subscriptionAsync.when(
        data: (subscription) {
          if (subscription == null) {
            return _buildNoSubscription(context);
          }
          return _buildSubscriptionDetails(context, ref, subscription);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Ошибка: $error'),
        ),
      ),
    );
  }

  /// Build no subscription view
  Widget _buildNoSubscription(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.card_membership_rounded,
              size: 80,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 24),
            const Text(
              'У вас нет активной подписки',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Оформите подписку для доступа к консультациям',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            PrimaryButton(
              text: 'Выбрать план',
              onPressed: () => context.push('/subscriptions/plans'),
            ),
          ],
        ),
      ),
    );
  }

  /// Build subscription details
  Widget _buildSubscriptionDetails(
    BuildContext context,
    WidgetRef ref,
    SubscriptionEntity subscription,
  ) {
    final cancellationState =
        ref.watch(subscriptionCancellationNotifierProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Subscription card
          SubscriptionCard(subscription: subscription),
          const SizedBox(height: 24),

          // Plan details
          _buildPlanDetails(subscription),
          const SizedBox(height: 24),

          // Usage progress
          _buildUsageProgress(subscription),
          const SizedBox(height: 24),

          // Billing info
          _buildBillingInfo(subscription),
          const SizedBox(height: 32),

          // Actions
          if (!subscription.isCancelled) ...[
            SecondaryButton(
              text: 'Изменить план',
              onPressed: () => context.push('/subscriptions/plans'),
            ),
            const SizedBox(height: 12),
            cancellationState.maybeWhen(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              orElse: () => OutlinedButton(
                onPressed: () => _showCancelDialog(context, ref, subscription),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                ),
                child: const Text('Отменить подписку'),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.orange.shade200),
              ),
              child: Column(
                children: [
                  Icon(Icons.info_outline, color: Colors.orange.shade700),
                  const SizedBox(height: 8),
                  Text(
                    'Подписка отменена',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: Colors.orange.shade700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Подписка будет активна до ${_formatDate(subscription.endDate)}',
                    style: const TextStyle(fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              text: 'Возобновить подписку',
              onPressed: () => context.push('/subscriptions/plans'),
            ),
          ],
        ],
      ),
    );
  }

  /// Build plan details
  Widget _buildPlanDetails(SubscriptionEntity subscription) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Детали плана',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            _buildDetailRow(
              icon: Icons.star_rounded,
              label: 'План',
              value: subscription.planDisplayName,
            ),
            const SizedBox(height: 12),
            _buildDetailRow(
              icon: Icons.attach_money,
              label: 'Стоимость',
              value: '${subscription.monthlyPrice.toStringAsFixed(0)}₽/месяц',
            ),
            const SizedBox(height: 12),
            _buildDetailRow(
              icon: Icons.event_rounded,
              label: 'Консультации',
              value: subscription.planDescription,
            ),
          ],
        ),
      ),
    );
  }

  /// Build usage progress
  Widget _buildUsageProgress(SubscriptionEntity subscription) {
    final progress = subscription.consultationsLimit == -1
        ? 1.0
        : subscription.consultationsUsed / subscription.consultationsLimit;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Использование',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  subscription.consultationsLimit == -1
                      ? 'Использовано: ${subscription.consultationsUsed}'
                      : 'Использовано: ${subscription.consultationsUsed} из ${subscription.consultationsLimit}',
                  style: const TextStyle(fontSize: 14),
                ),
                if (subscription.consultationsLimit != -1)
                  Text(
                    'Осталось: ${subscription.remainingConsultations}',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
              ],
            ),
            if (subscription.consultationsLimit != -1) ...[
              const SizedBox(height: 12),
              LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(4),
              ),
            ],
          ],
        ),
      ),
    );
  }

  /// Build billing info
  Widget _buildBillingInfo(SubscriptionEntity subscription) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Информация о подписке',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            _buildDetailRow(
              icon: Icons.calendar_today_rounded,
              label: 'Дата начала',
              value: _formatDate(subscription.startDate),
            ),
            const SizedBox(height: 12),
            _buildDetailRow(
              icon: Icons.event_rounded,
              label: 'Дата окончания',
              value: _formatDate(subscription.endDate),
            ),
            if (subscription.nextBillingDate != null) ...[
              const SizedBox(height: 12),
              _buildDetailRow(
                icon: Icons.payment_rounded,
                label: 'Следующее списание',
                value: _formatDate(subscription.nextBillingDate!),
              ),
            ],
            const SizedBox(height: 12),
            _buildDetailRow(
              icon: Icons.access_time_rounded,
              label: 'Осталось дней',
              value: subscription.remainingDays.toString(),
            ),
          ],
        ),
      ),
    );
  }

  /// Build detail row
  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey),
        const SizedBox(width: 12),
        Text(
          '$label:',
          style: const TextStyle(
            fontSize: 14,
            color: Colors.grey,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  /// Show cancel dialog
  void _showCancelDialog(
    BuildContext context,
    WidgetRef ref,
    SubscriptionEntity subscription,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Отменить подписку?'),
        content: Text(
          'Подписка будет активна до ${_formatDate(subscription.endDate)}. '
          'После этого доступ к консультациям будет ограничен.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref
                  .read(subscriptionCancellationNotifierProvider.notifier)
                  .cancelSubscription(
                    subscriptionId: subscription.id,
                  );
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Отменить подписку'),
          ),
        ],
      ),
    );
  }

  /// Format date
  String _formatDate(DateTime date) {
    return DateFormat('dd.MM.yyyy').format(date);
  }
}
