import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/subscription_entity.dart';

/// Subscription plan info DTO
class SubscriptionPlanInfo {
  final String plan;
  final double monthlyPrice;
  final int consultationsLimit;
  final String description;
  final List<String> features;

  const SubscriptionPlanInfo({
    required this.plan,
    required this.monthlyPrice,
    required this.consultationsLimit,
    required this.description,
    required this.features,
  });
}

/// Repository interface for subscriptions
abstract class SubscriptionRepository {
  /// Create new subscription
  ///
  /// Returns Result with SubscriptionEntity on success
  Future<Result<SubscriptionEntity>> createSubscription({
    required String plan,
    required String paymentMethod,
  });

  /// Get user's active subscription
  ///
  /// Returns Result with SubscriptionEntity or null if no active subscription
  Future<Result<SubscriptionEntity?>> getActiveSubscription();

  /// Get all available subscription plans
  ///
  /// Returns Result with list of plan information
  Future<Result<List<SubscriptionPlanInfo>>> getAvailablePlans();

  /// Cancel subscription
  ///
  /// Returns Result with updated SubscriptionEntity
  Future<Result<SubscriptionEntity>> cancelSubscription({
    required String subscriptionId,
    String? reason,
  });

  /// Renew subscription
  ///
  /// Returns Result with updated SubscriptionEntity
  Future<Result<SubscriptionEntity>> renewSubscription(String subscriptionId);

  /// Change subscription plan
  ///
  /// Returns Result with updated SubscriptionEntity
  Future<Result<SubscriptionEntity>> changePlan({
    required String subscriptionId,
    required String newPlan,
  });

  /// Use consultation from subscription
  ///
  /// Returns Result with updated SubscriptionEntity
  Future<Result<SubscriptionEntity>> useConsultation(String subscriptionId);
}
