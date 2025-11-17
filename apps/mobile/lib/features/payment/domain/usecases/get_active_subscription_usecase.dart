import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/subscription_entity.dart';
import 'package:advocata/features/payment/domain/repositories/subscription_repository.dart';

/// Use case for getting user's active subscription
class GetActiveSubscriptionUseCase {
  final SubscriptionRepository repository;

  GetActiveSubscriptionUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with SubscriptionEntity or null if no active subscription
  Future<Result<SubscriptionEntity?>> execute() async {
    return await repository.getActiveSubscription();
  }
}
