import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:advocata/features/payment/domain/repositories/subscription_repository.dart';
import 'package:advocata/features/payment/presentation/providers/payment_providers.dart';
import 'package:advocata/features/payment/presentation/providers/payment_state.dart';
import 'package:advocata/features/payment/presentation/providers/payment_notifier.dart';
import 'package:advocata/features/payment/presentation/widgets/plan_card.dart';
import 'package:advocata/core/presentation/widgets/buttons/primary_button.dart';

/// Screen for viewing and selecting subscription plans
class SubscriptionPlansScreen extends ConsumerStatefulWidget {
  const SubscriptionPlansScreen({super.key});

  @override
  ConsumerState<SubscriptionPlansScreen> createState() =>
      _SubscriptionPlansScreenState();
}

class _SubscriptionPlansScreenState
    extends ConsumerState<SubscriptionPlansScreen> {
  String? _selectedPlan;
  String _selectedPaymentMethod = 'bank_card';

  @override
  Widget build(BuildContext context) {
    final plansAsync = ref.watch(availablePlansProvider);
    final activeSubscriptionAsync = ref.watch(activeSubscriptionProvider);

    // Listen for subscription creation state
    ref.listen<SubscriptionCreationState>(
      subscriptionCreationNotifierProvider,
      (previous, state) {
        state.whenOrNull(
          success: (subscription) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Подписка успешно оформлена!'),
                backgroundColor: Colors.green,
              ),
            );
            context.go('/subscriptions/manage');
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

    final creationState = ref.watch(subscriptionCreationNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Выбрать план'),
      ),
      body: plansAsync.when(
        data: (plans) {
          if (plans.isEmpty) {
            return const Center(child: Text('Планы недоступны'));
          }

          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Header
                    const Text(
                      'Выберите подходящий план',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Все планы включают доступ к верифицированным юристам',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Current plan indicator
                    activeSubscriptionAsync.when(
                      data: (subscription) {
                        if (subscription != null) {
                          return Container(
                            padding: const EdgeInsets.all(16),
                            margin: const EdgeInsets.only(bottom: 24),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.blue.shade200),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.info_outline,
                                    color: Colors.blue.shade700),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    'Текущий план: ${subscription.planDisplayName}',
                                    style: TextStyle(
                                      color: Colors.blue.shade700,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }
                        return const SizedBox.shrink();
                      },
                      loading: () => const SizedBox.shrink(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),

                    // Plans
                    ...plans.map((plan) => Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: PlanCard(
                            plan: plan,
                            isSelected: _selectedPlan == plan.plan,
                            isCurrentPlan: activeSubscriptionAsync.value?.plan
                                    .name ==
                                plan.plan,
                            onTap: () {
                              setState(() {
                                _selectedPlan = plan.plan;
                              });
                            },
                          ),
                        )),

                    // Payment method selector (if plan selected and not free)
                    if (_selectedPlan != null && _selectedPlan != 'free') ...[
                      const SizedBox(height: 24),
                      const Text(
                        'Способ оплаты',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildPaymentMethodSelector(),
                    ],
                  ],
                ),
              ),

              // Bottom action bar
              if (_selectedPlan != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 10,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: SafeArea(
                    child: creationState.maybeWhen(
                      loading: () =>
                          const Center(child: CircularProgressIndicator()),
                      orElse: () => PrimaryButton(
                        text: _selectedPlan == 'free'
                            ? 'Выбрать бесплатный план'
                            : 'Оформить подписку',
                        onPressed: _onSubscribe,
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Ошибка загрузки планов: $error'),
        ),
      ),
    );
  }

  /// Build payment method selector
  Widget _buildPaymentMethodSelector() {
    final methods = [
      {'value': 'bank_card', 'label': 'Банковская карта', 'icon': Icons.credit_card},
      {'value': 'sbp', 'label': 'СБП', 'icon': Icons.qr_code_scanner},
      {'value': 'yoomoney', 'label': 'ЮMoney', 'icon': Icons.account_balance_wallet},
    ];

    return Column(
      children: methods.map((method) {
        final isSelected = _selectedPaymentMethod == method['value'];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: InkWell(
            onTap: () {
              setState(() {
                _selectedPaymentMethod = method['value'] as String;
              });
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(
                  color: isSelected ? Colors.blue : Colors.grey.shade300,
                  width: isSelected ? 2 : 1,
                ),
                borderRadius: BorderRadius.circular(12),
                color: isSelected ? Colors.blue.shade50 : null,
              ),
              child: Row(
                children: [
                  Icon(
                    method['icon'] as IconData,
                    color: isSelected ? Colors.blue : Colors.grey,
                  ),
                  const SizedBox(width: 16),
                  Text(
                    method['label'] as String,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      color: isSelected ? Colors.blue : Colors.black,
                    ),
                  ),
                  const Spacer(),
                  if (isSelected)
                    const Icon(Icons.check_circle, color: Colors.blue),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  /// Handle subscribe
  void _onSubscribe() {
    if (_selectedPlan == null) return;

    ref.read(subscriptionCreationNotifierProvider.notifier).createSubscription(
          plan: _selectedPlan!,
          paymentMethod: _selectedPaymentMethod,
        );
  }
}
