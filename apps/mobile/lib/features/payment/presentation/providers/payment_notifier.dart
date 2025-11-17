import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:advocata/features/payment/domain/usecases/create_consultation_payment_usecase.dart';
import 'package:advocata/features/payment/domain/usecases/get_payment_history_usecase.dart';
import 'package:advocata/features/payment/domain/usecases/request_refund_usecase.dart';
import 'package:advocata/features/payment/domain/usecases/create_subscription_usecase.dart';
import 'package:advocata/features/payment/domain/usecases/cancel_subscription_usecase.dart';
import 'package:advocata/features/payment/presentation/providers/payment_state.dart';
import 'package:advocata/features/payment/presentation/providers/payment_providers.dart';

// ============================================================================
// PAYMENT HISTORY NOTIFIER
// ============================================================================

/// Notifier for managing payment history
class PaymentHistoryNotifier extends StateNotifier<PaymentHistoryState> {
  final GetPaymentHistoryUseCase _getPaymentHistoryUseCase;

  PaymentHistoryNotifier(this._getPaymentHistoryUseCase)
      : super(const PaymentHistoryState.initial());

  /// Load payment history
  Future<void> loadPayments({String? status}) async {
    state = const PaymentHistoryState.loading();

    final params = GetPaymentHistoryParams(status: status);
    final result = await _getPaymentHistoryUseCase.execute(params);

    result.when(
      success: (payments) {
        state = PaymentHistoryState.loaded(payments);
      },
      failure: (error) {
        state = PaymentHistoryState.error(error);
      },
    );
  }

  /// Refresh payment history
  Future<void> refresh({String? status}) async {
    await loadPayments(status: status);
  }
}

/// Provider for payment history notifier
final paymentHistoryNotifierProvider =
    StateNotifierProvider<PaymentHistoryNotifier, PaymentHistoryState>(
  (ref) {
    final useCase = ref.watch(getPaymentHistoryUseCaseProvider);
    return PaymentHistoryNotifier(useCase);
  },
);

// ============================================================================
// PAYMENT CREATION NOTIFIER
// ============================================================================

/// Notifier for creating payments
class PaymentCreationNotifier extends StateNotifier<PaymentCreationState> {
  final CreateConsultationPaymentUseCase _createConsultationPaymentUseCase;

  PaymentCreationNotifier(this._createConsultationPaymentUseCase)
      : super(const PaymentCreationState.initial());

  /// Create consultation payment
  Future<void> createConsultationPayment({
    required String consultationId,
    required double amount,
    required String paymentMethod,
  }) async {
    state = const PaymentCreationState.loading();

    final params = CreateConsultationPaymentParams(
      consultationId: consultationId,
      amount: amount,
      paymentMethod: paymentMethod,
    );

    final result = await _createConsultationPaymentUseCase.execute(params);

    result.when(
      success: (payment) {
        state = PaymentCreationState.success(payment);
      },
      failure: (error) {
        state = PaymentCreationState.error(error);
      },
    );
  }

  /// Reset state
  void reset() {
    state = const PaymentCreationState.initial();
  }
}

/// Provider for payment creation notifier
final paymentCreationNotifierProvider =
    StateNotifierProvider<PaymentCreationNotifier, PaymentCreationState>(
  (ref) {
    final useCase = ref.watch(createConsultationPaymentUseCaseProvider);
    return PaymentCreationNotifier(useCase);
  },
);

// ============================================================================
// REFUND NOTIFIER
// ============================================================================

/// Notifier for requesting refunds
class RefundNotifier extends StateNotifier<RefundState> {
  final RequestRefundUseCase _requestRefundUseCase;

  RefundNotifier(this._requestRefundUseCase)
      : super(const RefundState.initial());

  /// Request refund
  Future<void> requestRefund({
    required String paymentId,
    required String reason,
    double? amount,
  }) async {
    state = const RefundState.loading();

    final params = RequestRefundParams(
      paymentId: paymentId,
      reason: reason,
      amount: amount,
    );

    final result = await _requestRefundUseCase.execute(params);

    result.when(
      success: (_) {
        state = const RefundState.success();
      },
      failure: (error) {
        state = RefundState.error(error);
      },
    );
  }

  /// Reset state
  void reset() {
    state = const RefundState.initial();
  }
}

/// Provider for refund notifier
final refundNotifierProvider =
    StateNotifierProvider<RefundNotifier, RefundState>(
  (ref) {
    final useCase = ref.watch(requestRefundUseCaseProvider);
    return RefundNotifier(useCase);
  },
);

// ============================================================================
// SUBSCRIPTION CREATION NOTIFIER
// ============================================================================

/// Notifier for creating subscriptions
class SubscriptionCreationNotifier
    extends StateNotifier<SubscriptionCreationState> {
  final CreateSubscriptionUseCase _createSubscriptionUseCase;

  SubscriptionCreationNotifier(this._createSubscriptionUseCase)
      : super(const SubscriptionCreationState.initial());

  /// Create subscription
  Future<void> createSubscription({
    required String plan,
    required String paymentMethod,
  }) async {
    state = const SubscriptionCreationState.loading();

    final params = CreateSubscriptionParams(
      plan: plan,
      paymentMethod: paymentMethod,
    );

    final result = await _createSubscriptionUseCase.execute(params);

    result.when(
      success: (subscription) {
        state = SubscriptionCreationState.success(subscription);
      },
      failure: (error) {
        state = SubscriptionCreationState.error(error);
      },
    );
  }

  /// Reset state
  void reset() {
    state = const SubscriptionCreationState.initial();
  }
}

/// Provider for subscription creation notifier
final subscriptionCreationNotifierProvider = StateNotifierProvider<
    SubscriptionCreationNotifier, SubscriptionCreationState>(
  (ref) {
    final useCase = ref.watch(createSubscriptionUseCaseProvider);
    return SubscriptionCreationNotifier(useCase);
  },
);

// ============================================================================
// SUBSCRIPTION CANCELLATION NOTIFIER
// ============================================================================

/// Notifier for canceling subscriptions
class SubscriptionCancellationNotifier
    extends StateNotifier<SubscriptionCancellationState> {
  final CancelSubscriptionUseCase _cancelSubscriptionUseCase;

  SubscriptionCancellationNotifier(this._cancelSubscriptionUseCase)
      : super(const SubscriptionCancellationState.initial());

  /// Cancel subscription
  Future<void> cancelSubscription({
    required String subscriptionId,
    String? reason,
  }) async {
    state = const SubscriptionCancellationState.loading();

    final params = CancelSubscriptionParams(
      subscriptionId: subscriptionId,
      reason: reason,
    );

    final result = await _cancelSubscriptionUseCase.execute(params);

    result.when(
      success: (_) {
        state = const SubscriptionCancellationState.success();
      },
      failure: (error) {
        state = SubscriptionCancellationState.error(error);
      },
    );
  }

  /// Reset state
  void reset() {
    state = const SubscriptionCancellationState.initial();
  }
}

/// Provider for subscription cancellation notifier
final subscriptionCancellationNotifierProvider = StateNotifierProvider<
    SubscriptionCancellationNotifier, SubscriptionCancellationState>(
  (ref) {
    final useCase = ref.watch(cancelSubscriptionUseCaseProvider);
    return SubscriptionCancellationNotifier(useCase);
  },
);
