import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';
import 'package:advocata/features/payment/presentation/providers/payment_state.dart';
import 'package:advocata/features/payment/presentation/providers/payment_notifier.dart';
import 'package:advocata/features/payment/presentation/widgets/payment_card.dart';
import 'package:advocata/core/presentation/widgets/common/loading_indicator.dart';
import 'package:advocata/core/presentation/widgets/common/empty_state.dart';
import 'package:advocata/core/presentation/widgets/common/error_state.dart';

/// Screen showing payment history
class PaymentHistoryScreen extends ConsumerStatefulWidget {
  const PaymentHistoryScreen({super.key});

  @override
  ConsumerState<PaymentHistoryScreen> createState() =>
      _PaymentHistoryScreenState();
}

class _PaymentHistoryScreenState extends ConsumerState<PaymentHistoryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    // Load payments on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(paymentHistoryNotifierProvider.notifier).loadPayments();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(paymentHistoryNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('История платежей'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Все'),
            Tab(text: 'Успешные'),
            Tab(text: 'Возвраты'),
          ],
          onTap: (index) => _onTabChanged(index),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => _onRefresh(),
        child: state.when(
          initial: () => const Center(child: Text('Загрузка...')),
          loading: () => const Center(child: LoadingIndicator()),
          loaded: (payments) =>
              _buildPaymentList(payments, _getSelectedStatus()),
          error: (message) => ErrorState(
            message: message,
            onRetry: () => _onRefresh(),
          ),
        ),
      ),
    );
  }

  /// Build payment list
  Widget _buildPaymentList(
    List<PaymentEntity> allPayments,
    String? statusFilter,
  ) {
    // Filter payments by status
    final filteredPayments = statusFilter == null
        ? allPayments
        : allPayments.where((p) {
            switch (statusFilter) {
              case 'succeeded':
                return p.status == PaymentStatus.succeeded;
              case 'refunded':
                return p.status == PaymentStatus.refunded ||
                    p.status == PaymentStatus.refundPending;
              default:
                return true;
            }
          }).toList();

    if (filteredPayments.isEmpty) {
      return EmptyState(
        icon: Icons.payment_rounded,
        title: 'Нет платежей',
        message: _getEmptyMessage(statusFilter),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: filteredPayments.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final payment = filteredPayments[index];
        return PaymentCard(
          payment: payment,
          onTap: () => _onPaymentTap(payment),
        );
      },
    );
  }

  /// Get empty message based on filter
  String _getEmptyMessage(String? statusFilter) {
    switch (statusFilter) {
      case 'succeeded':
        return 'У вас нет успешных платежей';
      case 'refunded':
        return 'У вас нет возвратов';
      default:
        return 'У вас еще нет платежей';
    }
  }

  /// Get selected status filter based on tab index
  String? _getSelectedStatus() {
    switch (_tabController.index) {
      case 0:
        return null; // All
      case 1:
        return 'succeeded';
      case 2:
        return 'refunded';
      default:
        return null;
    }
  }

  /// Handle tab change
  void _onTabChanged(int index) {
    final status = _getSelectedStatus();
    ref.read(paymentHistoryNotifierProvider.notifier).loadPayments(
          status: status,
        );
  }

  /// Handle refresh
  Future<void> _onRefresh() async {
    final status = _getSelectedStatus();
    await ref.read(paymentHistoryNotifierProvider.notifier).refresh(
          status: status,
        );
  }

  /// Handle payment tap
  void _onPaymentTap(PaymentEntity payment) {
    // Navigate to payment detail (to be implemented)
    context.push('/payments/${payment.id}');
  }
}
