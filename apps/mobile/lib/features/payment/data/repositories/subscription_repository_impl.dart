import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/subscription_entity.dart';
import 'package:advocata/features/payment/domain/repositories/subscription_repository.dart';
import 'package:advocata/features/payment/data/datasources/subscription_remote_datasource.dart';

/// Implementation of SubscriptionRepository
class SubscriptionRepositoryImpl implements SubscriptionRepository {
  final SubscriptionRemoteDataSource _remoteDataSource;

  SubscriptionRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<SubscriptionEntity>> createSubscription({
    required String plan,
    required String paymentMethod,
  }) async {
    try {
      final model = await _remoteDataSource.createSubscription(
        plan: plan,
        paymentMethod: paymentMethod,
      );
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<SubscriptionEntity?>> getActiveSubscription() async {
    try {
      final model = await _remoteDataSource.getActiveSubscription();

      if (model == null) {
        return Result.ok(null);
      }

      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<List<SubscriptionPlanInfo>>> getAvailablePlans() async {
    try {
      final plans = await _remoteDataSource.getAvailablePlans();
      return Result.ok(plans);
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<SubscriptionEntity>> cancelSubscription({
    required String subscriptionId,
    String? reason,
  }) async {
    try {
      final model = await _remoteDataSource.cancelSubscription(
        subscriptionId: subscriptionId,
        reason: reason,
      );
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<SubscriptionEntity>> renewSubscription(
    String subscriptionId,
  ) async {
    try {
      final model = await _remoteDataSource.renewSubscription(subscriptionId);
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<SubscriptionEntity>> changePlan({
    required String subscriptionId,
    required String newPlan,
  }) async {
    try {
      final model = await _remoteDataSource.changePlan(
        subscriptionId: subscriptionId,
        newPlan: newPlan,
      );
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<SubscriptionEntity>> useConsultation(
    String subscriptionId,
  ) async {
    // This would typically be called automatically by the backend
    // when a consultation is created
    // For now, we'll just fetch the current subscription
    return getActiveSubscription().then((result) {
      if (result.isSuccess && result.value != null) {
        return Result.ok(result.value!);
      }
      return Result.fail('Не удалось обновить использование подписки');
    });
  }
}
