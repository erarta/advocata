import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/subscription_entity.dart';
import 'package:advocata/features/payment/domain/repositories/subscription_repository.dart';

/// Parameters for creating subscription
class CreateSubscriptionParams {
  final String plan; // 'free', 'basic', 'pro', 'enterprise'
  final String paymentMethod;

  const CreateSubscriptionParams({
    required this.plan,
    required this.paymentMethod,
  });

  /// Validate parameters
  Result<void> validate() {
    final validPlans = ['free', 'basic', 'pro', 'enterprise'];
    if (!validPlans.contains(plan)) {
      return Result.fail('Неверный план подписки');
    }

    // Free plan doesn't require payment method
    if (plan != 'free') {
      final validMethods = [
        'bank_card',
        'yoomoney',
        'qiwi',
        'sbp',
        'sberbank',
        'tinkoff',
      ];

      if (!validMethods.contains(paymentMethod)) {
        return Result.fail('Неверный способ оплаты');
      }
    }

    return Result.ok(null);
  }
}

/// Use case for creating subscription
class CreateSubscriptionUseCase {
  final SubscriptionRepository repository;

  CreateSubscriptionUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with SubscriptionEntity or error
  Future<Result<SubscriptionEntity>> execute(
    CreateSubscriptionParams params,
  ) async {
    // Validate parameters
    final validationResult = params.validate();
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Create subscription via repository
    return await repository.createSubscription(
      plan: params.plan,
      paymentMethod: params.paymentMethod,
    );
  }
}
