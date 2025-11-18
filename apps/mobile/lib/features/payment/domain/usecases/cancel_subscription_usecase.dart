import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/subscription_entity.dart';
import 'package:advocata/features/payment/domain/repositories/subscription_repository.dart';

/// Parameters for canceling subscription
class CancelSubscriptionParams {
  final String subscriptionId;
  final String? reason;

  const CancelSubscriptionParams({
    required this.subscriptionId,
    this.reason,
  });

  /// Validate parameters
  Result<void> validate() {
    if (subscriptionId.isEmpty) {
      return Result.fail('ID подписки не указан');
    }

    if (reason != null && reason!.length > 500) {
      return Result.fail('Причина отмены не может быть длиннее 500 символов');
    }

    return Result.ok(null);
  }
}

/// Use case for canceling subscription
class CancelSubscriptionUseCase {
  final SubscriptionRepository repository;

  CancelSubscriptionUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with updated SubscriptionEntity or error
  Future<Result<SubscriptionEntity>> execute(
    CancelSubscriptionParams params,
  ) async {
    // Validate parameters
    final validationResult = params.validate();
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Cancel subscription via repository
    return await repository.cancelSubscription(
      subscriptionId: params.subscriptionId,
      reason: params.reason,
    );
  }
}
