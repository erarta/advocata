import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';
import 'package:advocata/features/payment/domain/entities/subscription_entity.dart';

part 'payment_state.freezed.dart';

/// State for payment history list
@freezed
class PaymentHistoryState with _$PaymentHistoryState {
  const factory PaymentHistoryState.initial() = _Initial;
  const factory PaymentHistoryState.loading() = _Loading;
  const factory PaymentHistoryState.loaded(List<PaymentEntity> payments) =
      _Loaded;
  const factory PaymentHistoryState.error(String message) = _Error;
}

/// State for payment creation
@freezed
class PaymentCreationState with _$PaymentCreationState {
  const factory PaymentCreationState.initial() = _PaymentCreationInitial;
  const factory PaymentCreationState.loading() = _PaymentCreationLoading;
  const factory PaymentCreationState.success(PaymentEntity payment) =
      _PaymentCreationSuccess;
  const factory PaymentCreationState.error(String message) =
      _PaymentCreationError;
}

/// State for refund request
@freezed
class RefundState with _$RefundState {
  const factory RefundState.initial() = _RefundInitial;
  const factory RefundState.loading() = _RefundLoading;
  const factory RefundState.success() = _RefundSuccess;
  const factory RefundState.error(String message) = _RefundError;
}

/// State for subscription creation
@freezed
class SubscriptionCreationState with _$SubscriptionCreationState {
  const factory SubscriptionCreationState.initial() =
      _SubscriptionCreationInitial;
  const factory SubscriptionCreationState.loading() =
      _SubscriptionCreationLoading;
  const factory SubscriptionCreationState.success(
      SubscriptionEntity subscription) = _SubscriptionCreationSuccess;
  const factory SubscriptionCreationState.error(String message) =
      _SubscriptionCreationError;
}

/// State for subscription cancellation
@freezed
class SubscriptionCancellationState with _$SubscriptionCancellationState {
  const factory SubscriptionCancellationState.initial() =
      _SubscriptionCancellationInitial;
  const factory SubscriptionCancellationState.loading() =
      _SubscriptionCancellationLoading;
  const factory SubscriptionCancellationState.success() =
      _SubscriptionCancellationSuccess;
  const factory SubscriptionCancellationState.error(String message) =
      _SubscriptionCancellationError;
}
